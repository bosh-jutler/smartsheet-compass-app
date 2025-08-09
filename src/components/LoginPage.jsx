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
import styles from './LoginPage.module.css';

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

  return (
    <div className={`${styles.container} login-page-gradient`}>
      <div className={styles.card}>
        <h1 className={styles.title}>Smartsheet Compass</h1>
        <p className={styles.subtitle}>
          Please log in to view your PPM assessment dashboard.
        </p>
        <button className={styles.button} onClick={handleLogin}>
          Login with Smartsheet
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
