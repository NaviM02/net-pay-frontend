# 🎨 Frontend Client - NetPay Manager

This repository contains the user interface (UI) and client-side experience for the **NetPay Manager** application. 

Developed with **Angular**, this Single Page Application (SPA) is fully decoupled from the backend server, communicating exclusively via asynchronous HTTP services that consume the REST API.

## 🛠️ Tech Stack
* **Angular 17 / 18** - Component-based framework for scalable web apps.
* **TypeScript** - Strongly typed programming language for client logic.
* **HTML5 & CSS3 / SCSS** - Structural layout and responsive web design.
* **Node.js & npm** - Runtime environment and package management.

## 🔌 API Integration
The client is configured to connect to the Spring Boot REST API (defaulting to `http://localhost:8080`). Environment-specific variables (like backend base URLs) can be managed inside the `src/environments/` folder.

## ⚙️ Local Development Setup
1. Install the required project dependencies:
```bash
npm install
```
2. Start the local development server with real-time compilation (*Hot Reload*):
```bash
ng serve
```
3. Open your browser and navigate to `http://localhost:4200/`.
