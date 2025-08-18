import React, { useState } from 'react';
import styles from './PpmMaturityCard.module.css';

const maturityData = [
  {
    key: 'Initial',
    title: '1. Initial',
    scoreRange: '0-50',
    details: [
      'No defined PPM processes or tools',
      'Ad hoc, random, reactive demand intake',
      'Ad hoc, reactive prioritization of work',
      'No defined metrics',
      'No clear alignment to LOB/enterprise objectives',
      'Business value not an influencing factor',
      'No formal resource management',
    ],
  },
  {
    key: 'Defined',
    title: '2. Defined',
    scoreRange: '51-75',
    details: [
      'PPM processes optimized and managed',
      'PPM Tech stack identified and used',
      'Demand intake stratified, categorized',
      'Business-defined prioritization criteria',
      'Metrics defined and deployed',
      'Alignment to LOB/enterprise objectives',
      'Value planning exists',
      'Resource management introduced',
    ],
  },
  {
    key: 'Optimized',
    title: '3. Optimized',
    scoreRange: '76-100',
    details: [
      'Data-centric optimization of PPM processes',
      'Optimized and fluid technology integration',
      'Proactive demand intake through business engagement',
      'Dynamic, systematic, business-driven prioritization and reprioritization',
      'Metrics drive continuous improvement',
      'Strategic partnership and alignment achieved through converged planning',
      'Benefit and value realization tracked and leveraged',
      'Resource management automated and optimized',
    ],
  },
];

const PpmMaturityCard = ({ maturityScore }) => {
  const getMaturityLevel = (score) => {
    if (score <= 50) return 'Initial';
    if (score <= 75) return 'Defined';
    return 'Optimized';
  };

  const currentLevelKey = getMaturityLevel(maturityScore);
  const [activeTab, setActiveTab] = useState(currentLevelKey);
  const activeLevelData = maturityData.find((level) => level.key === activeTab);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Understanding PPM Maturity</h2>
        <span className={`${styles.badge} ${styles[currentLevelKey.toLowerCase()]}`}>
          Your Level: {currentLevelKey} (Score: {maturityScore}/100)
        </span>
      </div>
      <p>
        PPM (Project Portfolio Management) maturity refers to the level of sophistication, effectiveness, and
        institutionalization of an organization's processes for managing its portfolio of projects and programs.
      </p>

      <div className={styles.mainContent}>
        <div className={styles.tabsAndContent}>
          <div className={styles.tabs}>
            {maturityData.map((level) => (
              <button
                key={level.key}
                className={`${styles.tabButton} ${activeTab === level.key ? styles.active : ''}`}
                onClick={() => setActiveTab(level.key)}
              >
                {level.title}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            <ul>
              {activeLevelData.details.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.pyramidContainer}>
          <div className={styles.pyramid}>
             {/* --- ⭐️ CHANGED: Highlighting is now based on activeTab --- */}
            <div
              className={`${styles.pyramidSection} ${styles.level3} ${
                activeTab === 'Optimized' ? styles.active : ''
              }`}
            ></div>
            <div
              className={`${styles.pyramidSection} ${styles.level2} ${
                activeTab === 'Defined' ? styles.active : ''
              }`}
            ></div>
            <div
              className={`${styles.pyramidSection} ${styles.level1} ${
                activeTab === 'Initial' ? styles.active : ''
              }`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PpmMaturityCard;