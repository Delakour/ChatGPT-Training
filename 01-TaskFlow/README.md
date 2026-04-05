# TaskFlow

TaskFlow is a full-stack task management app where users can organize their personal or work tasks in one place.

When you open the app, you see a table of all your tasks fetched from the database. From there you can:

- **Add a task** — click the "Add Task" button to open a modal form. Fill in a title (required), an optional description, a priority level (Low / Medium / High), a category label (e.g. "work", "personal"), and a due date (must be today or later). The form submits to the Express API which validates the data and saves it to MongoDB.
- **Edit a task** — click the edit icon on any row to reopen the form pre-filled with that task's data. Saving sends a PUT request and the list refreshes.
- **Delete a task** — click the delete icon, confirm the prompt, and the task is removed from the database.
- **Toggle completion** — click the toggle icon to flip a task between Pending and Completed without opening the form.
- **Filter & search** — use the status filter tabs (All / Pending / Completed / Overdue) and the search bar to narrow down the list. Overdue tasks are those whose due date has passed and are still incomplete.
- **Switch language** — a toggle in the header switches the entire UI between English and Hebrew. Hebrew activates RTL layout automatically.
- **Switch theme** — a toggle switches between light and dark mode. The preference is saved in localStorage and persists across sessions.

The React frontend communicates with the Express backend over a REST API. The backend validates all incoming data in both the controller layer and via Mongoose schema rules before writing to MongoDB Atlas.

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 19, Context API, Fetch API  |
| Backend  | Node.js, Express 5, Mongoose 8    |
| Database | MongoDB Atlas                     |

---

## Features

- Create, read, update, and delete tasks
- Task fields: title, description, priority (LOW / MEDIUM / HIGH), category, due date, status
- Filter tasks by status: All / Pending / Completed / Overdue
- Search tasks by keyword
- Toggle task completion
- Light / Dark theme (persisted in localStorage)
- English / Hebrew language toggle with RTL layout support

---

## Project Structure

```txt
01-TaskFlow/
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── components/      # TaskManager, TaskList, TaskForm, ThemeToggle, LanguageToggle
│       ├── context/         # ThemeContext, LanguageContext
│       ├── services/        # taskService.js (API calls)
│       └── vocabulary.json  # i18n strings (English + Hebrew)
└── server/                  # Express backend
    ├── src/
    │   ├── controllers/     # Task.js
    │   ├── models/          # Task.js (Mongoose schema)
    │   └── routes/          # Task.js
    └── app.js
```

---

## API Endpoints

| Method | Endpoint         | Description        |
|--------|------------------|--------------------|
| GET    | /tasks/all       | Get all tasks      |
| GET    | /tasks/:id       | Get task by ID     |
| POST   | /tasks/create    | Create a new task  |
| PUT    | /tasks/:id       | Update a task      |
| DELETE | /tasks/:id       | Delete a task      |

---

## Task Schema

| Field       | Type    | Required | Default   | Notes                          |
|-------------|---------|----------|-----------|--------------------------------|
| title       | String  | ✅       | —         | Max 200 chars                  |
| description | String  | ❌       | —         | Max 1000 chars                 |
| priority    | String  | ❌       | `MEDIUM`  | `HIGH`, `MEDIUM`, or `LOW`     |
| category    | String  | ❌       | `general` | Max 50 chars                   |
| dueDate     | Date    | ✅       | —         | Cannot be in the past          |
| completed   | Boolean | ✅       | `false`   |                                |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- A MongoDB Atlas cluster (or local MongoDB instance)

### 1. Clone the repo

```bash
git clone <repo-url>
cd 01-TaskFlow
```

### 2. Configure environment variables

**`server/.env`**

```env
HOST=localhost
PORT=5000
CLIENT_PORT=3000
DB_CONNECTION_STRING=<your-mongodb-connection-string>
```

**`client/.env`**

```env
REACT_APP_SERVER_URL=http://localhost:5000
```

### 3. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

### 4. Run the app

```bash
# Start the server (from /server)
npm run dev       # development (nodemon)
npm start         # production

# Start the client (from /client)
npm start
```

The client runs on `http://localhost:3000` and the server on `http://localhost:5000`.

### 5. Production build

```bash
cd client
npm run build
```

The server is configured to serve the React build statically, so after building you can run only the server and access the full app on `http://localhost:5000`.
