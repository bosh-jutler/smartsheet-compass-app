// src/components/IndustryChartWidget.jsx

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

// A skeleton loader component specifically for this chart
const IndustryChartSkeleton = () => {
  const shimmerKeyframes = `
    @keyframes shimmer {
      0% { background-position: -1200px 0; }
      100% { background-position: 1200px 0; }
    }
  `;

  // Base style for the shimmering elements
  const skeletonBaseStyle = {
    animation: 'shimmer 2s infinite linear',
    backgroundImage: 'linear-gradient(to right, #e2e8f0 8%, #f1f5f9 18%, #e2e8f0 33%)',
    backgroundSize: '1200px 100%',
    borderRadius: '4px',
  };

  // Main container for the skeleton layout
  const containerStyle = {
    display: 'flex',
    width: '100%',
    height: '100%',
    paddingLeft: '40px', // Matches BarChart margin.left
    paddingRight: '30px', // Matches BarChart margin.right
    boxSizing: 'border-box',
  };

  // Container for the fake labels on the left
  const labelsContainerStyle = {
    width: '150px', // Matches YAxis width
    paddingRight: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  };

  // Container for the fake bars on the right
  const barsContainerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  };

  const labelStyle = {
    ...skeletonBaseStyle,
    height: '16px',
    width: '75%',
  };

  const barStyle = {
    ...skeletonBaseStyle,
    height: '25px', // Matches barSize
  };

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div style={containerStyle}>
        <div style={labelsContainerStyle}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={labelStyle} />
          ))}
        </div>
        <div style={barsContainerStyle}>
          {[...Array(5)].map((_, i) => (
            // Randomize bar width for a more realistic look
            <div key={i} style={{ ...barStyle, width: `${Math.random() * 40 + 50}%` }} />
          ))}
        </div>
      </div>
    </>
  );
};

const IndustryChartWidget = () => {
  const [industryData, setIndustryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barColor, setBarColor] = useState('#0d9488'); // A default teal color
  
  // State to hold the dynamically calculated layout properties
  const [chartLayout, setChartLayout] = useState({
    fontSize: 16,
    barSize: 25,
    yAxisWidth: 150,
    labelFontSize: 12, // Add initial state for the label font size
  });

  // Effect for fetching and processing data
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const response = await fetch('/api/assessments');
        if (!response.ok) {
          throw new Error('Failed to fetch assessment data for the chart.');
        }
        const assessments = await response.json();
        const counts = assessments.reduce((acc, assessment) => {
          const industry = assessment.industry || 'Unknown';
          acc[industry] = (acc[industry] || 0) + 1;
          return acc;
        }, {});
        const chartData = Object.keys(counts)
          .map(industry => ({
            name: industry,
            assessments: counts[industry],
          }))
          .sort((a, b) => b.assessments - a.assessments);
        setIndustryData(chartData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const tealColor = getComputedStyle(document.documentElement).getPropertyValue('--brand-teal-500').trim();
    if (tealColor) {
      setBarColor(tealColor);
    }

    fetchAssessmentData();
  }, []);

  // Effect for calculating dynamic layout based on data
  useEffect(() => {
    if (industryData.length > 0) {
      // Define base values and limits for scaling
      const minFontSize = 12;
      const maxFontSize = 16;
      const minBarSize = 15;
      const maxBarSize = 30;
      const containerHeight = 240; // Approximate height available for bars

      // --- Calculate Bar Size ---
      const calculatedBarSize = (containerHeight / industryData.length) * 0.7;
      const newBarSize = Math.max(minBarSize, Math.min(maxBarSize, calculatedBarSize));

      // --- Calculate Y-Axis Font Size ---
      let newFontSize = maxFontSize;
      if (newBarSize < 20) newFontSize = 14;
      if (newBarSize < 18) newFontSize = minFontSize;
      
      // --- Calculate Y-Axis Width ---
      const longestLabelLength = industryData.reduce((max, item) => Math.max(max, item.name.length), 0);
      const estimatedCharWidth = newFontSize * 0.6;
      const newYAxisWidth = Math.max(150, longestLabelLength * estimatedCharWidth);

      // --- Calculate Data Label Font Size (inside the bar) ---
      let newLabelFontSize = 14; // Increased the base font size
      if (newBarSize < 25) newLabelFontSize = 12; // Adjusted threshold for medium size
      if (newBarSize < 20) newLabelFontSize = 11; // Adjusted threshold for smaller size

      setChartLayout({
        fontSize: newFontSize,
        barSize: Math.floor(newBarSize),
        yAxisWidth: Math.min(250, Math.ceil(newYAxisWidth)),
        labelFontSize: newLabelFontSize, // Set the dynamic label font size
      });
    }
  }, [industryData]);

  // Styles for the card container
  const cardStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    height: '300px',
    display: 'flex',
    flexDirection: 'column',
  };

  if (isLoading) {
    return (
      <div style={cardStyle}>
        <IndustryChartSkeleton />
      </div>
    );
  }

  if (error) {
    return <div style={cardStyle}>Error: {error}</div>;
  }

  return (
    <div style={cardStyle}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={industryData}
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: chartLayout.fontSize, fill: '#475569', fontWeight: 600 }}
            width={chartLayout.yAxisWidth}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }}
            contentStyle={{
              backgroundColor: 'white',
              borderRadius: '8px',
              borderColor: '#e2e8f0',
            }}
          />
          <Bar 
            dataKey="assessments" 
            barSize={chartLayout.barSize} 
            fill={barColor}
          >
            <LabelList 
              dataKey="assessments" 
              position="insideRight" 
              style={{ fill: 'white', fontSize: chartLayout.labelFontSize, fontWeight: 'bold' }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IndustryChartWidget;