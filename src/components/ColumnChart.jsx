import React from 'react';

const ColumnChart = ({ data, showValueLabels = false }) => {
  // Find the maximum value to scale the chart
  const maxValue = Math.max(...data.map(d => d.value));

  // --- START: Updated Dimensions ---
  // Define chart dimensions and styles
  const chartHeight = 130;     // Changed from 200
  const chartWidth = 320;      // Changed from 400
  const barWidth = 90;         // Changed from 80
  const barMargin = 70;        // Changed from 100
  const labelHeight = 30;
  // --- END: Updated Dimensions ---

  // Centering Logic
  const numBars = data.length;
  const contentWidth = (numBars * barWidth) + ((numBars > 1 ? numBars - 1 : 0) * barMargin);
  const startOffset = (chartWidth - contentWidth) / 2;
  
  // Color Logic
  const getBarColor = (d) => {
    if (d.label === 'Your Company') {
      return '#3ebfa5';
    }
    if (d.label === 'Industry Average') {
      return '#137f69';
    }
    return d.color || '#7847dc';
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
      <svg width={chartWidth} height={chartHeight + labelHeight} aria-labelledby="chart-title" role="img">
        <title id="chart-title">Column Chart</title>
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * chartHeight;
          const x = startOffset + i * (barWidth + barMargin);
          const y = chartHeight - barHeight;

          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={getBarColor(d)}
              />
              {showValueLabels && (
                <text
                  x={x + barWidth / 2}
                  y={y + 25}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="24"
                  fontWeight="700"
                >
                  {d.value}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={chartHeight + labelHeight - 5}
                textAnchor="middle"
                fill="#333"
                fontWeight="700"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ColumnChart;