import React from 'react';
import styles from './DemandAndIntakeCard.module.css';
import ColumnChart from './ColumnChart';
import Heatmap from './Heatmap';

const DemandAndIntakeCard = ({
  summary,
  diDimensionalPerformance,
  yourCompanyScore,
  industryAverageScore,
  heatmapData,
  highlightMaturityScore,
  highlightDiPeopleScore,
}) => {
  const chartData = [
    { label: 'Your Company', value: yourCompanyScore },
    { label: 'Industry Average', value: industryAverageScore }
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Demand & Intake Management</h2>
      </div>
      <div className={styles.content}>
        <h3>Summary</h3>
        <p>{summary || 'No summary available.'}</p>

        <div className={styles.performanceSection}>
          <div className={styles.performanceText}>
            <h3 className={styles.dimensionalHeader}>Dimensional Performance</h3>
            <p>{diDimensionalPerformance || 'No dimensional performance data available.'}</p>
          </div>
          <div className={styles.chartContainer}>
            <ColumnChart data={chartData} showValueLabels={true} />
          </div>
        </div>

        <div className={styles.heatmapSection}>
          <Heatmap
            data={heatmapData}
            highlightMaturityScore={highlightMaturityScore}
            highlightDiPeopleScore={highlightDiPeopleScore}
          />
        </div>
      </div>
    </div>
  );
};

export default DemandAndIntakeCard;