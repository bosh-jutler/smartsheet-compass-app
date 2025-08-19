import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, Text } from 'recharts';

const RadarChartComponent = ({ data }) => {
  // This section is now corrected to pull dynamic data for the 'B' key
  const chartData = [
    { subject: 'Demand & Intake Management', A: data.diAverage, B: data.diScore, fullMark: 100 },
    { subject: 'Work Sourcing & Planning', A: data.wspAverage, B: data.wspScore, fullMark: 100 },
    { subject: 'Work Execution', A: data.weAverage, B: data.weScore, fullMark: 100 },
    { subject: 'Work & Portfolio Reporting', A: data.wprAverage, B: data.wprScore, fullMark: 100 },
    { subject: 'Portfolio Prioritization', A: data.ppAverage, B: data.ppScore, fullMark: 100 },
    { subject: 'Strategic Planning', A: data.spAverage, B: data.spScore, fullMark: 100 },
  ];

  /**
   * Custom renderer for the RadarChart's angle axis labels.
   * This function pushes the labels away from the chart by a set offset.
   */
  const renderPolarAngleAxisTick = ({ payload, x, y, cx, cy, ...rest }) => {
    const RADIAL_OFFSET = 12;
    const angle = Math.atan2(y - cy, x - cx);
    const newX = x + RADIAL_OFFSET * Math.cos(angle);
    const newY = y + RADIAL_OFFSET * Math.sin(angle);

    return (
      <Text
        {...rest}
        x={newX}
        y={newY}
        verticalAnchor="middle"
      >
        {payload.value}
      </Text>
    );
  };

  /**
   * ⭐️ Custom Legend Component ⭐️
   * This component renders the legend items using Flexbox,
   * allowing for a 'gap' to create space between them while maintaining centering.
   */
  const CustomLegend = (props) => {
    const { payload } = props; // 'payload' is provided by Recharts with legend data
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
        {
          payload.map((entry, index) => (
            <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', color: entry.color, fontWeight: 700 }}>
              {/* This SVG creates the colored square icon for the legend item */}
              <svg width="14" height="14" viewBox="0 0 32 32" style={{ marginRight: '8px' }}>
                <path stroke="none" fill={entry.color} d="M0,4h32v24h-32z" />
              </svg>
              <span>{entry.value}</span>
            </div>
          ))
        }
      </div>
    );
  };


  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="45%" cy="40%" outerRadius="65%" data={chartData} margin={{ top: 20, right: 30, bottom: 0, left: 30 }}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={renderPolarAngleAxisTick} />
        <PolarRadiusAxis />
        <Radar name="Industry Average" dataKey="A" stroke="#4c5470" fill="#4c5470" fillOpacity={0.6} />
        <Radar name="Your Company" dataKey="B" stroke="#2d60d7" fill="#2d60d7" fillOpacity={0.6} />
        <Legend
          verticalAlign="bottom"
          wrapperStyle={{
            bottom: 20,
            position: 'absolute',
            width: '100%',
            left: '45%',
            transform: 'translateX(-50%)'
          }}
          // We now use the 'content' prop to render our custom legend
          content={<CustomLegend />}
        />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
};

const StrengthsAndRadarCard = ({ strengths, radarChartData }) => {
  const styles = {
    card: {
      backgroundColor: '#ffffff',
      padding: '40px',
      borderRadius: '20px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e0e0e0',
      display: 'flex',
      gap: '40px',
      alignItems: 'flex-start',
      height: '100%',
      fontFamily: '"TT Norms Pro", "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    },
    chartSection: {
      flex: '1.2',
      height: '350px',
      position: 'relative',
    },
    strengthsSection: {
      flex: '1',
    },
    title: {
      fontSize: '22px',
      fontWeight: '600',
      color: '#031c59',
      marginBottom: '16px',
    },
    content: {
      fontSize: '16px',
      color: '#334155',
      lineHeight: '1.7',
      whiteSpace: 'pre-wrap',
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.chartSection} className="chart-container-for-legend">
        {radarChartData ? <RadarChartComponent data={radarChartData} /> : 'No data available.'}
      </div>
      <div style={styles.strengthsSection}>
        <h3 style={styles.title}>Strengths & Key Findings</h3>
        <div style={styles.content}>{strengths || 'No data available.'}</div>
      </div>
    </div>
  );
};

export default StrengthsAndRadarCard;
