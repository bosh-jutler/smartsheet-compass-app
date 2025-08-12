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
          <g fill="#7847DC"><path d="M-50 250 A 200 200 0 0 1 -50 650 Z" /></g>
          <g fill="#ebad1c"><path d="M-120 700 L280 850 L220 1100 L-100 1050 Z" /></g>
          <g fill="#05705a"><path d="M1620 -50 L1180 120 L1250 420 L1600 320 Z" /></g>
          <g fill="#7847DC"><path d="M1580 480 L1200 550 L1250 850 L1560 780 Z" /></g>
          <g fill="#ebad1c"><path d="M1600 880 L1300 1124 L1550 1150 L1650 1000 Z" /></g>
        </g>
      </svg>
    </div>
  );
};

const LoadingComponent = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', fontFamily: '"TT Norms", sans-serif', color: '#555' }}>
        Loading Report...
    </div>
);

const ExecutiveSummaryCard = ({ summary }) => {
  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '32px 40px',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
  };
  const titleStyle = {
    fontSize: '22px',
    fontWeight: '600',
    color: '#031c59',
    marginBottom: '16px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '12px',
  };
  const textStyle = {
    fontSize: '16px',
    color: '#334155',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
  };
  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>Executive Summary</h3>
      <p style={textStyle}>{summary}</p>
    </div>
  );
};

// ====================================================================
// START: This component has been updated
// ====================================================================
const MaturityScoreVisual = ({ score }) => {
    const isValidScore = typeof score === 'number' && score >= 0 && score <= 100;
    const arrowPosition = isValidScore ? Math.max(0, Math.min(100, score)) : 0;

    const styles = {
        wrapper: {
            maxWidth: '800px',
            margin: '80px auto 0 auto',
        },
        indicatorContainer: {
            position: 'relative',
            height: '80px', 
            marginBottom: '4px',
        },
        arrowIndicator: {
            position: 'absolute',
            left: `${arrowPosition}%`,
            top: 0,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'left 0.5s ease-in-out',
            width: '100px',
        },
        bar: {
            display: 'flex',
            height: '120px',
            borderRadius: '8px',
            overflow: 'hidden',
            width: '100%',
        },
        segment: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '900',
            fontSize: '18px',
        },
        scoreText: {
            color: '#031c59',
            fontSize: '28px',
            fontWeight: '700',
            lineHeight: '1.1',
        },
        arrowText: {
            backgroundColor: '#031c59',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            marginTop: '4px',
            marginBottom: '4px',
        },
        arrowDown: {
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #031c59',
        },
        axis: {
            position: 'relative',
            marginTop: '8px',
            height: '20px',
        },
        axisLabel: {
            position: 'absolute',
            color: '#475569',
            fontSize: '14px',
            fontWeight: '500',
        },
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.indicatorContainer}>
                {isValidScore && (
                    <div style={styles.arrowIndicator}>
                        <div style={styles.scoreText}>
                            {Math.round(score)}
                        </div>
                        <div style={styles.arrowText}>You Are Here</div>
                        <div style={styles.arrowDown}></div>
                    </div>
                )}
            </div>

            <div style={styles.bar}>
                <div style={{ ...styles.segment, width: '50%', backgroundColor: '#a87efb' }}>
                    Initial
                </div>
                <div style={{ ...styles.segment, width: '25%', backgroundColor: '#7847dc' }}>
                    Defined
                </div>
                <div style={{ ...styles.segment, width: '25%', backgroundColor: '#26026e' }}>
                    Optimized
                </div>
            </div>

            <div style={styles.axis}>
                <span style={{ ...styles.axisLabel, left: '0%' }}>0</span>
                <span style={{ ...styles.axisLabel, left: '50%', transform: 'translateX(-50%)' }}>50</span>
                <span style={{ ...styles.axisLabel, left: '75%', transform: 'translateX(-50%)' }}>75</span>
                <span style={{ ...styles.axisLabel, right: '0%' }}>100</span>
            </div>
        </div>
    );
};
// ====================================================================
// END: Updated component
// ====================================================================


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
      setPdfError('PDF export libraries failed to load.');
    });
  }, []);

  useEffect(() => {
    if (!sheetId) return;
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/dashboard/${sheetId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch dashboard data.');
        }
        setDashboardData(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [sheetId]);

  const styles = {
    container: {
      padding: '48px 32px',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
      fontFamily: '"TT Norms", sans-serif',
      display: 'flex',
      justifyContent: 'center',
      position: 'relative',
    },
    contentWrapper: {
      width: '100%',
      maxWidth: '1200px',
      position: 'relative',
      zIndex: 1,
    },
    header: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: '16px',
      gap: '24px',
    },
    titleMain: {
      fontSize: '60px',
      fontWeight: '900',
      lineHeight: 1.1,
      color: '#031c59',
      wordBreak: 'break-word',
    },
    createdDateText: {
      fontSize: '16px',
      color: '#475569',
      marginTop: '8px',
      marginBottom: '24px',
    },
  };

  const handleDownloadPdf = async () => {
    const element = dashboardRef.current;
    if (!element || !libsLoaded || pdfError || !dashboardData) return;

    setIsDownloading(true);
    if (buttonContainerRef.current) buttonContainerRef.current.style.visibility = 'hidden';

    try {
      const { jsPDF } = window.jspdf;
      
      const canvas = await window.html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: styles.container.backgroundColor,
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const orientation = canvas.width > canvas.height ? 'l' : 'p';

      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [canvas.width, canvas.height],
        hotfixes: ['px_scaling'],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const safeCustomerName = (dashboardData?.customerName || 'Report').replace(/[^a-z0-9]/gi, '_');
      pdf.save(`Compass_Report_${safeCustomerName}.pdf`);
    } catch (err) {
      console.error("Could not generate PDF", err);
      setPdfError("An error occurred while generating the PDF.");
    } finally {
      if (buttonContainerRef.current) buttonContainerRef.current.style.visibility = 'visible';
      setIsDownloading(false);
    }
  };

  if (isLoading) return <LoadingComponent />;
  if (error) return <div style={{textAlign: 'center', paddingTop: '5rem', fontSize: '1.2rem'}}>Error: {error}</div>;
  
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
      background-color: #f0f2f5;
      color: #031c59;
      border: 2px solid #031c59;
      transition: all 0.2s ease-in-out;
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
      <BackgroundShapes />
      <div style={styles.contentWrapper}>
        <div>
          <style>{allButtonStyles}</style>
          <div style={styles.header}>
            <span style={styles.titleMain}>
              {dashboardData?.customerName || 'Customer Report'}
            </span>
            <div ref={buttonContainerRef}>
                <button
                    className="download-button"
                    onClick={handleDownloadPdf}
                    disabled={isDownloading || !libsLoaded || !!pdfError || !dashboardData}
                    title={pdfError || 'Generate a PDF of this report'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.905 3.079V2.75z" />
                        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                    </svg>
                    <span>{isDownloading ? 'Generating...' : 'Generate Customer Report'}</span>
                </button>
            </div>
          </div>
          {dashboardData?.createdDate && (
              <p style={styles.createdDateText}>
              Created on: {dashboardData.createdDate}
              </p>
          )}
          {dashboardData?.executiveSummary ? (
              <ExecutiveSummaryCard summary={dashboardData.executiveSummary} />
          ) : (
              <p>No Executive Summary found for this report.</p>
          )}

          {dashboardData?.maturityScore !== null && typeof dashboardData?.maturityScore !== 'undefined' && (
              <MaturityScoreVisual score={dashboardData.maturityScore} />
          )}
          
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;