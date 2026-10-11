const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const dns = require('dns');
const { promisify } = require('util');
const { OAuth2Client } = require('google-auth-library');
const resolveMx = promisify(dns.resolveMx);
const User = require('../models/User');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Validation schema (shared between signup and login) ──────────────────────
const authSchema = z.object({
  // .toLowerCase().trim() applied here so the stored/queried email is always
  // normalised — "Test@Test.COM" and "test@test.com" are the same account.
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .transform((v) => v.toLowerCase().trim()),
  // .trim() so leading/trailing whitespace in a password field is removed
  // before bcrypt — otherwise "password " ≠ "password" on login.
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .transform((v) => v.trim()),
});

/**
 * Helper: run a DNS MX lookup with a hard timeout so a slow/unreachable DNS
 * server can't hang the signup request for 30+ seconds.
 */
async function verifyEmailDomain(email) {
  const domain = email.split('@')[1];
  const TIMEOUT_MS = 5000;

  const lookup = resolveMx(domain);
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('DNS timeout')), TIMEOUT_MS)
  );

  const mxRecords = await Promise.race([lookup, timeout]);
  if (!mxRecords || mxRecords.length === 0) {
    throw new Error('Email domain cannot receive emails');
  }
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    // Validate + normalise input (Zod throws ZodError on failure)
    const { email, password } = authSchema.parse(req.body);

    // Verify the email domain accepts mail — wrapped in try/catch so a DNS
    // failure returns a clean 400 rather than a 500.
    try {
      await verifyEmailDomain(email);
    } catch (dnsErr) {
      const msg =
        dnsErr.message === 'DNS timeout'
          ? 'Email domain verification timed out. Please try again.'
          : 'Invalid email domain. Please use a real email address.';
      return res.status(400).json({ error: msg });
    }

    // Check if account already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into MongoDB
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      auth_provider: 'local',
    });

    // Sign JWT with the user's MongoDB ObjectId as string
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      token,
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    if (err instanceof z.ZodError) {
      // Return the first human-readable message instead of a raw array
      const message = err.errors?.[0]?.message || 'Invalid input';
      return res.status(400).json({ error: message });
    }
    // body-parser forwards malformed-JSON as a SyntaxError with expose:true
    if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
      return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    // Login uses the same Zod schema so email is normalised identically to
    // signup — the DB lookup will find the right row regardless of casing.
    const { email, password } = authSchema.parse(req.body);

    // Fetch user by normalised email from MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether the email exists — use a generic message
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.password_hash) {
      if (user.auth_provider === 'google') {
        return res.status(400).json({
          error: 'This account was created with Google. Please use "Sign in with Google".',
        });
      }
      console.error('Login: user document has no password_hash', user._id);
      return res.status(500).json({ error: 'Account error. Please contact support.' });
    }

    // Compare supplied password against stored hash
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      token,
      user: { id: user._id.toString(), email: user.email, name: user.name, picture: user.picture },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.errors?.[0]?.message || 'Invalid input';
      return res.status(400).json({ error: message });
    }
    // body-parser forwards malformed-JSON as a SyntaxError with expose:true
    if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
      return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/auth/google ────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential, accessToken, demoUser } = req.body;

    if (!credential && !accessToken && !demoUser) {
      return res.status(400).json({ error: 'Google credential or access token is required' });
    }

    let email, googleId, name, picture;

    if (demoUser && (!process.env.GOOGLE_CLIENT_ID || process.env.NODE_ENV !== 'production')) {
      email = demoUser.email?.toLowerCase().trim();
      googleId = demoUser.sub || 'google_demo_id';
      name = demoUser.name || 'Demo Google User';
      picture = demoUser.picture || '';
    } else if (credential) {
      // 1. Verify Google ID token from Google Identity Services
      let payload;
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        // Fallback to Google TokenInfo endpoint
        try {
          const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
          if (!verifyRes.ok) {
            throw new Error('Token verification failed');
          }
          payload = await verifyRes.json();
        } catch (fallbackErr) {
          console.error('Google token verification failed:', verifyErr.message);
          return res.status(401).json({ error: 'Invalid Google credential token' });
        }
      }

      if (!payload || !payload.email) {
        return res.status(400).json({ error: 'Could not retrieve email from Google account' });
      }

      email = payload.email.toLowerCase().trim();
      googleId = payload.sub;
      name = payload.name || '';
      picture = payload.picture || '';
    } else if (accessToken) {
      // 2. Verify with Google OAuth2 userinfo endpoint
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userinfoRes.ok) {
        return res.status(401).json({ error: 'Invalid Google access token' });
      }
      const data = await userinfoRes.json();
      email = data.email?.toLowerCase().trim();
      googleId = data.sub;
      name = data.name || '';
      picture = data.picture || '';
    }

    if (!email) {
      return res.status(400).json({ error: 'Unable to get email from Google account' });
    }

    // Find or create user in MongoDB Atlas
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        google_id: googleId,
        auth_provider: 'google',
        name,
        picture,
      });
    } else {
      let modified = false;
      if (!user.google_id) {
        user.google_id = googleId;
        modified = true;
      }
      if (name && !user.name) {
        user.name = name;
        modified = true;
      }
      if (picture && !user.picture) {
        user.picture = picture;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    }

    // Sign JWT session token
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error('Google Auth route error:', err);
    return res.status(500).json({ error: 'Failed to authenticate with Google. Please try again.' });
  }
});

module.exports = router;
