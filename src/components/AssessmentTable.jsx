import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AssessmentTable.module.css';

// --- Helper Functions ---

/**
 * Calculates display properties and a label for the maturity score.
 * @param {number} score - The maturity score (0-100).
 * @returns {object} An object with width, color class, and a text label.
 */
const getScoreDetails = (score) => {
  if (score === null || score === undefined) {
    return { width: '0%', colorClass: '', label: '' };
  }
  const scoreNum = Number(score);
  let colorClass = 'low';
  let label = 'Initial'; // Default for scores 50 and below

  if (scoreNum >= 81) {
    colorClass = 'high';
    label = 'Optimized';
  } else if (scoreNum >= 51) {
    colorClass = 'medium';
    label = 'Defined';
  }

  return {
    width: `${scoreNum}%`,
    colorClass: styles[colorClass], // e.g., styles.low, styles.medium
    label: label,
  };
};

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

const AssessmentTable = ({ assessments }) => {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

  // Sorting logic remains the same.
  const sortedAssessments = useMemo(() => {
    let sortableItems = [...assessments];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
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
                  <div className={styles.scoreBarContainer}>
                    <div
                      className={`${styles.scoreBar} ${scoreDetails.colorClass}`}
                      style={{ width: scoreDetails.width }}
                    />
                  </div>
                  {assessment.maturityScore !== null && assessment.maturityScore !== undefined && (
                     <span className={`${styles.scoreLabel} ${scoreDetails.colorClass}`}>
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