import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AssessmentTable.module.css';

// --- Helper Functions ---

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

const AssessmentTable = ({
  assessments,
  getScoreDetails,
  requestSort,
  sortConfig,
  currentPage,
  totalPages,
  setCurrentPage,
  totalRows,
  rowsPerPage
}) => {
  const navigate = useNavigate();

  const handleRowClick = (assessmentId) => {
    navigate(`/dashboard?id=${assessmentId}`);
  };

  const getSortDirectionSymbol = (columnId) => {
    if (sortConfig.key !== columnId) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  // --- Pagination Logic ---
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRows);

  return (
    <div className={styles.paginationContainer}>
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
          {assessments.map((assessment, index) => {
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

      {/* --- Pagination Controls --- */}
      {totalPages > 1 && (
         <div className={styles.paginationControls}>
            <span className={styles.paginationInfo}>
                Showing {startRow}–{endRow} of {totalRows}
            </span>
            <div className={styles.paginationButtons}>
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <button onClick={handleNextPage} disabled={currentPage >= totalPages}>
                    Next
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentTable;
