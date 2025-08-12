import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const BackgroundShapes = () => {
  const svgContainerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  };

  return (
    <div style={svgContainerStyle}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 1024"
        preserveAspectRatio="xMidYMid slice"
      >
        <g fillRule="evenodd" fillOpacity="0.4">
          {/* Left Side Shapes */}
          <g fill="#7847DC"> {/* Purple */}
            {/* Changed back to a half-circle */}
            <path d="M-50 250 A 200 200 0 0 1 -50 650 Z" />
          </g>
          <g fill="#ebad1c"> {/* Gold */}
            <path d="M-120 700 L280 850 L220 1100 L-100 1050 Z" />
          </g>
          
          {/* Right Side Shapes */}
          <g fill="#05705a"> {/* Green */}
            <path d="M1620 -50 L1180 120 L1250 420 L1600 320 Z" />
          </g>
          <g fill="#7847DC"> {/* Purple */}
            <path d="M1580 480 L1200 550 L1250 850 L1560 780 Z" />
          </g>
          <g fill="#ebad1c"> {/* Gold */}
            <path d="M1600 880 L1300 1124 L1550 1150 L1650 1000 Z" />
          </g>
        </g>
      </svg>
    </div>
  );
};


// A simple placeholder for the LoadingComponent
const LoadingComponent = () => {
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      fontFamily: '"TT Norms", sans-serif',
      color: '#555',
    },
  };
  return <div style={styles.container}>Loading...</div>;
};

// A reusable card component
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
    color: 'var(--brand-blue-700, #1d4ed8)',
    opacity: 0.9,
    marginBottom: '8px',
  };

  const valueStyle = {
    fontSize: '40px',
    fontWeight: '600',
    color: 'var(--brand-sky-500, #0ea5e9)',
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
  const [pdfError, setPdfError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const dashboardRef = useRef(null);
  const buttonContainerRef = useRef(null);

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
      setPdfError('PDF export is unavailable.');
    });
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const mockData = {
          metrics: [
            { title: "Customer Name", value: "Terraverde Logistics" },
            { title: "Industry", value: "Transportation" },
            { title: "Created Date", value: "Aug 11, 2025" },
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
    if (!dashboardRef.current || !libsLoaded || pdfError) return;
    setIsDownloading(true);

    if (buttonContainerRef.current) {
        buttonContainerRef.current.style.visibility = 'hidden';
    }

    try {
      const { jsPDF } = window.jspdf;
      const canvas = await window.html2canvas(dashboardRef.current, {
        scale: 3,
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
      setPdfError("An error occurred while generating the PDF.");
    } finally {
      if (buttonContainerRef.current) {
        buttonContainerRef.current.style.visibility = 'visible';
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
      fontFamily: '"TT Norms", sans-serif',
      position: 'relative',
      overflow: 'hidden',
    },
    contentWrapper: {
      position: 'relative',
      zIndex: 1,
    },
    header: {
      display: 'flex',
      alignItems: 'flex-end',
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
    },
    grid: {
      display: 'grid',
      gap: '24px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    },
  };
  
  const allButtonStyles = `
    .download-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 500;
      border-radius: 12px;
      cursor: pointer;
      background-color: transparent;
      color: #031c59;
      border: 2px solid #031c59;
    }
    .download-button:hover:not(:disabled) {
      background-color: #031c59;
      color: #ffffff;
    }
    .download-button:disabled {
      background-color: transparent;
      color: #9ca3af;
      border-color: #d1d5db;
      cursor: not-allowed;
    }
  `;

  return (
    <div style={styles.container} ref={dashboardRef}>
      <style>{allButtonStyles}</style>
      <BackgroundShapes />
      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <h1 style={styles.titleContainer}>
            <span style={styles.titleMain}>COMPASS</span>
          </h1>
          <div ref={buttonContainerRef}>
            <button
              className="download-button"
              onClick={handleDownloadPdf}
              disabled={isDownloading || !libsLoaded || pdfError}
              title={pdfError || ''}
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
            {dashboardData.metrics.map((metric) => (
              <DashboardCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
              />
            ))}
          </div>
        ) : (
          <p>No dashboard data found.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;