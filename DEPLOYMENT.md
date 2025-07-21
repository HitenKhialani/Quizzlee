# Quizzlee Deployment Guide - Render

## Prerequisites
- A Render account (free tier available)
- Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Prepare Your Repository
Make sure your code is pushed to a Git repository (GitHub, GitLab, etc.)

### 2. Deploy to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" and select "Web Service"**
3. **Connect your Git repository**
4. **Configure the service:**
   - **Name**: `quizzlee-app` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run server`
   - **Health Check Path**: `/api/health`

### 3. Environment Variables
Add these environment variables in Render dashboard:
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will set this automatically)

### 4. Deploy
Click "Create Web Service" and wait for deployment to complete.

## Important Notes

### Database Considerations
- Your app uses SQLite with a local file (`quizzle.db`)
- **Important**: SQLite files are ephemeral on Render - data will be lost when the service restarts
- For production use, consider migrating to PostgreSQL or MongoDB

### File Structure
Your app is configured to:
- Build the React frontend to `dist/` folder
- Serve static files from `dist/` in production
- Handle API routes at `/api/*`
- Serve the React app for all other routes

### Health Check
The app includes a health check endpoint at `/api/health` for Render's monitoring.

## Troubleshooting

### Common Issues:
1. **Build fails**: 
   - Check that all dependencies are in `package.json`
   - Ensure build tools (vite, typescript, etc.) are in `dependencies`, not `devDependencies`
2. **Start command fails**: Ensure `npm run server` works locally
3. **Database errors**: SQLite file may not persist between deployments
4. **Node.js version**: Using Node.js 20 (LTS) to avoid end-of-life warnings

### Logs
Check Render logs in the dashboard for any errors during build or runtime.

## Next Steps
After successful deployment:
1. Test your app functionality
2. Consider migrating to a persistent database
3. Set up custom domain if needed
4. Configure SSL certificates (automatic on Render) 