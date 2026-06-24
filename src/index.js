import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './App.css';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.warn('Failed to parse stored currentUser:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} currentUser={currentUser} />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
