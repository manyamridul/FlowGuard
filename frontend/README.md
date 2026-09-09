# Flow Guard Frontend

Flow Guard is a modern React-based frontend for an intelligent project workflow and bug management platform. It provides a polished dashboard experience for task tracking, project oversight, workflow visualization, and team activity monitoring.

## Overview

This interface is designed to support:

- Project and task management
- Bug tracking and issue visibility
- Workflow orchestration
- Activity monitoring and reporting
- Live connection to the FlowGuard Django API (`http://127.0.0.1:8000/api`)

## Authors

- Manya Mridul

## Technology Stack

- React.js
- React Router DOM
- Tailwind CSS
- Axios
- React Icons
- Create React App

## Prerequisites

Ensure the following tools are installed on your machine:

- Node.js 18+
- npm 9+
- Docker (optional, for containerized runs)

## Installation

From the project root, run:

```bash
cd frontend
npm install
```

## Running the Application Locally

Start the development server:

```bash
npm start
```

The application will be available at:

- http://localhost:3000

## Running with Docker

Build and run the container:

```bash
docker build -t flowguard-frontend .
docker run -p 3000:3000 flowguard-frontend
```

Then open:

- http://localhost:3000

## Application Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to the dashboard |
| `/login` | Authentication screen |
| `/dashboard` | Main analytics dashboard |
| `/projects` | Project overview |
| `/workflow` | Workflow visualization |
| `/tasks` | Task management |
| `/bugs` | Bug tracking |
| `/users` | User management |
| `/knowledge-base` | Knowledge base |
| `/reports` | Reports and insights |
| `/activity-logs` | Activity history |
| `/ai-sprint-assistant` | AI sprint assistance |
| `/settings` | Application settings |
| `/profile` | User profile |

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   └── index.js
├── Dockerfile
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Development Notes

- Open the UI at http://localhost:3000. The backend API is http://127.0.0.1:8001/api.
- Authentication, dashboard, projects, workflows, tasks, and related modules use `src/services/api.js`. Do not replace that file with a static mock client.
- Sign in with email and password.

## UI updates by Rupa Kumari

- Dark theme aligned across sidebar, navbar, dashboard, cards, tables, and login.
- Login page restyled to match the app; Sign in and Create account (existing `/api/auth/register/` then login).
- Workflow Add Card: project dropdown instead of a hardcoded project id.
- Create Project / Create Task: typing no longer loses input focus after one character.
- Modal close button: removed extra `>` next to the X.
- New FlowGuard logo on navbar, sidebar header, and login.
- Backend endpoints and dashboard data loading were not rewritten.

See the root `README.md` for run steps, known bug-access note, and CRUD check results.

## Contribution Guidelines

For development work:

1. Create a feature branch.
2. Implement changes with clear commits.
3. Test the UI locally before submitting changes.
4. Keep the documentation updated as the project evolves.


AI SPRINT ASSISTANT REQUIREMENT
--------------------------------

FlowGuard uses Ollama for local AI functionality.

1. Install Ollama.
2. Start the Ollama service.
3. Download the model configured in the FlowGuard backend.
4. Start the Django backend.
5. Start the React frontend.

The AI Sprint Assistant will communicate with Ollama locally.
