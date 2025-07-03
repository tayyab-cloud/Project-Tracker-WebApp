# Project Tracker Web App & Task Management Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white" />
  <img src="https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
</p>

A full-featured, serverless project management web application built entirely on the Google Workspace ecosystem. This application provides a robust and interactive interface for managing tasks, teams, and project progress, using Google Sheets as a no-cost, scalable database.

---

### 🔴 Live Interactive Demo

https://script.google.com/macros/s/AKfycbx_fmc8cTFi61DZFl9WQnO19VfbYlVKRtHMY4m2xnaRY8GFyHU-S7_-QIqkscyyVE1-/exec

> **Note:** The live demo is configured to grant **Admin access** to all visitors for a full-featured showcase. The original codebase includes a secure, role-based authentication system.

---

### 📸 Project Showcase

![Dashboard](https://github.com/user-attachments/assets/625059d7-415d-437c-93aa-265101d51f29)![Dashboard-1](https://github.com/user-attachments/assets/c8d21296-a59a-4deb-82fd-c81557ba1c8b)
![Task](https://github.com/user-attachments/assets/b3534f72-29c7-4df3-b4ff-dea16e8094f3)![Task Add](https://github.com/user-attachments/assets/bcdfd690-60b3-4b00-b529-61be5d95db8e)
![Edit task](https://github.com/user-attachments/assets/eefc1e61-4c08-41b7-8d21-24e94db1c1c2)![Team](https://github.com/user-attachments/assets/4c9690c7-c958-4115-9574-e299e8997633)
![Team add](https://github.com/user-attachments/assets/414e7d54-4a38-4e5f-9340-d556344be7c7)![mobile response](https://github.com/user-attachments/assets/6036db37-ccbc-4803-8b28-470a9819252c)

---

### ✨ Key Features

-   **👤 Role-Based Access Control (RBAC):** Secure authentication distinguishes between 'Admin' and 'Member' roles, with the UI and API calls adapting to the user's permissions.
-   **📊 Interactive Dashboard:** A dynamic, at-a-glance overview of project health, including:
    -   Key Performance Indicators (KPIs) for total, to-do, in-progress, and completed tasks.
    -   An interactive Pie Chart (powered by Google Charts) visualizing task distribution by status.
    -   A Bar Chart displaying task load per team member.
-   **🗂️ Full CRUD Functionality:** Seamlessly **C**reate, **R**ead, **U**pdate, and **D**elete tasks and team members through a modal-based, single-page application interface.
-   **📎 File Attachments & Google Drive Integration:**
    -   Upload and attach files directly to tasks.
    -   Files are securely stored in a dedicated Google Drive folder, automatically created for the project.
    -   View and delete attachments directly from the task editing modal.
-   **⚡ Real-time Search & Sort:**
    -   Client-side JavaScript allows for instant searching and filtering of tasks and team members without page reloads.
    -   Sort tables by various columns like ID, Title, Assignee, Status, etc.
-   **📤 CSV Data Export:** Filter the task list and export the current view to a `.csv` file with a single click.
-   **📱 Responsive & Modern UI:** Built with Bootstrap 5, the interface is clean, professional, and fully functional on both desktop and mobile devices.
-   **🔔 Automated Email Reminders:** A time-based trigger on the backend automatically sends consolidated email summaries to users for their overdue, due-today, and upcoming tasks.
-   **🔒 Secure & Transactional Operations:**
    -   Backend functions are designed to be secure. For instance, a new team member is only added to the sheet if editor permissions can be successfully granted via `ss.addEditor()`, with an automatic rollback on failure.
    -   Members can only edit the status/priority of tasks assigned to them.

---

### 💻 Technology Stack

-   **Backend & Hosting:** Google Apps Script (`web.gs`)
-   **Database:** Google Sheets
-   **Frontend:**
    -   HTML5
    -   CSS3
    -   JavaScript (ES6+)
-   **Frameworks & Libraries:**
    -   **Bootstrap 5:** For responsive layout and modern UI components.
    -   **Google Charts:** For dynamic data visualization on the dashboard.
    -   **SweetAlert2:** For beautiful, responsive pop-up alerts and confirmations.
    -   **Bootstrap Icons:** For a clean and consistent icon set.
-   **Development Tools:**
    -   **clasp:** The official command-line tool for local Apps Script development.
    -   **Git & GitHub:** For version control and code hosting.

---

### ⚙️ How to Set Up (For Developers)

To run this project on your own Google Account, follow these steps:

1.  **Create the Google Sheet:**
    -   Create a new Google Sheet.
    -   Create three tabs named exactly: `Tasks`, `Team`, and `Attachments`.
    -   Set up the headers in the `Tasks` and `Team` sheets according to the fields used in the `web.gs` script.

2.  **Create the Apps Script Project:**
    -   Go to [script.google.com](https://script.google.com/home) and create a new project.
    -   Copy the code from `web.gs`, `Index.html`, and `appsscript.json` from this repository into the corresponding files in your new Apps Script project.

3.  **Link Script to Sheet:**
    -   In `web.gs`, replace the spreadsheet ID in the `const ss = SpreadsheetApp.openById("YOUR_SHEET_ID_HERE");` line with your own Google Sheet's ID.

4.  **Enable Advanced Google Services:**
    -   In the Apps Script Editor, click on **Services +**.
    -   Find **"Google Drive API"**, click **Add**. This is required for file upload functionality.

5.  **Deploy the Web App:**
    -   Click **Deploy > New deployment**.
    -   Select Type: **Web app**.
    -   Configure as:
        -   **Execute as:** `Me`
        -   **Who has access:** `Anyone` (for public access) or `Anyone within [Your Domain]` (for organizational use).
    -   Click **Deploy**. Grant the necessary permissions when prompted.

---

### 👨‍💻 Author

-   **Name:** Muhammad Tayyab Akbar
-   **LinkedIn:** www.linkedin.com/in/tayyabaws
-   **GitHub:** https://github.com/tayyab-cloud
