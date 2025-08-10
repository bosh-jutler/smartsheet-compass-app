import React from 'react';
import styles from './LoadingComponent.module.css';

const LoadingComponent = () => {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
        <img
          src="/smartsheet-logo-blue.svg"
          alt="Loading..."
          className={styles.logo}
        />
      </div>
    </div>
  );
};

export default LoadingComponent;