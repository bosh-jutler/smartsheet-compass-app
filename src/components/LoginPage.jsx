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
      {/* Container for the title and logo */}
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>COMPASS</h1>
        {/* Assumes your logo is named 'smartsheet-logo.svg' and is in the /public folder */}
        <img src="/smartsheet-logo.svg" alt="Smartsheet logo" className={styles.logo} />
      </div>
      <button className={styles.button} onClick={handleLogin}>
        {/* This container now manages the group layout */}
        <span className={styles.buttonContent}>
          <span className={styles.buttonText}>login</span>
          <span className={styles.arrowContainer}>
            <svg
              className={styles.arrow}
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 20H38M34 16L38 20L34 24"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </button>
    </div>
  );
};

export default LoginPage;