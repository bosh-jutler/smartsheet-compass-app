import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const RadarChartWidget = ({ data }) => {
  const chartData = [
    { subject: 'Demand & Intake Management', A: data.diAverage, B: data.diScore, fullMark: 100 },
    { subject: 'Work Sourcing & Planning', A: data.wspAverage, B: data.wspScore, fullMark: 100 },
    { subject: 'Work Execution', A: data.weAverage, B: data.weScore, fullMark: 100 },
    { subject: 'Work & Portfolio Reporting', A: data.wprAverage, B: data.wprScore, fullMark: 100 },
    { subject: 'Portfolio Prioritization', A: data.ppAverage, B: data.ppScore, fullMark: 100 },
    { subject: 'Strategic Planning', A: data.spAverage, B: data.spScore, fullMark: 100 },
  ];

  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis />
          <Radar name="Industry Average" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Radar name="Your Company" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartWidget;