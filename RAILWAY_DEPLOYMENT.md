# Railway.app Deployment Guide

Complete guide for deploying the AI Storyline Generator to Railway.app - one of the easiest deployment platforms.

## 🚂 Why Railway?

- ✅ **One-Click Deploy** - Deploy directly from GitHub
- ✅ **Automatic HTTPS** - SSL certificates included
- ✅ **Generous Free Tier** - $5 free credit monthly
- ✅ **Automatic Deploys** - Push to GitHub = auto deploy
- ✅ **Built-in Monitoring** - Logs, metrics, health checks
- ✅ **No Credit Card** - Required for free tier (but no charges)

## 📋 Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Railway Account** - Sign up at https://railway.app (free)
3. **Gemini API Key** - From Google AI Studio

## 🚀 Deployment Methods

### Method 1: Deploy from GitHub (Recommended)

This is the easiest method - Railway will auto-deploy on every git push.

#### Step 1: Push Your Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with Railway deployment config"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/ai-storyline-generator.git

# Push to GitHub
git push -u origin main
```

#### Step 2: Deploy on Railway

1. **Go to Railway.app:**
   - Visit https://railway.app
   - Click "Login" and sign in with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `ai-storyline-generator` repository

3. **Railway Auto-Detects Dockerfile:**
   - Railway will automatically detect the `Dockerfile`
   - It will use the `railway.json` configuration
   - Click "Deploy Now"

#### Step 3: Configure Environment Variables

1. **Add API Key:**
   - In your Railway project, click on the service
   - Go to "Variables" tab
   - Click "New Variable"
   - Add:
     ```
     GEMINI_API_KEY = your_actual_api_key_here
     ```

2. **Add Production Settings:**
   ```
   NODE_ENV = production
   PORT = 3001
   ```

3. **Save** - Railway will automatically redeploy

#### Step 4: Access Your App

1. **Get URL:**
   - Go to "Settings" tab
   - Under "Networking", click "Generate Domain"
   - Railway provides: `your-app.up.railway.app`

2. **Access Application:**
   - Open: `https://your-app.up.railway.app`
   - Your app is now live! 🎉

### Method 2: Deploy with Railway CLI

For more control and local deployment testing.

#### Install Railway CLI

```bash
# macOS (Homebrew)
brew install railway

# npm (cross-platform)
npm install -g @railway/cli

# Windows (Scoop)
scoop install railway
```

#### Deploy Steps

```bash
# 1. Login to Railway
railway login

# 2. Initialize project (in your app directory)
cd ai-storyline-generator
railway init

# 3. Link to a new project
railway link

# 4. Add environment variables
railway variables set GEMINI_API_KEY=your_api_key_here
railway variables set NODE_ENV=production
railway variables set PORT=3001

# 5. Deploy
railway up

# 6. Open your app
railway open
```

### Method 3: Deploy Button (One-Click)

Create a deploy button for your README:

```markdown
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/ai-storyline-generator)
```

## ⚙️ Configuration Files

### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Explanation:**
- `builder: DOCKERFILE` - Use Docker for deployment
- `numReplicas: 1` - Run one instance
- `sleepApplication: false` - Keep app always running
- `restartPolicyType` - Auto-restart on failure

### railway.toml (Alternative)

Railway also supports TOML format:

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
numReplicas = 1
sleepApplication = false
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

## 🔐 Environment Variables

Set these in Railway Dashboard or CLI:

| Variable | Required | Value | Description |
|----------|----------|-------|-------------|
| `GEMINI_API_KEY` | **Yes** | Your API key | From Google AI Studio |
| `NODE_ENV` | Yes | `production` | Enables production mode |
| `PORT` | No | `3001` | Railway auto-sets if omitted |

### Setting Variables in Dashboard

1. Click on your service
2. Go to "Variables" tab
3. Click "New Variable"
4. Enter name and value
5. Click "Add" - auto-deploys

### Setting Variables via CLI

```bash
railway variables set GEMINI_API_KEY=your_key
railway variables set NODE_ENV=production
```

## 🌐 Custom Domain

Railway allows custom domains:

1. **Get a domain** from any registrar (Namecheap, GoDaddy, etc.)

2. **Add domain in Railway:**
   - Go to "Settings" → "Networking"
   - Click "Custom Domain"
   - Enter: `yourdomain.com`

3. **Configure DNS:**
   - Add CNAME record:
     ```
     Type: CNAME
     Name: @ (or www)
     Value: your-app.up.railway.app
     ```

4. **SSL Certificate:**
   - Railway automatically provisions SSL
   - HTTPS works immediately

## 📊 Monitoring & Logs

### View Logs

**Dashboard:**
- Click on your service
- Go to "Deployments" tab
- Click on latest deployment
- View real-time logs

**CLI:**
```bash
# Stream logs
railway logs

# Last 100 lines
railway logs --tail 100
```

### Metrics

Railway provides built-in metrics:
- **CPU Usage**
- **Memory Usage**
- **Request Count**
- **Response Times**

Access: Service → "Metrics" tab

### Health Checks

Railway monitors your app health:
- Uses Docker `HEALTHCHECK` from Dockerfile
- Automatically restarts unhealthy containers
- Shows status in dashboard

## 🔄 Automatic Deployments

Railway auto-deploys on every git push:

```bash
# Make changes
git add .
git commit -m "Update feature"

# Push to GitHub
git push origin main

# Railway automatically:
# 1. Detects the push
# 2. Builds new Docker image
# 3. Deploys new version
# 4. Zero-downtime rollout
```

### Deploy Notifications

Get notified on Discord/Slack:
1. Go to "Settings" → "Integrations"
2. Connect Discord or Slack
3. Receive deploy status updates

## 🐛 Troubleshooting

### Build Fails

**Check build logs:**
```bash
railway logs --deployment
```

**Common issues:**
- Missing dependencies in package.json
- Docker build errors
- Out of memory (increase plan)

### App Won't Start

**Verify environment variables:**
```bash
railway variables
```

**Check if GEMINI_API_KEY is set:**
- Must be valid Google AI Studio key
- No extra spaces or quotes

### 502 Bad Gateway

**Causes:**
1. App crashed - check logs
2. Port mismatch - Railway expects app on PORT env var
3. Health check failing - check /api/health endpoint

**Fix:**
```bash
# View recent logs
railway logs --tail 200

# Restart service
railway restart
```

### High Memory Usage

**Monitor usage:**
- Dashboard → Service → "Metrics"

**Solutions:**
1. Upgrade Railway plan
2. Optimize Docker image
3. Add resource limits in Dockerfile

## 💰 Pricing

### Free Tier ($5 credit/month)
- **Included:**
  - Up to 500 hours/month
  - 8 GB RAM
  - 8 vCPU
  - 100 GB bandwidth

- **Usage for this app:**
  - ~1-2 GB RAM per instance
  - Should fit within free tier for low-moderate traffic

### Hobby Plan ($5/month)
- Everything in Free tier
- More resources
- Priority support

### Pro Plan ($20/month)
- Team collaboration
- Increased limits
- Dedicated support

### Cost Estimation

For this app with moderate usage:
- **Free tier:** $0/month (within limits)
- **Hobby:** $5/month (if exceeded)
- **Pro:** $20/month (high traffic)

## 🚀 Advanced Configuration

### Multiple Environments

Deploy to staging and production:

```bash
# Create staging environment
railway environment create staging

# Switch to staging
railway environment staging

# Deploy to staging
railway up

# Switch back to production
railway environment production
```

### Scaling

Railway supports horizontal scaling:

1. **Dashboard:**
   - Service → "Settings"
   - Under "Scaling", increase replicas

2. **CLI:**
   ```bash
   railway service scale --replicas 3
   ```

### Database (if needed later)

Railway offers managed databases:
- PostgreSQL
- MySQL
- MongoDB
- Redis

Add via dashboard: "New" → "Database"

## 📝 Post-Deployment Checklist

After successful deployment:

- [ ] ✅ App accessible at Railway URL
- [ ] ✅ Test generating presentation
- [ ] ✅ Try McKinsey model
- [ ] ✅ Test image generation
- [ ] ✅ Verify all features work
- [ ] ✅ Check logs for errors
- [ ] ✅ Set up custom domain (optional)
- [ ] ✅ Configure deploy notifications
- [ ] ✅ Add Railway badge to README
- [ ] ✅ Share your deployed app! 🎉

## 🎯 Quick Reference

```bash
# Login
railway login

# Deploy
railway up

# Logs
railway logs

# Variables
railway variables set KEY=value

# Open app
railway open

# Restart
railway restart

# Status
railway status
```

## 📚 Resources

- **Railway Docs:** https://docs.railway.app
- **Railway CLI:** https://docs.railway.app/develop/cli
- **Railway Discord:** https://discord.gg/railway
- **Support:** https://help.railway.app

## 🎉 Summary

Railway deployment is complete! Your app should now be:

✅ **Live** at `https://your-app.up.railway.app`
✅ **Secure** with automatic HTTPS
✅ **Monitored** with built-in health checks
✅ **Auto-deploying** on every git push
✅ **Production-ready** with the McKinsey presentation model

Enjoy your deployed AI Storyline Generator! 🚂🎨
