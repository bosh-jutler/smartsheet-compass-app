import React from 'react';
import styles from './LoadingIndicator.module.css';

const LoadingIndicator = () => {
  return (
    <div className={styles.skeletonWrapper}>
      <div className={`${styles.skeleton} ${styles.valueSkeleton}`}></div>
      <div className={`${styles.skeleton} ${styles.titleSkeleton}`}></div>
    </div>
  );
};

export default LoadingIndicator;