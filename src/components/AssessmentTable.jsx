import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AssessmentTable.module.css';
import { useState, useMemo } from 'react';

const AssessmentTable = ({ assessments }) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

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

  const getColumnValue = (row, key) => {
    // The data structure is now a simple object, so we can access properties directly.
    return row[key] || 'N/A';
  };

  const getSortDirectionSymbol = (columnId) => {
    if (sortConfig.key !== columnId) {
      return '';
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  return (
    <table className={styles.table}>
      <thead>
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
        {sortedAssessments.map(assessment => (
          <tr key={assessment.sheetId} onClick={() => handleRowClick(assessment.sheetId)}>
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