import React from 'react';
import styles from './DemandAndIntakeCard.module.css';

const DemandAndIntakeCard = ({ summary, diDimensionalPerformance }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Demand & Intake Management</h2>
      </div>
      <div className={styles.content}>
        <h3>Summary</h3>
        <p>{summary || 'No summary available.'}</p>

        {/* --- New Section Added --- */}
        <h3>Dimensional Performance</h3>
        <p>{diDimensionalPerformance || 'No dimensional performance data available.'}</p>
      </div>
    </div>
  );
};

export default DemandAndIntakeCard;