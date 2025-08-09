/*
 * ==========================================================================
 * AssessmentListPage.jsx: Displays a list of available assessments
 * ==========================================================================
 *
 * Description:
 * This component fetches and displays a list of PPM assessments associated
 * with the logged-in user. It manages its own state for loading and errors.
 *
 * On component mount, it makes an API call to our backend endpoint
 * (`/api/assessments`). The browser automatically includes the secure
 * access_token cookie with this request, allowing the backend to make an
 * authenticated call to the Smartsheet API.
 *
 * ==========================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AssessmentListPage = () => {
  // State to hold the list of assessments
  const [assessments, setAssessments] = useState([]);
  // State to manage the loading status
  const [isLoading, setIsLoading] = useState(true);
  // State to hold any potential errors
  const [error, setError] = useState(null);

  // This effect runs once when the component mounts
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        // The browser automatically sends our secure cookie with this request.
        const response = await fetch('/api/assessments');

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
  }, []); // The empty dependency array ensures this runs only once.

  // --- Render Functions for Different States ---

  if (isLoading) {
    // In a real app, this would be a branded spinner component
    return <div>Loading assessments...</div>;
  }

  if (error) {
    // In a real app, this would be a branded error message component
    return <div>Error: {error}</div>;
  }

  // --- Main Component Styles ---
  const styles = {
    container: {
      padding: '48px',
      backgroundColor: 'var(--brand-neutral-35)',
      minHeight: '100vh',
    },
    header: {
      color: 'var(--brand-blue-800)',
      fontSize: '40px',
      fontWeight: '600',
      marginBottom: '32px',
    },
    list: {
      listStyle: 'none',
      padding: 0,
    },
    listItem: {
      backgroundColor: 'var(--brand-white)',
      marginBottom: '16px',
      borderRadius: '15px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      transition: 'transform 0.2s ease-in-out',
    },
    link: {
      display: 'block',
      padding: '24px',
      textDecoration: 'none',
      color: 'var(--brand-blue-800)',
      fontSize: '20px',
      fontWeight: '500',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Your Assessments</h1>
      {assessments.length > 0 ? (
        <ul style={styles.list}>
          {assessments.map((assessment) => (
            <li
              key={assessment.sheetId}
              style={styles.listItem}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Link to={`/dashboard/${assessment.sheetId}`} style={styles.link}>
                {assessment.name} - Completed on {assessment.date}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No assessments found.</p>
      )}
    </div>
  );
};

export default AssessmentListPage;
