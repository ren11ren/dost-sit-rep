import React, { useState, useEffect } from 'react';
import './Login.css';

const DOST_LOGO = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="20" fill="#0a2a4a"/>
  <rect x="15" y="15" width="170" height="170" rx="12" fill="none" stroke="#ffd700" stroke-width="2"/>
  <text x="100" y="65" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">DOST</text>
  <text x="100" y="88" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="13">ILOCOS REGION</text>
  <text x="100" y="115" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10">DISASTER</text>
  <text x="100" y="132" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10">MANAGEMENT</text>
  <circle cx="100" cy="165" r="12" fill="none" stroke="#ffd700" stroke-width="1.5"/>
  <text x="100" y="170" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="14">★</text>
</svg>
`);

// Candidate public image paths (will use the first one that loads successfully).
const CANDIDATE_HERO_PATHS = [
  (process.env.PUBLIC_URL || '') + '/dost.png',
  (process.env.PUBLIC_URL || '') + '/1000037169.jpg',
  (process.env.PUBLIC_URL || '') + '/ilocos_norte.jpg',
  (process.env.PUBLIC_URL || '') + '/sample-image.svg'
];

const DEMO_ACCOUNTS = [
  { role: 'SADMIN', label: 'Super Admin', email: 'admin@dostregion1.ph', password: 'admin123' },
  { role: 'ADMIN', label: 'Regional Admin', email: 'admin-ilocosnorte@dostregion1.ph', password: 'admin123' },
  { role: 'USER', label: 'PSTO User', email: 'user-ilocossur@dostregion1.ph', password: 'user123' },
];

const USERS = [
  { id: 1, name: 'Admin User', email: 'admin@dostregion1.ph', office: 'PSTO-La Union', role: 'SADMIN', status: 'Active', password: 'admin123' },
  { id: 2, name: 'Regional Admin', email: 'admin-ilocosnorte@dostregion1.ph', office: 'PSTO-Ilocos Norte', role: 'ADMIN', status: 'Active', password: 'admin123' },
  { id: 3, name: 'General User', email: 'user-ilocossur@dostregion1.ph', office: 'PSTO-Ilocos Sur', role: 'USER', status: 'Active', password: 'user123' },
  { id: 4, name: 'La Union User', email: 'user-launion@dostregion1.ph', office: 'PSTO-La Union', role: 'USER', status: 'Active', password: 'user123' },
  { id: 5, name: 'Pangasinan User', email: 'user-pangasinan@dostregion1.ph', office: 'PSTO-Pangasinan', role: 'USER', status: 'Active', password: 'user123' },
  { id: 6, name: 'Ilocos Sur User', email: 'user-ilocossur2@dostregion1.ph', office: 'PSTO-Ilocos Sur', role: 'USER', status: 'Active', password: 'user123' },
  { id: 7, name: 'Ilocos Norte User', email: 'user-ilocosnorte@dostregion1.ph', office: 'PSTO-Ilocos Norte', role: 'USER', status: 'Active', password: 'user123' },
  { id: 8, name: 'Ilocos Sur FO Admin', email: 'admin-ilocossur-fo@dostregion1.ph', office: 'PSTO-Ilocos Sur - FO', role: 'ADMIN', status: 'Active', password: 'admin123' },
  { id: 9, name: 'Ilocos Sur FO User', email: 'user-ilocossur-fo@dostregion1.ph', office: 'PSTO-Ilocos Sur - FO', role: 'USER', status: 'Active', password: 'user123' },
  { id: 10, name: 'Pangasinan FO Admin', email: 'admin-pangasinan-fo@dostregion1.ph', office: 'PSTO-Pangasinan - FO', role: 'ADMIN', status: 'Active', password: 'admin123' },
  { id: 11, name: 'Pangasinan FO User', email: 'user-pangasinan-fo@dostregion1.ph', office: 'PSTO-Pangasinan - FO', role: 'USER', status: 'Active', password: 'user123' },
  { id: 12, name: 'Ilocos Sur User 3', email: 'user-ilocossur3@dostregion1.ph', office: 'PSTO-Ilocos Sur', role: 'USER', status: 'Active', password: 'user123' },
  { id: 13, name: 'Region Coordinator', email: 'coordinator-ilocos@dostregion1.ph', office: 'PSTO-Ilocos Region', role: 'ADMIN', status: 'Active', password: 'admin123' },
  { id: 14, name: 'Region User', email: 'user-ilocos-region@dostregion1.ph', office: 'PSTO-Ilocos Region', role: 'USER', status: 'Active', password: 'user123' },
];

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 7 10-7" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [showHeroImage, setShowHeroImage] = useState(false);
  const [heroPath, setHeroPath] = useState(null);

  const completeLogin = (user) => {
    const { password: _, ...safeUser } = user;
    localStorage.setItem('currentUser', JSON.stringify(safeUser));
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', user.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    onLogin(safeUser);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = USERS.find((u) => u.email === email.trim() && u.password === password);

      if (user) {
        if (user.status !== 'Active') {
          setError('Your account is inactive. Please contact your administrator.');
          setLoading(false);
          return;
        }
        completeLogin(user);
        return;
      }

      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }, 500);
  };

  const fillDemoAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    // Probe candidate public paths and pick the first that loads
    (async () => {
      for (const p of CANDIDATE_HERO_PATHS) {
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => reject(new Error('not-found'));
            img.src = p;
          });
          setHeroPath(p);
          setShowHeroImage(true);
          return;
        } catch (e) {
          // try next
        }
      }
      setShowHeroImage(false);
    })();
  }, []);

  return (
    <div className="login-page">
      <div className="login-brand-panel">
        <div className={`login-brand-content ${showHeroImage ? 'has-hero' : ''}`}>
          {showHeroImage && heroPath ? (
            <img src={heroPath} alt="DOST Ilocos Region" className="login-hero-photo" />
          ) : (
            <img src={DOST_LOGO} alt="DOST Ilocos Region" className="login-brand-logo" />
          )}
          <h1>DOST ILOCOS REGION</h1>
          <p className="login-brand-tagline">Disaster Management Dashboard</p>
          {/* When a hero photo is shown, hide the descriptive text and feature list so the image can take center stage */}
          {!showHeroImage && (
            <>
              <p className="login-brand-description">
                Coordinate situation reports, track typhoons, and manage PSTO offices across the Ilocos Region.
              </p>
              <ul className="login-brand-features">
                <li>Real-time situation reporting</li>
                <li>Typhoon event management</li>
                <li>Multi-office coordination</li>
              </ul>
            </>
          )}
        </div>
        <div className="login-brand-pattern" aria-hidden="true" />
      </div>

      <div className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {error && (
              <div className="login-error" role="alert">
                <span className="login-error-icon">!</span>
                {error}
              </div>
            )}

            <div className="login-form-group">
              <label htmlFor="login-email">Email address</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon"><MailIcon /></span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@dostregion1.ph"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="login-form-group">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon"><LockIcon /></span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="login-form-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember email</span>
              </label>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-btn-spinner" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="login-demo-section">
            <button
              type="button"
              className="login-demo-toggle"
              onClick={() => setShowDemoAccounts((prev) => !prev)}
              aria-expanded={showDemoAccounts}
            >
              {showDemoAccounts ? 'Hide demo accounts' : 'Show demo accounts'}
              <span className={`login-demo-chevron ${showDemoAccounts ? 'open' : ''}`} aria-hidden="true">›</span>
            </button>

            {showDemoAccounts && (
              <div className="login-demo-list">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    className="login-demo-card"
                    onClick={() => fillDemoAccount(account)}
                  >
                    <span className={`login-demo-badge login-demo-badge--${account.role.toLowerCase()}`}>
                      {account.role}
                    </span>
                    <span className="login-demo-info">
                      <strong>{account.label}</strong>
                      <span>{account.email}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
