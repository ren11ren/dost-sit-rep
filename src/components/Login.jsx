import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Default users for demo
  const users = [
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        if (user.status !== 'Active') {
          setError('Your account is inactive. Please contact administrator.');
          setLoading(false);
          return;
        }

        // Store user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        onLogin(user);
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>DOST Region 1</h2>
          <p>Disaster Management Dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="login-form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="login-form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p></p>
          <div className="">
            <div><strong>SADMIN:</strong> admin@dostregion1.ph / admin123</div>
            <div><strong>ADMIN:</strong> admin-ilocosnorte@dostregion1.ph / admin123</div>
            <div><strong>USER:</strong> user-ilocossur@dostregion1.ph / user123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
