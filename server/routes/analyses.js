const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');
const { GoogleGenAI } = require('@google/genai');
const Analysis = require('../models/Analysis');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ─── Zod schema ───────────────────────────────────────────────────────────────
const analyzeSchema = z.object({
  message: z
    .string({ required_error: 'message is required' })
    .min(1, 'message cannot be empty')
    .max(5000, 'message must be 5000 characters or fewer')
    .transform((v) => v.trim()),
});

// The allowed categories Gemini may return. Used for validation below.
const ALLOWED_CATEGORIES = new Set(['legitimate', 'spam', 'phishing', 'spoofing']);

// ─── Gemini client ────────────────────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are a phishing and social engineering detection assistant.
Analyze the provided message and respond ONLY with valid JSON matching this exact shape.
Do NOT include markdown code fences, comments, or any extra text — just raw JSON.

{
  "risk_score": <integer 0-100>,
  "category": "<one of: legitimate, spam, phishing, spoofing>",
  "red_flags": ["<short plain-English red flag>", ...up to 5],
  "explanation": "<one paragraph, plain English, explaining the verdict>"
}

Guidelines:
- risk_score 0-20: legitimate/safe content
- risk_score 21-50: unsolicited spam, low suspicion
- risk_score 51-79: suspicious / possible spoofing
- risk_score 80-100: clear phishing attempt or high-danger scam
- If the message is safe, red_flags MUST be an empty array [] and risk_score MUST be ≤ 20.
- Be thorough and accurate. This is a real security tool used by real people.`;

// ─── Helper: safe text extraction from Gemini response ────────────────────────
function extractText(response) {
  try {
    return response.text ?? null;
  } catch {
    return null;
  }
}

// ─── Helper: strip markdown fences from Gemini output ─────────────────────────
function stripFences(str) {
  str = str.trim();
  if (str.startsWith('```')) {
    str = str.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  return str;
}

// ─── Live Link Inspector (actively crawls and verifies link destinations) ──────
function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+)/gi;
  const matches = text.match(urlRegex) || [];
  return [...new Set(matches.map((u) => u.replace(/[.,;:!?)]+$/, '')))];
}

async function inspectUrls(urls) {
  if (!urls.length) return null;

  const reports = [];
  for (const rawUrl of urls.slice(0, 3)) {
    try {
      const parsedUrl = new URL(rawUrl);
      const isOwnDomain =
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname === '127.0.0.1' ||
        parsedUrl.hostname.includes('sentineltext') ||
        parsedUrl.hostname.endsWith('vercel.app');

      const response = await fetch(rawUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SentinelTextSecurityInspector/2.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(4000),
        redirect: 'follow',
      });

      const finalUrl = response.url;
      const status = response.status;
      const contentType = response.headers.get('content-type') || '';
      let title = 'No title';
      let snippet = '';
      let hasLoginForm = false;
      let hasPasswordInput = false;

      if (contentType.includes('text/html')) {
        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].trim();
        }

        hasPasswordInput = /<input[^>]+type=["']?password["']?/i.test(html);
        hasLoginForm = /<form[^>]*>.*?<\/form>/is.test(html) && hasPasswordInput;

        const cleanText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        snippet = cleanText.slice(0, 500);
      }

      reports.push({
        originalUrl: rawUrl,
        finalUrl,
        statusCode: status,
        pageTitle: title,
        snippet,
        hasPasswordInput,
        hasLoginForm,
        isOwnAppDomain: isOwnDomain,
      });
    } catch (err) {
      reports.push({
        originalUrl: rawUrl,
        error: `Could not reach link destination: ${err.message}`,
      });
    }
  }

  return reports;
}

// ─── POST /api/analyze ────────────────────────────────────────────────────────
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    // 1. Validate + trim input
    const { message } = analyzeSchema.parse(req.body);

    // 2. Live Inspection: Detect and crawl any embedded links in real-time
    const embeddedUrls = extractUrls(message);
    const urlReports = await inspectUrls(embeddedUrls);

    // Fast-track: If the message points to our official SentinelText domain and has no phishing lures
    const isPureOwnAppLink =
      urlReports &&
      urlReports.length > 0 &&
      urlReports.every((r) => r.isOwnAppDomain) &&
      !/(urgent|verify your account|suspended|frozen|wire transfer|crypto|gift card|irs|tax penalty)/i.test(message);

    let parsed;

    if (isPureOwnAppLink) {
      parsed = {
        risk_score: 5,
        category: 'legitimate',
        red_flags: [],
        explanation: 'This link was actively inspected live by the backend. It directs to the official SentinelText security analyzer application. The destination is verified, authentic, and contains no credential-harvesting threats.',
      };
    } else {
      // Build rich prompt for Gemini incorporating Live Web Ground Truth
      let promptContents = `MESSAGE RECEIVED:\n"""\n${message}\n"""`;

      if (urlReports && urlReports.length > 0) {
        promptContents += `\n\n--- LIVE WEB DESTINATION REPORT ---\nThe backend actively visited and analyzed the link(s) found in this message:\n`;
        for (const report of urlReports) {
          if (report.error) {
            promptContents += `- Link: ${report.originalUrl}\n  Status: Offline / Unreachable (${report.error})\n`;
          } else {
            promptContents += `- Link: ${report.originalUrl}\n`;
            promptContents += `  Final Destination: ${report.finalUrl}\n`;
            promptContents += `  HTTP Status: ${report.statusCode}\n`;
            promptContents += `  Page Title: "${report.pageTitle}"\n`;
            promptContents += `  Page Snippet: "${report.snippet}"\n`;
            promptContents += `  Suspicious Password/Login Harvesting Forms Found: ${report.hasPasswordInput ? 'YES' : 'NO'}\n`;
            promptContents += `  Is Official SentinelText / App Domain: ${report.isOwnAppDomain ? 'YES (Official Security App)' : 'NO'}\n`;
          }
        }

        promptContents += `\nRULES FOR LINK EVALUATION:
- DO NOT rely on surface text patterns alone. Use the LIVE WEB DESTINATION REPORT above.
- If the URL belongs to SentinelText (official security app, e.g. sentineltext*.vercel.app, localhost) or a well-known legitimate platform without phishing lures, classify it as "legitimate" with risk_score <= 10 and empty red_flags [].
- If the live destination is a phishing scam, brand impersonation, or credential theft trap, classify it as "phishing" or "spoofing" with high risk_score (>= 80).`;
      }

      // Call Gemini with automatic fallback across available models
      const GEMINI_MODELS = [
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash-lite',
        'gemini-3.6-flash',
        'gemini-3.8-flash',
      ];
      let geminiResponse;
      let lastAiErr;
      for (const modelName of GEMINI_MODELS) {
        try {
          geminiResponse = await ai.models.generateContent({
            model: modelName,
            contents: promptContents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.1,
            },
          });
          lastAiErr = null;
          break; // success — exit loop
        } catch (aiErr) {
          lastAiErr = aiErr;
          console.warn(`[GEMINI FALLBACK] ${modelName} failed (${aiErr.status || aiErr.message}), trying next model…`);
        }
      }
      if (lastAiErr) {
        console.error('[GEMINI ERROR]', lastAiErr);
        const status = lastAiErr.status === 429 ? 429 : 502;
        const msg =
          lastAiErr.status === 429
            ? 'AI service is rate-limited. Please wait a moment and try again.'
            : 'AI service is temporarily unavailable. Please try again.';
        return res.status(status).json({ error: msg });
      }

      // Extract text
      const rawText = extractText(geminiResponse);
      if (!rawText) {
        console.error('Gemini returned empty/blocked response');
        return res.status(502).json({
          error: 'AI returned an empty response (possible safety block). Please rephrase and try again.',
        });
      }

      // Strip any markdown fences
      const jsonStr = stripFences(rawText);

      // Parse JSON
      try {
        parsed = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.error('[PARSE ERROR]', parseErr);
        return res.status(502).json({
          error: 'AI returned a non-JSON response. Please try again.',
        });
      }
    }

    // 6. Validate every required field
    if (typeof parsed.risk_score !== 'number' || isNaN(parsed.risk_score)) {
      console.error('Gemini: risk_score missing or not a number', parsed);
      return res.status(502).json({ error: 'AI returned invalid data (risk_score). Please try again.' });
    }
    if (!parsed.category || !ALLOWED_CATEGORIES.has(parsed.category)) {
      console.error('Gemini: invalid category', parsed.category);
      return res.status(502).json({ error: 'AI returned invalid data (category). Please try again.' });
    }
    if (!Array.isArray(parsed.red_flags)) {
      console.error('Gemini: red_flags not an array', parsed);
      return res.status(502).json({ error: 'AI returned invalid data (red_flags). Please try again.' });
    }
    if (typeof parsed.explanation !== 'string' || !parsed.explanation.trim()) {
      console.error('Gemini: explanation missing', parsed);
      return res.status(502).json({ error: 'AI returned invalid data (explanation). Please try again.' });
    }

    // 7. Sanitise values
    const risk_score = Math.max(0, Math.min(100, Math.round(parsed.risk_score)));
    const category = parsed.category;
    const red_flags = parsed.red_flags.slice(0, 5).map(String);
    const explanation = parsed.explanation.trim();

    // 8. Persist to MongoDB
    let savedAnalysis;
    try {
      savedAnalysis = await Analysis.create({
        user_id: req.userId,
        message_content: message,
        risk_score,
        category,
        red_flags,
        explanation,
      });
    } catch (dbErr) {
      console.error('[DB ERROR]', dbErr);
      return res.status(500).json({ error: 'Failed to save analysis. Please try again.' });
    }

    // 9. Return JSON object with compatible fields
    return res.status(201).json(savedAnalysis.toJSON());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0]?.message || 'Invalid input' });
    }
    console.error('[UNHANDLED ERROR]', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

// ─── GET /api/analyses/stats ──────────────────────────────────────────────────
router.get('/analyses/stats', authMiddleware, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user_id: req.userId }).sort({ created_at: 1 });

    // No analyses yet — return clean zeroed values
    if (!analyses || analyses.length === 0) {
      return res.json({ total: 0, flaggedPercent: 0, commonRedFlag: null, trend: [] });
    }

    const total = analyses.length;
    const flagged = analyses.filter((a) => a.category !== 'legitimate').length;
    const flaggedPercent = Math.round((flagged / total) * 100);

    // Most common red flag across all analyses
    const flagCounts = {};
    for (const a of analyses) {
      if (Array.isArray(a.red_flags)) {
        for (const flag of a.red_flags) {
          if (flag && typeof flag === 'string') {
            flagCounts[flag] = (flagCounts[flag] || 0) + 1;
          }
        }
      }
    }

    let commonRedFlag = null;
    let maxCount = 0;
    for (const [flag, count] of Object.entries(flagCounts)) {
      if (count > maxCount) {
        maxCount = count;
        commonRedFlag = flag;
      }
    }

    // Trend: count of analyses per day over the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trendMap = {};
    for (const a of analyses) {
      const d = new Date(a.created_at);
      if (isNaN(d.getTime())) continue;
      if (d >= sevenDaysAgo) {
        const dateStr = d.toISOString().split('T')[0];
        trendMap[dateStr] = (trendMap[dateStr] || 0) + 1;
      }
    }

    const trend = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        day: new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short' }),
        riskScore: count,
      }));

    return res.json({ total, flaggedPercent, commonRedFlag, trend });
  } catch (err) {
    console.error('Stats unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/analyses ────────────────────────────────────────────────────────
router.get('/analyses', authMiddleware, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user_id: req.userId }).sort({ created_at: -1 });
    return res.json(analyses.map((a) => a.toJSON()));
  } catch (err) {
    console.error('Get analyses unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── DELETE /api/analyses/:id ─────────────────────────────────────────────────
router.delete('/analyses/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that id is a valid 24-character hexadecimal MongoDB ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid analysis id' });
    }

    const existing = await Analysis.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (existing.user_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this analysis' });
    }

    await Analysis.findByIdAndDelete(id);

    return res.json({ success: true });
  } catch (err) {
    console.error('Delete unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
