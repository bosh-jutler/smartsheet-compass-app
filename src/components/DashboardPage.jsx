import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

// Since the LoadingComponent is not provided, I'm creating a simple placeholder.
const LoadingComponent = () => {
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      fontFamily: '"TT Norms", sans-serif', // Updated font
      color: '#555',
    },
  };
  return <div style={styles.container}>Loading...</div>;
};

// A reusable card component for our "bento box" grid
const DashboardCard = ({ title, value }) => {
  const cardStyle = {
    backgroundColor: 'var(--brand-white, #ffffff)',
    padding: '24px',
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const titleStyle = {
    fontSize: '16px',
    color: 'var(--brand-blue-800, #1e3a8a)',
    opacity: 0.8,
    marginBottom: '8px',
  };

  const valueStyle = {
    fontSize: '40px',
    fontWeight: '600',
    color: 'var(--brand-blue-500, #3b82f6)',
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
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const dashboardRef = useRef(null);
  const buttonContainerRef = useRef(null);

  // Effect to dynamically load jspdf and html2canvas libraries
  useEffect(() => {
    const loadScript = (src, id) => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    };

    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas-script'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf-script')
    ]).then(() => {
      setLibsLoaded(true);
    }).catch(err => {
      console.error(err);
      setError('Could not load necessary libraries for PDF export.');
    });
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // This is a mock API call.
        const mockData = {
            metrics: [
                { title: "Customer Name", value: "Terraverde Logistics" },
                { title: "Industry", value: "Transportation" },
                { title: "Created Date", value: "Aug 04, 2025" },
                { title: "Maturity Score", value: "23" }
            ]
        };
        setDashboardData(mockData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [sheetId]);

  const handleDownloadPdf = async () => {
    if (!dashboardRef.current || !libsLoaded) return;
    setIsDownloading(true);

    if (buttonContainerRef.current) {
        buttonContainerRef.current.style.display = 'none';
    }

    try {
      const { jsPDF } = window.jspdf;
      const canvas = await window.html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f0f2f5',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Compass_Dashboard_${sheetId || 'export'}.pdf`);

    } catch (err) {
      console.error("Could not generate PDF", err);
      setError("An error occurred while generating the PDF.");
    } finally {
      if (buttonContainerRef.current) {
        buttonContainerRef.current.style.display = 'flex';
      }
      setIsDownloading(false);
    }
  };

  if (isLoading) return <LoadingComponent />;
  if (error) return <div>Error: {error}</div>;

  const styles = {
    container: {
      padding: '48px',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
      fontFamily: '"TT Norms", sans-serif', // Updated font
    },
    header: {
      display: 'flex',
      alignItems: 'flex-end', // Changed to align items to the bottom
      justifyContent: 'space-between',
      marginBottom: '32px',
      gap: '16px',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '12px',
      color: '#031c59',
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
    },
    // --- GHOST BUTTON STYLES ---
    downloadButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px', // Adjusted padding for larger font
      fontSize: '16px', // Increased font size
      fontWeight: '500',
      color: '#031c59', // Using direct hex value
      backgroundColor: 'transparent',
      border: '2px solid #031c59', // Using direct hex value
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    downloadButtonHover: {
      backgroundColor: '#031c59', // Using direct hex value
      color: '#ffffff',
    },
    downloadButtonDisabled: {
      borderColor: '#d1d5db',
      color: '#9ca3af',
      cursor: 'not-allowed',
      backgroundColor: 'transparent',
    },
  };

  const finalButtonStyle = {
    ...styles.downloadButton,
    ...(isButtonHovered && !isDownloading ? styles.downloadButtonHover : {}),
    ...((isDownloading || !libsLoaded) ? styles.downloadButtonDisabled : {}),
  };

  return (
    <div style={styles.container} ref={dashboardRef}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={styles.titleContainer}>
            <span style={styles.titleMain}>COMPASS</span>
            <span style={styles.titleBy}>by</span>
          </h1>
          <img src="/smartsheet-logo-blue.svg" alt="Smartsheet Logo" style={styles.logo} onError={(e) => { e.target.style.display='none'; }}/>
        </div>

        <div ref={buttonContainerRef}>
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading || !libsLoaded}
            style={finalButtonStyle}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.905 3.079V2.75z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
            <span>{isDownloading ? 'Generating...' : 'Generate Customer Report'}</span>
          </button>
        </div>
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
