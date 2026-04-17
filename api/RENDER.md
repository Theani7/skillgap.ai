# Render Deployment Guide

## Quick Deploy

1. **Push code to GitHub**

2. **Create Render Account** - render.com

3. **Create New Web Service**
   - Connect your GitHub repo
   - Root directory: `api`
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn api.main:app --workers 2 --bind 0.0.0.0:$PORT`

4. **Environment Variables** (in Render dashboard)
   ```
   JWT_SECRET_KEY=<generate-random-64-chars>
   GEMINI_API_KEY=<your-google-api-key>
   THEIRSTACK_API_KEY=<your-api-key>
   MARKET_DATA_PROVIDER=theirstack
   ```

5. **Deploy**

## Important Notes

### Database
- Uses SQLite (`cv.db`) in repository
- Data persists on Render's free tier

### CORS
- Update CORS origins for production:
```python
allow_origins=["https://your-frontend.vercel.app"]
```

### First Deploy
- Initial build takes 2-3 minutes
- After deploy, visit `https://your-service.onrender.com`
- Health check: `/api/health`

### Debug
- Check Render logs for errors
- Free tier: service sleeps after 15 min idle
- First request after sleep may be slow