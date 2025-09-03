import React from 'react';

const ColumnChart = ({ data, showValueLabels = false }) => {
  // Find the maximum value to scale the chart
  const maxValue = Math.max(...data.map(d => d.value));

  // Define chart dimensions and styles
  const chartHeight = 200;
  const chartWidth = 300;
  const barWidth = 50;
  const barMargin = 50; // Increased bar margin
  const labelHeight = 20;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <svg width={chartWidth} height={chartHeight + labelHeight} aria-labelledby="chart-title" role="img">
        <title id="chart-title">Column Chart</title>
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * chartHeight;
          const x = i * (barWidth + barMargin) + barMargin;
          const y = chartHeight - barHeight;

          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={d.color || '#7847dc'}
              />
              {showValueLabels && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fill="#333"
                  fontSize="12"
                >
                  {d.value}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={chartHeight + labelHeight - 5}
                textAnchor="middle"
                fill="#333"
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