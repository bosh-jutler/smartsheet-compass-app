import React, { useState, useEffect, useMemo } from 'react';
import AssessmentTable from './AssessmentTable';
import LoadingComponent from './LoadingComponent';
import MetricWidget from './MetricWidget';
import IndustryChartWidget from './IndustryChartWidget'; // Import the new chart widget
import styles from './MyAssessmentsPage.module.css';

// Helper function to determine score label and color
const getScoreDetails = (score) => {
  if (score === null || score === undefined) {
    return { colorClassName: '', label: '' };
  }
  const scoreNum = Number(score);
  let colorClassName = 'low';
  let label = 'Initial'; // Default for scores 50 and below

  if (scoreNum >= 81) {
    colorClassName = 'high';
    label = 'Optimized';
  } else if (scoreNum >= 51) {
    colorClassName = 'medium';
    label = 'Defined';
  }

  return { colorClassName, label };
};

const MyAssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ email: 'user@example.com' });

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedMaturity, setSelectedMaturity] = useState('');

  // State for sorting
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    // Fetching data from the API endpoint
    const fetchAssessments = async () => {
      try {
        const response = await fetch(`/api/assessments`);
        if (!response.ok) {
          throw new Error('Failed to fetch assessments.');
        }
        const data = await response.json();
        setAssessments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  // Generate unique industry options for the filter dropdown
  const industryOptions = useMemo(() => {
    const uniqueIndustries = new Set(
      assessments.map(assessment => assessment.industry).filter(Boolean)
    );
    return Array.from(uniqueIndustries).sort();
  }, [assessments]);

  // Generate unique maturity options with a defined sort order
  const maturityOptions = useMemo(() => {
    const maturityOrder = ['Initial', 'Defined', 'Optimized'];
    const uniqueMaturities = new Set(
      assessments.map(a => getScoreDetails(a.maturityScore).label).filter(Boolean)
    );
    return Array.from(uniqueMaturities).sort((a, b) => maturityOrder.indexOf(a) - maturityOrder.indexOf(b));
  }, [assessments]);

  // Function to request a sort change
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
  };

  // Memoized hook to filter and sort assessments
  const processedAssessments = useMemo(() => {
    let filtered = assessments.filter(assessment => {
      const nameMatch = assessment.name.toLowerCase().includes(searchQuery.toLowerCase());
      const industryMatch = !selectedIndustry || assessment.industry === selectedIndustry;
      const maturityLabel = getScoreDetails(assessment.maturityScore).label;
      const maturityMatch = !selectedMaturity || maturityLabel === selectedMaturity;
      return nameMatch && industryMatch && maturityMatch;
    });

    if (sortConfig.key !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [assessments, searchQuery, selectedIndustry, selectedMaturity, sortConfig]);
  
  // Reset to page 1 if filters change
  useEffect(() => {
    if (currentPage !== 1) {
        setCurrentPage(1);
    }
  }, [searchQuery, selectedIndustry, selectedMaturity]);

  // Memoized hook to paginate the processed assessments
  const paginatedAssessments = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return processedAssessments.slice(startIndex, startIndex + rowsPerPage);
  }, [processedAssessments, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedAssessments.length / rowsPerPage);

  if (isLoading) return <LoadingComponent />;
  if (error) return <div className={styles.empty}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.header}>MY ASSESSMENTS</h1>
      </div>

      {/* Container for the metric widgets */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'stretch' }}>
        <div style={{ flex: '1 1 30%' }}>
          <MetricWidget />
        </div>
        <div style={{ flex: '1 1 70%' }}>
          <IndustryChartWidget />
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.controlsContainer}>
          <div className={styles.filters}>
            <input
              type="text"
              placeholder="Search by customer name..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className={styles.filterSelect}
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              <option value="">All Industries</option>
              {industryOptions.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            <select
              className={styles.filterSelect}
              value={selectedMaturity}
              onChange={(e) => setSelectedMaturity(e.target.value)}
            >
              <option value="">All Maturities</option>
              {maturityOptions.map(maturity => (
                <option key={maturity} value={maturity}>{maturity}</option>
              ))}
            </select>
          </div>
          <a
            href="https://app.smartsheet.com/b/form/ffbeac0824eb40b487a18cc80eabb79b"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.newAssessmentButton}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Start New Assessment</span>
          </a>
        </div>

        {assessments.length > 0 ? (
          processedAssessments.length > 0 ? (
            <AssessmentTable
              assessments={paginatedAssessments}
              getScoreDetails={getScoreDetails}
              requestSort={requestSort}
              sortConfig={sortConfig}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              totalRows={processedAssessments.length}
              rowsPerPage={rowsPerPage}
            />
          ) : (
            <div className={styles.empty}>No matching assessments found.</div>
          )
        ) : (
          <div className={styles.empty}>You have not submitted any assessments yet.</div>
        )}
      </div>
    </div>
  );
};

export default MyAssessmentsPage;
