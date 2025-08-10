import React, { useState, useEffect, useMemo } from 'react';
import AssessmentTable from './AssessmentTable';
import LoadingComponent from './LoadingComponent';
import styles from './MyAssessmentsPage.module.css';

// 1. Define the helper function here. It now returns a simple class name.
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedMaturity, setSelectedMaturity] = useState(''); // 2. State for maturity filter

  useEffect(() => {
    // ... useEffect hook is unchanged
    const fetchAssessments = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
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

  // Dynamically generate industry options (unchanged)
  const industryOptions = useMemo(() => {
    const uniqueIndustries = new Set(
      assessments.map(assessment => assessment.industry).filter(Boolean)
    );
    return Array.from(uniqueIndustries).sort();
  }, [assessments]);

  // 3. Dynamically generate maturity options with a defined sort order
  const maturityOptions = useMemo(() => {
    const maturityOrder = ['Initial', 'Defined', 'Optimized'];
    const uniqueMaturities = new Set(
      assessments.map(a => getScoreDetails(a.maturityScore).label).filter(Boolean)
    );
    return Array.from(uniqueMaturities).sort((a, b) => maturityOrder.indexOf(a) - maturityOrder.indexOf(b));
  }, [assessments]);

  // 4. Update filtering logic to include all three filters
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const nameMatch = assessment.name.toLowerCase().includes(searchQuery.toLowerCase());
      const industryMatch = !selectedIndustry || assessment.industry === selectedIndustry;
      const maturityLabel = getScoreDetails(assessment.maturityScore).label;
      const maturityMatch = !selectedMaturity || maturityLabel === selectedMaturity;
      return nameMatch && industryMatch && maturityMatch;
    });
  }, [assessments, searchQuery, selectedIndustry, selectedMaturity]);

  if (isLoading) return <LoadingComponent />;
  if (error) return <div className={styles.empty}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>MY ASSESSMENTS</h1>
      
      <div className={styles.controlsContainer}>
        <input
          type="text"
          placeholder="Search by customer name..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className={styles.filterSelect} // Use generic class
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
        >
          <option value="">All Industries</option>
          {industryOptions.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
        {/* 5. Add the new dropdown for Maturity */}
        <select
          className={styles.filterSelect} // Use generic class
          value={selectedMaturity}
          onChange={(e) => setSelectedMaturity(e.target.value)}
        >
          <option value="">All Maturities</option>
          {maturityOptions.map(maturity => (
            <option key={maturity} value={maturity}>{maturity}</option>
          ))}
        </select>
      </div>

      {assessments.length > 0 ? (
        filteredAssessments.length > 0 ? (
          // 6. Pass the getScoreDetails function as a prop
          <AssessmentTable assessments={filteredAssessments} getScoreDetails={getScoreDetails} />
        ) : (
          <div className={styles.empty}>No matching assessments found.</div>
        )
      ) : (
        <div className={styles.empty}>You have not submitted any assessments yet.</div>
      )}
    </div>
  );
};

export default MyAssessmentsPage;