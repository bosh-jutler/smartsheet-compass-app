/*
 * ==========================================================================
 * DashboardPage.jsx: Renders the dynamic data visualization dashboard
 * ==========================================================================
 *
 * Description:
 * This component is the heart of the Compass application. It fetches and
 * displays the detailed data for a single assessment from a specific sheet.
 *
 * It uses the `useParams` hook from react-router-dom to extract the sheetId
 * from the URL. An authenticated API call is then made to a new backend
 * endpoint (`/api/dashboard/:sheetId`) to get the sheet's data.
 *
 * The dashboard is rendered as a responsive "bento box" grid, with each
 * piece of data displayed in its own card.
 *
 * ==========================================================================
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingComponent from './LoadingComponent';

// A reusable card component for our "bento box" grid
const DashboardCard = ({ title, value, gridArea }) => {
  const cardStyle = {
    gridArea: gridArea,
    backgroundColor: 'var(--brand-white)',
    padding: '24px',
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const titleStyle = {
    fontSize: '16px',
    color: 'var(--brand-blue-800)',
    opacity: 0.8,
    marginBottom: '8px',
  };

  const valueStyle = {
    fontSize: '40px',
    fontWeight: '600',
    color: 'var(--brand-blue-500)',
    lineHeight: '1.2',
  };

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>{title}</h3>
      <p style={valueStyle}>{value}</p>
    </div>
  );
};

const DashboardPage = () => {
  // Get the dynamic sheetId from the URL
  const { sheetId } = useParams();

  // State for dashboard data, loading, and errors
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data for the specific sheet when the component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`/api/dashboard/${sheetId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data.');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [sheetId]); // Re-run the effect if the sheetId changes

  // --- Render Functions for Different States ---

  if (isLoading) return <LoadingComponent />;

  if (error) {
    return <div>Error: {error}</div>;
  }

  // --- Main Component Styles ---
  const styles = {
    container: {
      padding: '48px',
      backgroundColor: 'var(--brand-neutral-35)',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
    },
    title: {
      color: 'var(--brand-blue-800)',
      fontSize: '40px',
      fontWeight: '600',
    },
    backLink: {
      color: 'var(--brand-blue-500)',
      textDecoration: 'none',
      fontSize: '16px',
    },
    grid: {
      display: 'grid',
      gap: '24px',
      // Defines a responsive grid layout for the bento boxes
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gridTemplateRows: 'auto',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{dashboardData?.sheetName || 'Dashboard'}</h1>
        <Link to="/my-assessments" style={styles.backLink}>
          &larr; Back to Assessments
        </Link>
      </div>
      {dashboardData?.metrics ? (
        <div style={styles.grid}>
          {/* Map over the fetched metrics and render a card for each one */}
          {dashboardData.metrics.map((metric, index) => (
            <DashboardCard
              key={index}
              title={metric.title}
              value={metric.value}
            />
          ))}
        </div>
      ) : (
        <p>No dashboard data found.</p>
      )}
    </div>
  );
};

export default DashboardPage;
