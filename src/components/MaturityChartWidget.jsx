import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// --- Helper Functions & Constants ---
const getScoreDetails = (score) => {
  if (score === null || score === undefined) return { label: 'Unknown' };
  const scoreNum = Number(score);
  if (scoreNum >= 81) return { label: 'Optimized' };
  if (scoreNum >= 51) return { label: 'Defined' };
  return { label: 'Initial' };
};

const MATURITY_COLORS = {
  Optimized: '#10b981', // Emerald 500
  Defined: '#f59e0b',   // Amber 500
  Initial: '#ef4444',   // Red 500
  Unknown: '#6b7280',   // Gray 500
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) {
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="14px"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// --- Custom Legend Component ---
const CustomLegend = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }
  return (
    <div style={{ paddingTop: '16px' }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {data.map((entry) => (
          <li key={`item-${entry.name}`} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: MATURITY_COLORS[entry.name],
              marginRight: '8px'
            }}/>
            {/* FIXED: Added whiteSpace: 'nowrap' to prevent the text from breaking */}
            <span style={{
                color: '#475569',
                fontWeight: 600,
                fontSize: '16px',
                whiteSpace: 'nowrap'
            }}>
              {`${entry.name} (${entry.value})`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};


// --- Skeleton Loader Component ---
const MaturityChartSkeleton = () => {
  const shimmerKeyframes = `
    @keyframes shimmer {
      0% { background-position: -800px 0; }
      100% { background-position: 800px 0; }
    }
  `;

  const skeletonBaseStyle = {
    animation: 'shimmer 2s infinite linear',
    backgroundImage: 'linear-gradient(to right, #e2e8f0 8%, #f1f5f9 18%, #e2e8f0 33%)',
    backgroundSize: '800px 100%',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  };
  
  const donutStyle = {
    ...skeletonBaseStyle,
    width: '170px',
    height: '170px',
    borderRadius: '50%',
    flexShrink: 0,
  };

  const legendContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    width: '100%',
    marginTop: '24px',
  };

  const legendItemStyle = {
    ...skeletonBaseStyle,
    width: '100px',
    height: '24px',
    borderRadius: '4px',
  };

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div style={containerStyle}>
        <div style={donutStyle}></div>
        <div style={legendContainerStyle}>
          <div style={legendItemStyle}></div>
          <div style={legendItemStyle}></div>
          <div style={legendItemStyle}></div>
        </div>
      </div>
    </>
  );
};


// --- Main Widget Component ---
const MaturityChartWidget = () => {
  const [maturityData, setMaturityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaturityData = async () => {
      setTimeout(async () => {
        try {
          const response = await fetch('/api/assessments');
          if (!response.ok) {
            throw new Error('Failed to fetch data for maturity chart.');
          }
          const assessments = await response.json();
          
          const counts = assessments.reduce((acc, assessment) => {
            const { label } = getScoreDetails(assessment.maturityScore);
            acc[label] = (acc[label] || 0) + 1;
            return acc;
          }, {});

          const sortOrder = ['Initial', 'Defined', 'Optimized', 'Unknown'];

          const chartData = Object.keys(counts)
            .map(name => ({ name, value: counts[name] }))
            .sort((a, b) => sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name));
          
          setMaturityData(chartData);

        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }, 1500); 
    };

    fetchMaturityData();
  }, []);

  const cardStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    height: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
  
  const emptyStateStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      color: '#6b7280',
  };

  if (isLoading) {
    return (
      <div style={cardStyle}>
        <MaturityChartSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div style={cardStyle}>
        <div style={emptyStateStyle}>Error: {error}</div>
      </div>
    );
  }
  
  if (maturityData.length === 0) {
      return (
          <div style={cardStyle}>
            <div style={emptyStateStyle}>No assessment data available.</div>
          </div>
      );
  }

  return (
    <div style={cardStyle}>
      <div style={{ flex: 1, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '8px',
                borderColor: '#e2e8f0',
              }}
            />
            <Pie
              data={maturityData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              labelLine={false}
              label={renderCustomizedLabel}
              isAnimationActive={false}
            >
              {maturityData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={MATURITY_COLORS[entry.name]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <CustomLegend data={maturityData} />
    </div>
  );
};

export default MaturityChartWidget;