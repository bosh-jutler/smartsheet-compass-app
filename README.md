# Smartsheet Compass PPM Dashboard

## 1. Overview

This repository contains the source code for the Smartsheet Compass application, a client-facing SPA built with React and Vite. The application provides customers with a data visualization dashboard for their PPM maturity assessment results, authenticating via Smartsheet's OAuth 2.0 flow and rendering data fetched directly from the Smartsheet API.

---

## 2. Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-org/smartsheet-compass.git](https://github.com/your-org/smartsheet-compass.git)
    cd smartsheet-compass
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    * In one terminal, start the backend: `cd backend && uvicorn main:app --reload`
    * In a second terminal, start the frontend: `npm run dev`

The application will be available at `http://localhost:5173`.

---

## 3. Technical Stack

* **UI Framework**: React (Vite)
* **Backend Framework**: Python (FastAPI)
* **Routing**: React Router
* **Styling**: Global CSS with brand standards defined as custom properties.
* **Authentication**: Smartsheet OAuth 2.0 (server-side flow)
* **API**: Smartsheet API

---

## 4. Development Roadmap

### Phase 1: Foundation (✅ Completed)

* **Objective**: Establish the core application structure.
* **Key Tasks**: Configure project with Vite, define global styles and directory structure, and implement client-side routing.

### Phase 2: Authentication & API Integration (✅ Completed)

* **Objective**: Connect to Smartsheet services.
* **Key Tasks**: Implement a backend-driven OAuth 2.0 login flow, manage tokens in secure cookies, and prepare for API interaction.

### Phase 3: UI & Dashboard Development (Current)

* **Objective**: Build the user interface and fetch live data.
* **Key Tasks**: Develop reusable component library, construct application pages, build the "bento box" data visualization dashboard, and integrate live data from the Smartsheet API.
