# Troubleshooting Deployment Issues

## Current Issue: 502 Bad Gateway / 404 Errors

### Symptoms:
- 502 Bad Gateway errors for API calls
- 404 errors for `/api/auth/login` and `/api/auth/create-profile`
- Server not responding to authentication requests

### Possible Causes:

#### 1. Server Not Starting
- Check Render logs for server startup errors
- Look for database initialization failures
- Verify Node.js version compatibility

#### 2. Database Issues
- SQLite file permissions in production
- Database file not being created
- Better-sqlite3 compatibility issues

#### 3. Port/Environment Issues
- PORT environment variable not set correctly
- NODE_ENV not set to 'production'
- CORS configuration issues

### Debugging Steps:

#### Step 1: Check Render Logs
1. Go to your Render service dashboard
2. Click on "Logs" tab
3. Look for error messages during startup
4. Check if server is actually running

#### Step 2: Test Health Endpoint
Try accessing: `https://your-app-name.onrender.com/api/health`
- Should return server status
- If this fails, server isn't running

#### Step 3: Test Simple Endpoint
Try accessing: `https://your-app-name.onrender.com/api/test`
- Should return "Server is running!"
- If this fails, basic routing isn't working

#### Step 4: Check Environment Variables
In Render dashboard, verify:
- `NODE_ENV` = `production`
- `PORT` is set (Render usually sets this automatically)

### Quick Fixes to Try:

#### Fix 1: Manual Deploy
1. Go to Render dashboard
2. Click "Manual Deploy"
3. This sometimes resolves startup issues

#### Fix 2: Check Start Command
Ensure start command is: `npm run server`

#### Fix 3: Database Alternative
If SQLite issues persist, consider:
- Using in-memory database for testing
- Switching to PostgreSQL (Render supports this)

### Next Steps:
1. Check Render logs first
2. Test the health endpoint
3. If server isn't starting, check the logs for specific errors
4. Redeploy if needed

### Common Render Issues:
- **Cold starts**: First request might be slow
- **Memory limits**: Free tier has memory constraints
- **File system**: SQLite files are ephemeral
- **Port binding**: Ensure server listens on correct port 