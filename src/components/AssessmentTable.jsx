import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AssessmentTable.module.css';

const AssessmentTable = ({ assessments }) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

  // Your sorting logic and other functions remain perfectly fine.
  const sortedAssessments = useMemo(() => {
    let sortableItems = [...assessments];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [assessments, sortConfig]);
  
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleRowClick = (assessmentId) => {
    navigate(`/dashboard?id=${assessmentId}`);
  };

  const getSortDirectionSymbol = (columnId) => {
    if (sortConfig.key !== columnId) {
      return '';
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  return (
    // The table itself is the main container. No extra wrappers needed.
    <table className={styles.table}>
      <thead>
        {/* The header will appear instantly, providing a nice anchor point */}
        <tr>
          <th onClick={() => requestSort('date')}>
            Created Date{getSortDirectionSymbol('date')}
          </th>
          <th onClick={() => requestSort('name')}>
            Customer Name{getSortDirectionSymbol('name')}
          </th>
          <th onClick={() => requestSort('industry')}>
            Industry{getSortDirectionSymbol('industry')}
          </th>
          <th onClick={() => requestSort('maturityScore')}>
            Maturity Score{getSortDirectionSymbol('maturityScore')}
          </th>
        </tr>
      </thead>
      <tbody>
        {/* KEY CHANGE: Get the 'index' from the map function */}
        {sortedAssessments.map((assessment, index) => (
          <tr
            key={assessment.sheetId}
            onClick={() => handleRowClick(assessment.sheetId)}
            // 1. Add the animation class
            className={styles.rowAnimate}
            // 2. Add the dynamic animation delay using an inline style
            style={{ animationDelay: `${index * 0.05}s` }} // Stagger each row by 50ms
          >
            <td>{assessment.date}</td>
            <td>{assessment.name}</td>
            <td>{assessment.industry || 'N/A'}</td>
            <td>{assessment.maturityScore || 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AssessmentTable;