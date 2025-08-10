import React, { useEffect, useRef } from 'react';
import styles from './LoadingComponent.module.css';

const LoadingComponent = () => {
  const rippleContainerRef = useRef(null);

  const playRipple = () => {
    const rippleContainer = rippleContainerRef.current;
    if (!rippleContainer) return;

    // Clear any previous animation elements
    rippleContainer.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = styles.rippleGrid;

    const cells = [];

    // Create the 5x5 grid of cells
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = styles.cell;
      const row = Math.floor(i / 5);
      const col = i % 5;
      // Stagger the start of each cell's ripple animation
      cell.style.animationDelay = `${(row + col) * 0.027}s`;
      grid.appendChild(cell);
      cells.push(cell);
    }
    rippleContainer.appendChild(grid);

    // --- CONVERGENCE LOGIC ---
    const convergenceDelay = 1000;
    setTimeout(() => {
      const gridRect = grid.getBoundingClientRect();
      const centerX = gridRect.width / 2;
      const centerY = gridRect.height / 2;

      cells.forEach(cell => {
        const tx = centerX - (cell.offsetLeft + cell.offsetWidth / 2);
        const ty = centerY - (cell.offsetTop + cell.offsetHeight / 2);

        cell.style.setProperty('--tx', `${tx}px`);
        cell.style.setProperty('--ty', `${ty}px`);

        cell.classList.add(styles.converging);
      });

      // --- LOGO APPEARANCE ---
      const logoAppearanceDelay = 600;
      setTimeout(() => {
        const logo = document.createElement('img');
        logo.className = styles.placeholderLogo;
        logo.src = '/smartsheet-logo-blue.svg';
        logo.alt = 'Smartsheet Logo';
        rippleContainer.appendChild(logo);
      }, logoAppearanceDelay);
    }, convergenceDelay);
  };

  useEffect(() => {
    playRipple();
  }, []);

  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.loaderContainer} ref={rippleContainerRef}></div>
    </div>
  );
};

export default LoadingComponent;