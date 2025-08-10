import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AssessmentTable.module.css';

// --- Helper Functions ---

// REMOVED: getScoreDetails function is now passed in as a prop.

/**
 * Formats a YYYY-MM-DD date string into a more readable format.
 * @param {string} dateString - The date string e.g., "2025-07-24".
 * @returns {string} Formatted date e.g., "Jul 24, 2025".
 */
const formatDisplayDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString + 'T00:00:00'); // Assume UTC to avoid timezone issues
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// --- Main Table Component ---

// 1. Accept getScoreDetails as a prop
const AssessmentTable = ({ assessments, getScoreDetails }) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

  // Sorting logic remains the same.
  const sortedAssessments = useMemo(() => {
    let sortableItems = [...assessments];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // ... sorting logic is unchanged
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
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
    if (sortConfig.key !== columnId) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th onClick={() => requestSort('date')}>Created{getSortDirectionSymbol('date')}</th>
          <th onClick={() => requestSort('name')}>Customer{getSortDirectionSymbol('name')}</th>
          <th onClick={() => requestSort('industry')}>Industry{getSortDirectionSymbol('industry')}</th>
          <th className={styles.cellNumeric} onClick={() => requestSort('maturityScore')}>
            Maturity Score{getSortDirectionSymbol('maturityScore')}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedAssessments.map((assessment, index) => {
          // 2. Use the getScoreDetails function from props
          const scoreDetails = getScoreDetails(assessment.maturityScore);

          return (
            <tr
              key={assessment.sheetId}
              onClick={() => handleRowClick(assessment.sheetId)}
              className={styles.rowAnimate}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <td>{formatDisplayDate(assessment.date)}</td>
              <td>{assessment.name}</td>
              <td>{assessment.industry || 'N/A'}</td>
              <td className={styles.cellNumeric}>
                <div className={styles.scoreContainer}>
                  <span className={styles.scoreText}>{assessment.maturityScore ?? 'N/A'}</span>
                  {scoreDetails.label && (
                    // 3. Apply the style class based on the name returned from the helper
                    <span className={`${styles.scoreLabel} ${styles[scoreDetails.colorClassName]}`}>
                      {scoreDetails.label}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default AssessmentTable;