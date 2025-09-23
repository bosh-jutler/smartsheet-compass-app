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

  const colorPalette = [
    '#c7d8ff', '#b8cdff', '#9ebbff', '#80a6ff', '#6692fa',
    '#5081f2', '#3a6fe9', '#2d60d7', '#184bc3'
  ];

  const values = Array.from(dataMap.values());
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 0);

  const getColor = (currentVal) => {
    if (minVal === maxVal) {
      return colorPalette[4]; // Middle hue
    }
    if (currentVal === 0) {
        return '#FFFFFF'; // Return white for zero values
    }

    const normalized = (currentVal - minVal) / (maxVal - minVal);
    const index = Math.round(normalized * (colorPalette.length - 1));
    return colorPalette[index];
  };

  return (
    <div className={styles.heatmapContainer}>
      <div className={styles.grid}>
        <div className={styles.xLabelsContainer}>
          <div className={styles.yLabel} />
          <div className={styles.xLabelsContent}>
            <div className={styles.xTitle}>Subcategory Score</div>
            <div className={styles.xLabels}>
              {xLabels.map(label => <div key={label} className={styles.xLabel}>{label}</div>)}
            </div>
          </div>
        </div>
        <div className={styles.dataRow}>
          <div className={styles.yLabelsContainer}>
            {yLabels.map(y => (
              <div key={y} className={styles.yLabel}>{y}</div>
            ))}
          </div>
          <div className={styles.cellGrid}>
            {yLabels.map(y => (
              <div key={y} className={styles.cellRow}>
                {xLabels.map(x => {
                  const value = dataMap.get(`${y}-${x}`) || 0;
                  return (
                    <div
                      key={x}
                      className={styles.cell}
                      style={{
                        backgroundColor: getColor(value),
                        color: value === 0 ? '#666' : 'white'
                      }}
                      title={`Count: ${value}`}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
