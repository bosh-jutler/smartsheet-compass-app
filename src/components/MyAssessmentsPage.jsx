import React, { useState, useEffect } from 'react';
import AssessmentTable from './AssessmentTable';
import LoadingComponent from './LoadingComponent';
import styles from './MyAssessmentsPage.module.css';

const MyAssessmentsPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ email: 'user@example.com' }); // Mock user

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        // Simulate a longer loading time to showcase the animation
        await new Promise(resolve => setTimeout(resolve, 2000));
        const response = await fetch(`/api/assessments`);
        if (!response.ok) {
          throw new Error('Failed to fetch assessments.');
        }
        const data = await response.json();
        // The backend now handles filtering, so we can use the data directly.
        setAssessments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <div className={styles.empty}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>MY ASSESSMENTS</h1>
      {assessments.length > 0 ? (
        <AssessmentTable assessments={assessments} />
      ) : (
        <div className={styles.empty}>You have not submitted any assessments yet.</div>
      )}
    </div>
  );
};

export default MyAssessmentsPage;