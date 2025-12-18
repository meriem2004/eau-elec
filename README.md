# 🌊 RABAT ENERGIE & EAU (REE) - Smart Utility Management

> **Academic Project - Information Systems**
> *RABAT ENERGIE & EAU (REE)*

![Node.js](https://img.shields.io/badge/Backend-Node.js-green) ![React](https://img.shields.io/badge/Frontend-React-blue) ![MySQL](https://img.shields.io/badge/Database-MySQL-orange) ![Docker](https://img.shields.io/badge/DevOps-Docker-blue)

## 📄 Project Context

This project is part of the digital transformation of **Rabat Energie & Eau (REE)**. The goal is to develop the **"SI Relevés"** (Utility Metering Information System), a comprehensive Backoffice Web application for the centralized management of water and electricity meters, clients, and the assignment of field agents.

---

## 🚀 Key Features

The system covers the following functional requirements:

### 🔐 Security & Access Control
* **Secure Authentication:** JWT-based login system for administrators.
* **User Management:** Role-based access control.

### 📊 Dashboard & Analytics
* **Interactive Dashboards:** Visual tracking of key performance indicators (KPIs) such as reading coverage and agent performance.
* **Consumption Trends:** Charts displaying the evolution of water and electricity consumption over time.
* **Report Generation:** Downloadable PDF reports for data analysis.

### 🏢 Core Management Modules
* **Client & Address Management:** Comprehensive database of utility clients and their service addresses.
* **Meter Management:** Lifecycle management of water and electricity meters, including installation and status tracking.
* **Agent Association:** Assignment of field agents to specific zones or districts for efficient reading collection.
* **Readings (Relevés):** Processing of meter readings with automatic consumption calculation (New Index - Old Index).

---

## 🛠 Technical Stack & Architecture

* **Backend:** Node.js with Express.js
* **Frontend:** React.js (Vite) styled with Tailwind CSS
* **Database:** MySQL
* **Containerization:** Docker & Docker Compose
* **API Testing:** Postman / Swagger (if applicable)

---

## ⚙️ Installation & Quick Start

### Prerequisites
* Docker & Docker Compose
* Node.js (for local development)

### Quick Start
1. **Clone the repository**
   ```bash
   git clone https://github.com/meriem2004/eau-elec.git
   cd RABAT-ENERGIE-EAU-REE
   ```

2. **Launch with Docker**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the Application**
   * **Frontend:** `http://localhost:4200`
   * **Backend API:** `http://localhost:3000`

---

## 👥 Project Team

* **Meriem Abboud**
* **Douae Bakkali**
* **Omar Behri**
* **Ilyase Elammary**

---
*Project realized for the "Information Systems" module - December 2025.*