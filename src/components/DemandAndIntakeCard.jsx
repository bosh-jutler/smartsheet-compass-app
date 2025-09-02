import React from 'react';
import styles from './DemandAndIntakeCard.module.css';
import ColumnChart from './ColumnChart';

const DemandAndIntakeCard = ({ summary, diDimensionalPerformance, yourCompanyScore, industryAverageScore }) => {
  const chartData = [
    { label: 'Your Company', value: yourCompanyScore, color: '#05705a' },
    { label: 'Industry Average', value: industryAverageScore, color: '#ebad1c' }
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Demand & Intake Management</h2>
      </div>
      <div className={styles.content}>
        <h3>Summary</h3>
        <p>{summary || 'No summary available.'}</p>


        <h3 className={styles.dimensionalHeader}>Dimensional Performance</h3>
        <p>{diDimensionalPerformance || 'No dimensional performance data available.'}</p>
        <div className={styles.chartContainer}>
          <ColumnChart data={chartData} showValueLabels={true} />
        </div>
      </div>
    </div>
  );
};

export default DemandAndIntakeCard;