import React, { useState, useEffect } from 'react';
import LoadingIndicator from './LoadingIndicator';

// A reusable card component for our "bento box" grid
const DashboardCard = ({ title, value, gridArea, isLoading }) => {
  const cardStyle = {
    gridArea: gridArea,
    backgroundColor: 'var(--brand-white)',
    padding: '24px',
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    height: '300px',
  };

  const titleStyle = {
    fontSize: '24px',
    color: 'var(--brand-blue-800)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    order: 2,
  };

  const valueStyle = {
    fontSize: '120px',
    fontWeight: '900',
    color: 'var(--brand-blue-800)',
    lineHeight: '1',
    order: 1,
    marginBottom: '24px',
  };

  return (
    <div style={cardStyle}>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <h3 style={titleStyle}>{title}</h3>
          <p style={valueStyle}>{value}</p>
        </>
      )}
    </div>
  );
};

const MetricWidget = () => {
  const [totalAssessments, setTotalAssessments] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTotalAssessments = async () => {
      try {
        const response = await fetch('/api/assessments/total');
        if (!response.ok) {
          throw new Error('Failed to fetch total assessments.');
        }
        const data = await response.json();
        setTotalAssessments(data.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalAssessments();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <DashboardCard
      title="Total Assessments"
      value={totalAssessments}
      isLoading={isLoading}
    />
  );
};

export default MetricWidget;