/*
 * ==========================================================================
 * LoginPage.jsx: Component for Initiating Smartsheet OAuth Flow
 * ==========================================================================
 *
 * Description:
 * This component renders the main login page for the Smartsheet Compass
 * application. It features a single call-to-action button that directs
 * the user to the application's own backend to initiate the OAuth 2.0 flow.
 *
 * This architecture aligns with best practices where the frontend does not
 * handle OAuth logic directly. The backend is responsible for generating
 * the authorization URL, handling the callback, and securely managing tokens.
 *
 * ==========================================================================
 */

import React from 'react';

const LoginPage = () => {
  // Handles the click event for the login button.
  const handleLogin = () => {
    /*
     * Instead of building the Smartsheet authorization URL on the client-side,
     * we now redirect to our own backend endpoint ('/api/login').
     * The Vite proxy will forward this request to our Python server.
     */
    window.location.href = '/api/login';
  };

  // Styles are derived from the Smartsheet brand guidelines.
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: 'var(--brand-neutral-35)', // Using brand color from index.css
    },
    card: {
      padding: '48px',
      backgroundColor: 'var(--brand-white)',
      borderRadius: '15px', // As per layout guidelines
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    },
    title: {
      color: 'var(--brand-blue-800)',
      fontSize: '28px',
      fontWeight: '600', // DemiBold
      marginBottom: '12px',
    },
    subtitle: {
      color: 'var(--brand-blue-800)',
      fontSize: '16px',
      marginBottom: '32px',
    },
    button: {
      backgroundColor: 'var(--brand-blue-500)',
      color: 'var(--brand-white)',
      border: 'none',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: '600', // DemiBold
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Smartsheet Compass</h1>
        <p style={styles.subtitle}>
          Please log in to view your PPM assessment dashboard.
        </p>
        <button style={styles.button} onClick={handleLogin}>
          Login with Smartsheet
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
