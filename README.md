# Finance Frontend

React + Tailwind frontend for the Finance Data Processing and Access Control Backend.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router v6
- Axios
- Recharts (charts)
- React Hot Toast (notifications)
- Lucide React (icons)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## Environment Variables

The `.env` file points to your backend:

```
VITE_API_URL=http://localhost:5000/api
```

Change this to your deployed backend URL when deploying the frontend.

## Pages

- `/login` — Sign in
- `/register` — Create a viewer account
- `/` — Dashboard with charts and analytics (analyst + admin)
- `/records` — Financial records table with filters and pagination (all roles)
- `/users` — User management (admin only)
- `/profile` — Your account info and permissions

## Deployment

```bash
# Build for production
npm run build

# The dist/ folder is ready to deploy to Vercel, Netlify, or any static host
```

When deploying, set the `VITE_API_URL` environment variable in your hosting platform to point to your deployed backend URL.

Make sure your backend has CORS configured to allow requests from your frontend domain.
