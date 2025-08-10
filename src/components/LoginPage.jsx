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

import React, { useState } from 'react';
import styles from './LoginPage.module.css';
import LoadingComponent from './LoadingComponent';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Handles the click event for the login button.
  const handleLogin = () => {
    setIsLoading(true);
    // The redirection will happen, but the loading screen will be visible for a moment.
    window.location.href = '/api/login';
  };

  return (
    <div className={`${styles.container} login-page-gradient`}>
      {/* Container for the title and logo */}
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>COMPASS</h1>
        <img src="/smartsheet-logo.svg" alt="Smartsheet logo" className={styles.logo} />
      </div>
      <button className={styles.button} onClick={handleLogin}>
        <span className={styles.buttonContent}>
          <span className={styles.buttonText}>login</span>
          <span className={styles.arrowContainer}>
            <svg
              className={styles.arrow}
              width="30"
              height="40"
              viewBox="0 0 30 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 20H28M24 16L28 20L24 24"
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