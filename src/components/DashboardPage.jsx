import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Assuming a LoadingComponent exists in './LoadingComponent'
// If not, you can replace it with: const LoadingComponent = () => <div>Loading...</div>;
import LoadingComponent from './LoadingComponent';
import RadarChartWidget from './RadarChartWidget';


// ====================================================================
// Reusable Utility Functions
// ====================================================================

/**
 * Generates and downloads a PDF of the specified HTML element.
 * @param {React.RefObject<HTMLElement>} elementRef - A ref to the element to capture.
 * @param {object} dashboardData - The data for naming the file.
 * @returns {Promise<void>}
 */
const generatePdf = async (elementRef, dashboardData) => {
  const element = elementRef.current;
  if (!element) {
    throw new Error("PDF generation failed: element not found.");
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#f0f2f5', // Match the page background
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'l' : 'p',
    unit: 'px',
    format: [canvas.width, canvas.height],
    hotfixes: ['px_scaling'],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  const safeCustomerName = (dashboardData?.customerName || 'Report').replace(/[^a-z0-9]/gi, '_');
  pdf.save(`Compass_Report_${safeCustomerName}.pdf`);
};


// ====================================================================
// Child Components
// ====================================================================

const BackgroundShapes = () => {
  const svgContainerStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0, overflow: 'hidden',
  };
  return (
    <div style={svgContainerStyle}>
      <svg width="100%" height="100%" viewBox="0 0 1440 1024" preserveAspectRatio="xMidYMid slice">
        <g fillRule="evenodd" fillOpacity="0.4">
          <g fill="#05705a"><path d="M-50 250 A 200 200 0 0 1 -50 650 Z" /></g>
          <g fill="#ebad1c"><path d="M1580 480 L1200 550 L1250 850 L1560 780 Z" /></g>
          <g fill="#ebad1c"><path d="M1600 880 L1300 1124 L1550 1150 L1650 1000 Z" /></g>
        </g>
      </svg>
    </div>
  );
};

const MaturityScoreVisual = ({ score }) => {
  const gaugeConfig = {
    width: 440, height: 220, radius: 180, strokeWidth: 50,
    colors: { initial: '#a87efb', defined: '#7847dc', optimized: '#26026e', indicator: '#031c59', label: '#64748b' },
    legend: [
        { name: 'Initial', range: '0-50', color: '#a87efb' },
        { name: 'Defined', range: '50-75', color: '#7847dc' },
        { name: 'Optimized', range: '75-100', color: '#26026e' },
    ],
    labels: {
      numeric: [
        { text: '0', value: 0 }, { text: '25', value: 25 }, { text: '50', value: 50 },
        { text: '75', value: 75 }, { text: '100', value: 100 },
      ],
    }
  };
  
  const { width, height, radius, strokeWidth, colors } = gaugeConfig;
  const cx = width / 2;
  const cy = height;
  const arcCircumference = Math.PI * radius;
  const isValidScore = typeof score === 'number' && score >= 0 && score <= 100;
  const finalScore = isValidScore ? score : 0;
  const roundedScore = Math.round(finalScore);

  const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return { x: centerX + r * Math.cos(angleInRadians), y: centerY + r * Math.sin(angleInRadians) };
  };
  const getLabelPos = (scoreValue, r) => {
    const angle = (scoreValue / 100) * 180;
    const pos = polarToCartesian(cx, cy, r, angle);
    return { left: `${pos.x}px`, top: `${pos.y}px`, transform: 'translate(-50%, -50%)' };
  };
  
  const fullArcPath = `M ${cx - radius},${cy} A ${radius},${radius} 0 0 1 ${cx + radius},${cy}`;

  const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', margin: '0 auto' },
    legend: { display: 'flex', justifyContent: 'center', gap: '20px' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '8px' },
    legendColorBox: { width: '14px', height: '14px', borderRadius: '3px' },
    legendText: { fontSize: '14px', color: '#334155', fontWeight: '500' },
    gaugeWrapper: { position: 'relative', width: `${width}px`, height: `${height}px` },
    svg: { width: '100%', height: '100%', overflow: 'visible', position: 'absolute', top: 0, left: 0 },
    arc: { fill: 'none', strokeWidth: strokeWidth },
    centerContent: { position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', width: '100%' },
    scoreText: { color: colors.indicator, fontSize: '72px', fontWeight: '900', lineHeight: '1' },
    scoreLabel: { color: '#475569', fontSize: '18px', fontWeight: '600', marginTop: '8px' },
    axisLabel: { position: 'absolute', color: colors.label, fontSize: '14px', fontWeight: '500' },
    valueIndicator: { position: 'absolute', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: `15px solid ${colors.indicator}`, transition: 'transform 0.7s ease, top 0.7s ease, left 0.7s ease' },
  };
  
  const numericLabelRadius = radius + strokeWidth / 2 + 12;
  const indicatorRadius = radius - strokeWidth + 4;
  const indicatorRotation = (finalScore / 100) * 180 - 90;
  const indicatorPosition = getLabelPos(finalScore, indicatorRadius);
  const indicatorTransform = `${indicatorPosition.transform} rotate(${indicatorRotation}deg)`;

  return (
    <div style={styles.container}>
      <div style={styles.gaugeWrapper}>
        <svg style={styles.svg} viewBox={`0 0 ${width} ${height}`}>
            <path d={fullArcPath} style={{ ...styles.arc, stroke: colors.optimized, strokeDasharray: `${arcCircumference * 0.25} ${arcCircumference}`, strokeDashoffset: -(arcCircumference * 0.75) }} />
            <path d={fullArcPath} style={{ ...styles.arc, stroke: colors.defined, strokeDasharray: `${arcCircumference * 0.25} ${arcCircumference}`, strokeDashoffset: -(arcCircumference * 0.5) }} />
            <path d={fullArcPath} style={{ ...styles.arc, stroke: colors.initial, strokeDasharray: `${arcCircumference * 0.5} ${arcCircumference}` }} />
        </svg>
        {gaugeConfig.labels.numeric.map(label => (<div key={label.text} style={{ ...styles.axisLabel, ...getLabelPos(label.value, numericLabelRadius) }}>{label.text}</div>))}
        {isValidScore && (<div style={{ ...styles.valueIndicator, ...indicatorPosition, transform: indicatorTransform }} />)}
        <div style={styles.centerContent}>
            <div style={styles.scoreText}>{isValidScore ? roundedScore : '--'}</div>
            <div style={styles.scoreLabel}>Maturity Score</div>
        </div>
      </div>
      <div style={styles.legend}>
        {gaugeConfig.legend.map(item => (
            <div key={item.name} style={styles.legendItem}>
                <div style={{ ...styles.legendColorBox, backgroundColor: item.color }} />
                <span style={styles.legendText}>{item.name} ({item.range})</span>
            </div>
        ))}
      </div>
    </div>
  );
};

const SummaryAndGaugeCard = ({ summary, score }) => {
    const styles = {
        card: {
            display: 'flex',
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0',
            gap: '40px',
            marginTop: '24px',
            alignItems: 'center',
        },
        summarySection: {
            flex: '1.5',
            paddingRight: '40px',
        },
        summaryTitle: {
            fontSize: '22px',
            fontWeight: '600',
            color: '#031c59',
            marginBottom: '16px',
        },
        summaryText: {
            fontSize: '16px',
            color: '#334155',
            lineHeight: '1.7',
            whiteSpace: 'pre-wrap'
        },
        gaugeSection: {
            flex: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    };

    return (
        <div style={styles.card}>
            <div style={styles.summarySection}>
                <h3 style={styles.summaryTitle}>Executive Summary</h3>
                <p style={styles.summaryText}>{summary || 'No summary available.'}</p>
            </div>
            <div style={styles.gaugeSection}>
                <MaturityScoreVisual score={score} />
            </div>
        </div>
    );
};


// ====================================================================
// Child Components
// ====================================================================

const InfoCard = ({ title, content }) => {
  const styles = {
    card: {
      backgroundColor: '#ffffff',
      padding: '32px',
      borderRadius: '20px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e0e0e0',
      height: '100%',
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
     <h3 style={styles.title}>{title}</h3>
     <div style={styles.content}>{content || 'No data available.'}</div>
   </div>
 );
};


// ====================================================================
// Main Page Component
// ====================================================================

const DashboardPage = () => {
  const { sheetId } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const dashboardRef = useRef(null);
  const buttonContainerRef = useRef(null);

  useEffect(() => {
    if (!sheetId) return;
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/dashboard/${sheetId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `Server responded with status ${response.status}`);
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

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    setPdfError(null);
    if (buttonContainerRef.current) buttonContainerRef.current.style.visibility = 'hidden';
    try {
      await generatePdf(dashboardRef, dashboardData);
    } catch (err) {
      console.error("Could not generate PDF", err);
      setPdfError(err.message);
    } finally {
      if (buttonContainerRef.current) buttonContainerRef.current.style.visibility = 'visible';
      setIsDownloading(false);
    }
  };

  const styles = {
    container: { padding: '48px 32px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: '"TT Norms", sans-serif', display: 'flex', justifyContent: 'center', position: 'relative' },
    contentWrapper: { width: '100%', maxWidth: '1200px', position: 'relative', zIndex: 1 },
    header: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px', gap: '24px' },
    titleMain: { fontSize: '60px', fontWeight: '900', lineHeight: 1.1, color: '#031c59', wordBreak: 'break-word' },
    createdDateText: { fontSize: '16px', color: '#475569', marginTop: '8px', marginBottom: '24px' },
    downloadButton: {
      base: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '16px', fontWeight: '500', borderRadius: '12px', cursor: 'pointer', backgroundColor: '#f0f2f5', color: '#031c59', border: '2px solid #031c59', transition: 'all 0.2s ease-in-out' },
      hover: { backgroundColor: '#031c59', color: '#ffffff' },
      disabled: { backgroundColor: 'transparent', color: '#9ca3af', borderColor: '#d1d5db', cursor: 'not-allowed' }
    }
  };

  const buttonDisabled = isDownloading || !dashboardData || !!pdfError;
  let buttonStyle = styles.downloadButton.base;
  if(buttonDisabled) {
    buttonStyle = { ...buttonStyle, ...styles.downloadButton.disabled };
  } else if (isButtonHovered) {
    buttonStyle = { ...buttonStyle, ...styles.downloadButton.hover };
  }
  
  if (isLoading) return <LoadingComponent />;
  if (error) return <div style={{ textAlign: 'center', paddingTop: '5rem', fontSize: '1.2rem' }}>Error: {error}</div>;

  return (
    <div style={styles.container} ref={dashboardRef}>
      <BackgroundShapes />
      <div style={styles.contentWrapper}>
        <div>
          <div style={styles.header}>
            <span style={styles.titleMain}>{dashboardData?.customerName || 'Customer Report'}</span>
            <div ref={buttonContainerRef}>
              <button style={buttonStyle} onClick={handleDownloadClick} disabled={buttonDisabled} onMouseEnter={() => setIsButtonHovered(true)} onMouseLeave={() => setIsButtonHovered(false)} title={pdfError || 'Generate a PDF of this report'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.905 3.079V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                <span>{isDownloading ? 'Generating...' : 'Generate Customer Report'}</span>
              </button>
            </div>
          </div>
          {dashboardData?.createdDate && <p style={styles.createdDateText}>Created on: {dashboardData.createdDate}</p>}
          
          <SummaryAndGaugeCard
            summary={dashboardData?.executiveSummary}
            score={dashboardData?.maturityScore}
          />

<div style={{ marginTop: '24px' }}>
  <InfoCard
    title="Strengths & Key Findings"
    content={dashboardData?.strengthsAndKeyFindings}
  />
</div>
<div style={{ marginTop: '24px' }}>
  <RadarChartWidget data={dashboardData?.radarChartData} />
</div>
          
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;