/*
 * ==========================================================================
 * App.jsx: Main Application Component & Router Setup
 * ==========================================================================
 *
 * Description:
 * This file serves as the root of the React application. It uses the
 * `react-router-dom` library to handle client-side routing, ensuring
 * that the correct page component is rendered based on the current URL path.
 *
 * Structure:
 * - Imports: Necessary components from React, react-router-dom, and our
 * custom page components.
 * - Component Definition: The main App component that defines the routing
 * logic.
 * - Routing:
 * - `/`: Renders the LoginPage for user authentication.
 * - `/assessments`: Renders the AssessmentListPage to show a list of
 * available assessments.
 * - `/dashboard/:sheetId`: A dynamic route that renders the DashboardPage,
 * passing the `sheetId` from the URL as a parameter.
 *
 * ==========================================================================
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- Placeholder Page Imports ---
// These are placeholder components that will be built out in later steps.
// For now, they can be simple components that just render their own name.
// e.g., const LoginPage = () => <div>LoginPage</div>;
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import MyAssessmentsPage from './components/MyAssessmentsPage';

function App() {
  return (
    // BrowserRouter is the top-level component that enables routing.
    // It keeps the UI in sync with the URL.
    <BrowserRouter>
      {/* The Routes component is a container for all individual Route definitions.
          It looks through its children <Route> elements to find the best match
          for the current URL. */}
      <Routes>
        {/* --- Static Routes --- */}

        {/* This Route handles the root path ('/').
            When the user visits the base URL, the LoginPage component is rendered.
            The 'exact' prop ensures it only matches the root path. */}
        <Route path="/" element={<LoginPage />} />

        {/* This Route handles the '/my-assessments' path.
            It renders the MyAssessmentsPage component. */}
        <Route path="/my-assessments" element={<MyAssessmentsPage />} />

        {/* --- Dynamic Route --- */}

        {/* This is a dynamic route. The ':sheetId' part is a URL parameter.
            'react-router-dom' will match any path like '/dashboard/123' or
            '/dashboard/abc', and the value ('123' or 'abc') will be
            accessible within the DashboardPage component via the useParams hook. */}
        <Route path="/dashboard/:sheetId" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
