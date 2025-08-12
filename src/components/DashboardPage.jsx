import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LoadingComponent from './LoadingComponent';

// A reusable card component for our "bento box" grid
const DashboardCard = ({ title, value }) => {
  const cardStyle = {
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
  const { sheetId } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const buttonRef = useRef();

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
  }, [sheetId]);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);

    if (buttonRef.current) {
      buttonRef.current.style.display = 'none';
    }

    const body = document.body;
    const html = document.documentElement;
    const originalWidth = body.style.width;

    try {
      const fullWidth = Math.max(
        body.scrollWidth,
        body.offsetWidth,
        html.clientWidth,
        html.scrollWidth,
        html.offsetWidth
      );
      const fullHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );

      body.style.width = `${fullWidth}px`;

      const canvas = await html2canvas(body, {
        // MODIFIED: Increased scale for higher resolution
        scale: 3,
        useCORS: true,
        width: fullWidth,
        height: fullHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const orientation = fullWidth > fullHeight ? 'l' : 'p';

      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [fullWidth, fullHeight],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, fullWidth, fullHeight);
      pdf.save(`Compass_Dashboard_${sheetId}.pdf`);
    } catch (err) {
      console.error("Could not generate PDF", err);
      alert("An error occurred while generating the PDF.");
    } finally {
      body.style.width = originalWidth;
      if (buttonRef.current) {
        buttonRef.current.style.display = 'block';
      }
      setIsDownloading(false);
    }
  };

  if (isLoading) return <LoadingComponent />;
  if (error) return <div>Error: {error}</div>;

  const styles = {
    container: {
      padding: '48px',
      backgroundColor: 'var(--brand-neutral-35)',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px',
      gap: '16px',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '12px',
      color: 'var(--brand-blue-800)',
    },
    titleMain: {
      fontSize: '60px',
      fontWeight: '900',
      lineHeight: 1,
      paddingRight: '4px',
    },
    titleBy: {
      fontSize: '20px',
      fontWeight: '600',
    },
    logo: {
      height: '18px',
      transform: 'translateY(18px)',
    },
    grid: {
      display: 'grid',
      gap: '24px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gridTemplateRows: 'auto',
    },
    downloadButton: {
      backgroundColor: 'var(--brand-blue-500)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    downloadButtonDisabled: {
      backgroundColor: 'var(--brand-neutral-200)',
      cursor: 'not-allowed',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={styles.titleContainer}>
            <span style={styles.titleMain}>COMPASS</span>
            <span style={styles.titleBy}>by</span>
          </h1>
          <img src="/smartsheet-logo-blue.svg" alt="Smartsheet Logo" style={styles.logo} />
        </div>

        <button
          ref={buttonRef}
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          style={{
            ...styles.downloadButton,
            ...(isDownloading ? styles.downloadButtonDisabled : {}),
          }}
        >
          {isDownloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
      {dashboardData?.metrics ? (
        <div style={styles.grid}>
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