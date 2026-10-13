# TalentFlow

**TalentFlow — Intelligent HR & Recruitment Management**

*Smarter Hiring. Better Workflows.*

TalentFlow brings recruitment and core HR workflows into one application, including candidate tracking, interview scheduling, onboarding, employee records, leave, performance, and payroll modules.

## Project layout

- `frontend/` — React and Vite web application
- `backend/` — Express and TypeScript API

## Development setup

1. Install Node.js and MongoDB, then install the frontend and backend dependencies:

   ```sh
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. Copy `backend/.env.example` to `backend/.env` and set the database connection and any integrations you use. Keep `.env` files and credentials out of source control. See [backend/CONFIGURATION.md](backend/CONFIGURATION.md) for configuration details.

3. Start the API and web app in separate terminals:

   ```sh
   cd backend && npm run dev
   ```

   ```sh
   cd frontend && npm run dev
   ```

The frontend development server uses Vite's default local address. The backend defaults to port `5001`.

## Validation commands

```sh
cd frontend && npm run lint && npm run build
cd backend && npm test && npm run build
```
