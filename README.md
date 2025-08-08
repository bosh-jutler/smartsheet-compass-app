# Smartsheet Compass PPM Dashboard

## 1. Overview

This repository contains the front-end source code for the Smartsheet Compass application, a client-facing SPA built with React and Vite. The application provides customers with a data visualization dashboard for their PPM maturity assessment results, authenticating via Smartsheet's OAuth 2.0 flow and rendering data fetched directly from the Smartsheet API.

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
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173`.

---

## 3. Technical Stack

* **UI Framework**: React (Vite)
* **Routing**: React Router
* **Styling**: Global CSS with brand standards defined as custom properties.
* **Authentication**: Smartsheet OAuth 2.0
* **API**: Smartsheet API

---

## 4. Development Roadmap

### Phase 1: Foundation (Current)

* **Objective**: Establish the core application structure.
* **Key Tasks**: Configure project with Vite, define global styles and directory structure.

### Phase 2: Authentication & API Integration

* **Objective**: Connect to Smartsheet services.
* **Key Tasks**: Implement OAuth 2.0 login flow, build API service layer for data fetching, and manage auth state.

### Phase 3: UI & Dashboard Development

* **Objective**: Build the user interface.
* **Key Tasks**: Develop reusable component library, construct application pages, and build the "bento box" data visualization dashboard.