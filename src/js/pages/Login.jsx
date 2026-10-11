import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, Loader2, X, AlertCircle, ExternalLink, KeyRound } from 'lucide-react';
import { AuthContext } from '../App';

export default function Login() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(!location.state?.isSignup);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (location.state?.isSignup !== undefined) {
      setIsLogin(!location.state.isSignup);
    }
  }, [location.state]);

  const handleGoogleAuthSuccess = async (authPayload) => {
    setIsGoogleLoading(true);
    setError('');

    try {
      const base = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${base}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload),
      });

      const rawText = await response.text();
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error('Server returned an unexpected response during Google authentication.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Google authentication failed');
      }

      if (!data.token) {
        throw new Error('No authentication token received from Google sign-in.');
      }

      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      setShowSetupModal(true);
      return;
    }

    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setError(tokenResponse.error_description || 'Google sign-in was canceled.');
              }
              return;
            }
            if (tokenResponse?.access_token) {
              await handleGoogleAuthSuccess({ accessToken: tokenResponse.access_token });
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        console.error('Google OAuth error:', err);
        setError('Failed to open Google sign-in. Please try again.');
      }
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google Services is still loading. Please check your connection and try again.');
    }
  };

  const handleDemoGoogleSignIn = async () => {
    setShowSetupModal(false);
    await handleGoogleAuthSuccess({
      accessToken: 'demo_token',
      demoUser: {
        email: 'google.demo.user@gmail.com',
        name: 'Demo Google User',
        sub: 'google_demo_1092837465',
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const base = import.meta.env.VITE_API_URL || '';
      const endpoint = isLogin ? `${base}/api/auth/login` : `${base}/api/auth/signup`;
      let response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      } catch {
        throw new Error('Cannot reach the server. Please check your connection.');
      }

      const rawText = await response.text();
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error('Server returned an unexpected response. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (!data.token) {
        throw new Error('Login failed: no token received. Please try again.');
      }

      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 relative">
      
      {/* Decorative Stickers */}
      <div className="hidden sm:block absolute top-12 left-10 animate-float-1 z-10 pointer-events-none">
        <span className="bg-[#ffe600] text-black font-bungee text-xs px-3 py-1.5 rounded-lg border-2 border-black shadow-brutal-sm rotate-[-8deg] inline-block">
          ⚡ 100% SECURE
        </span>
      </div>

      <div className="hidden sm:block absolute bottom-12 right-10 animate-float-2 z-10 pointer-events-none">
        <span className="bg-[#00f0ff] text-black font-mono-code font-black text-xs px-3 py-1.5 rounded-lg border-2 border-black shadow-brutal-sm rotate-[6deg] inline-block">
          🛡️ ANTI-SPOOF GATEWAY
        </span>
      </div>

      {/* Main Container Card */}
      <div className="max-w-md w-full bg-white dark:bg-[#121212] border-3 border-black dark:border-white rounded-3xl shadow-brutal-xl overflow-hidden transition-colors duration-200 relative z-20">
        
        {/* Window Chrome Header Bar */}
        <div className="bg-black text-white px-5 py-3 border-b-3 border-black dark:border-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff007f] border border-black inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-[#ffe600] border border-black inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-[#00ff66] border border-black inline-block"></span>
            </div>
            <span className="font-mono-code text-xs font-black text-[#00ff66] uppercase tracking-wide">
              [ AUTH_GATEWAY.EXE ]
            </span>
          </div>

          <span className="font-mono-code text-[11px] bg-[#ff007f] text-white px-2 py-0.5 rounded font-black">
            SSL_OK
          </span>
        </div>

        <div className="p-6 sm:p-8">
          
          {/* Card Title & Icon */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#ff007f] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mb-4 rotate-[-3deg] sticker-pop">
              <ShieldAlert className="w-9 h-9 text-white stroke-[2.5]" />
            </div>
            <h2 className="font-syne font-black text-3xl sm:text-4xl uppercase tracking-tight text-black dark:text-white leading-tight">
              {isLogin ? 'WELCOME BACK' : 'ENTER THE SHIELD'}
            </h2>
            <p className="font-space font-bold text-xs sm:text-sm text-black/70 dark:text-gray-300 mt-1">
              {isLogin ? 'Verify your identity to access live threat reports.' : 'Create an account to start scanning phishing texts.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-[#ff007f] text-white border-2 border-black rounded-xl font-space font-bold text-xs shadow-brutal-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[3]" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-[#fff9e6] dark:bg-black text-black dark:text-white border-2 border-black dark:border-white rounded-xl font-space font-black text-xs sm:text-sm uppercase tracking-wider shadow-brutal-sm btn-tactile disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#ff007f]" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>
                {isGoogleLoading
                  ? 'Connecting to Google...'
                  : isLogin
                  ? 'Sign in with Google'
                  : 'Sign up with Google'}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-black dark:border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#121212] px-3 font-mono-code font-black text-black dark:text-gray-400">
                OR EMAIL PASS
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-space font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-black dark:text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#fafafa] dark:bg-[#070707] border-2 border-black dark:border-white rounded-xl font-mono-code text-sm text-black dark:text-white focus:outline-none focus:ring-3 focus:ring-[#00f0ff] shadow-inner font-semibold"
                  placeholder="you@domain.com"
                />
              </div>
            </div>

            <div>
              <label className="block font-space font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-black dark:text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#fafafa] dark:bg-[#070707] border-2 border-black dark:border-white rounded-xl font-mono-code text-sm text-black dark:text-white focus:outline-none focus:ring-3 focus:ring-[#00f0ff] shadow-inner font-semibold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block font-space font-black text-xs uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <KeyRound className="h-4 w-4 text-black dark:text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#fafafa] dark:bg-[#070707] border-2 border-black dark:border-white rounded-xl font-mono-code text-sm text-black dark:text-white focus:outline-none focus:ring-3 focus:ring-[#00f0ff] shadow-inner font-semibold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center pt-1">
                <input
                  id="keep-signed-in"
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-2 border-black accent-[#ff007f] cursor-pointer"
                />
                <label htmlFor="keep-signed-in" className="ml-2 block text-xs font-space font-bold text-black dark:text-gray-300 cursor-pointer">
                  Keep me signed in
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#00ff66] hover:bg-[#00e65c] text-black font-bungee text-sm uppercase rounded-xl border-3 border-black shadow-brutal-lime btn-tactile mt-3"
            >
              {isLogin ? '⚡ SIGN IN NOW ⚡' : '🚀 CREATE FREE ACCOUNT 🚀'}
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-6 text-center pt-3 border-t-2 border-black/10 dark:border-white/10">
            <p className="font-space font-bold text-xs text-black/70 dark:text-gray-400">
              {isLogin ? "Don't have an account yet? " : 'Already got an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-black text-[#ff007f] hover:underline uppercase ml-1"
              >
                {isLogin ? 'Sign up here' : 'Log in here'}
              </button>
            </p>
          </div>

        </div>

      </div>

      {/* Google Setup Guide Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121212] border-3 border-black dark:border-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-brutal-xl relative">
            <button
              onClick={() => setShowSetupModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-black text-white hover:bg-[#ff007f] transition-colors border border-black"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#ffe600] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center text-black">
                <AlertCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-syne font-black text-xl text-black dark:text-white uppercase">
                GOOGLE OAUTH CONFIGURATION
              </h3>
            </div>

            <p className="font-space text-xs sm:text-sm text-black/80 dark:text-gray-300 mb-4 leading-relaxed font-semibold">
              To activate direct Google Sign-In with your own credentials, configure your OAuth client ID:
            </p>

            <ol className="text-xs text-black dark:text-gray-300 space-y-2 mb-6 list-decimal list-inside bg-[#fafafa] dark:bg-black p-4 rounded-xl border-2 border-black font-mono-code font-semibold">
              <li>Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-[#ff007f] underline font-black inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
              <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web app)</li>
              <li>Authorized origin: <code className="bg-[#ffe600] text-black px-1 py-0.5 rounded font-black">http://localhost:5173</code></li>
              <li>Set <code className="text-[#00ff66] font-black">VITE_GOOGLE_CLIENT_ID</code> in <code className="font-black">.env</code></li>
            </ol>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 rounded-xl border-2 border-black text-black dark:text-white font-space font-bold text-xs uppercase hover:bg-black/5 dark:hover:bg-white/10 btn-tactile"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDemoGoogleSignIn}
                className="px-5 py-2 rounded-xl bg-[#00ff66] text-black font-bungee text-xs uppercase border-2 border-black shadow-brutal-sm btn-tactile"
              >
                ⚡ TEST DEMO GOOGLE LOGIN
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
