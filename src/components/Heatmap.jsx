import React from 'react';
import styles from './Heatmap.module.css';

const Heatmap = ({ data }) => {
  const xLabels = ['1', '2', '3'];
  const yLabels = ['Optimized', 'Defined', 'Initial'];

  // Create a map for quick lookup
  const dataMap = new Map();
  data.forEach(item => {
    dataMap.set(`${item.y}-${item.x}`, item.value);
  });

  const getColor = (value) => {
    const counts = Array.from(dataMap.values());
    const sortedCounts = [...new Set(counts)].sort((a, b) => a - b);
    const rank = sortedCounts.indexOf(value);
    
    if (rank < 3) return '#dbe6ff';
    if (rank < 6) return '#9ebbff';
    return '#6692fa';
  };

  return (
    <div className={styles.heatmapContainer}>
      <div className={styles.yLabels}>
        {yLabels.map(label => <div key={label} className={styles.yLabel}>{label}</div>)}
      </div>
      <div className={styles.grid}>
        {yLabels.map(y => (
          <div key={y} className={styles.row}>
            {xLabels.map(x => {
              const value = dataMap.get(`${y}-${x}`) || 0;
              return (
                <div
                  key={x}
                  className={styles.cell}
                  style={{ backgroundColor: getColor(value) }}
                  title={`Count: ${value}`}
                >
                  {value}
                </div>
              );
            })}
          </div>
        ))}
        <div className={styles.xLabels}>
          {xLabels.map(label => <div key={label} className={styles.xLabel}>{label}</div>)}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;