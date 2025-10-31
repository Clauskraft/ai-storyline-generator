# Docker Deployment Guide

Complete guide for building and deploying the AI Storyline Generator using Docker.

## 📋 Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 1.29 or higher)
- Gemini API key from Google AI Studio

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Set your API key:**
   ```bash
   # On Linux/Mac
   export GEMINI_API_KEY=your_api_key_here

   # On Windows PowerShell
   $env:GEMINI_API_KEY="your_api_key_here"

   # On Windows CMD
   set GEMINI_API_KEY=your_api_key_here
   ```

2. **Build and run:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Open browser to: http://localhost:3001

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Option 2: Using Docker CLI

1. **Build the image:**
   ```bash
   docker build -t ai-storyline-generator .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name ai-storyline-generator \
     -p 3001:3001 \
     -e GEMINI_API_KEY=your_api_key_here \
     -e NODE_ENV=production \
     --restart unless-stopped \
     ai-storyline-generator
   ```

3. **Check status:**
   ```bash
   docker ps
   docker logs ai-storyline-generator
   ```

4. **Stop the container:**
   ```bash
   docker stop ai-storyline-generator
   docker rm ai-storyline-generator
   ```

## 🏗️ Docker Image Details

### Multi-Stage Build

The Dockerfile uses a multi-stage build process:

1. **Stage 1 (frontend-builder):**
   - Installs all dependencies (including devDependencies)
   - Builds the React/Vite frontend
   - Output: `/app/dist` directory with static files

2. **Stage 2 (production):**
   - Uses production dependencies only
   - Copies built frontend from stage 1
   - Copies backend server and services
   - Runs as non-root user for security
   - Final image size: ~200-300 MB

### Security Features

- ✅ Non-root user (nodejs:nodejs with UID 1001)
- ✅ Multi-stage build (smaller attack surface)
- ✅ Health checks enabled
- ✅ API key kept in environment variables (not in image)
- ✅ Production-only dependencies

### Image Optimization

The image is optimized for size and security:
- Base image: `node:20-alpine` (minimal Alpine Linux)
- Only production dependencies included
- Dev dependencies excluded from final image
- Unnecessary files excluded via `.dockerignore`

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | **Yes** | - | Your Google Gemini API key |
| `NODE_ENV` | No | `development` | Set to `production` in Docker |
| `PORT` | No | `3001` | Port for the server |
| `FRONTEND_URL` | No | - | Not needed in production (static files served) |

### Custom Port

To run on a different port:

```bash
# Docker Compose: Edit docker-compose.yml
ports:
  - "8080:3001"  # External:Internal

# Docker CLI:
docker run -p 8080:3001 -e PORT=3001 ...
```

### Resource Limits

Adjust CPU and memory limits in `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'      # Max 2 CPU cores
      memory: 2G     # Max 2GB RAM
    reservations:
      cpus: '1'      # Min 1 CPU core
      memory: 1G     # Min 1GB RAM
```

## 🩺 Health Checks

The container includes automatic health checks:

- **Endpoint:** `GET /api/health`
- **Interval:** Every 30 seconds
- **Timeout:** 3 seconds
- **Retries:** 3 attempts before marking unhealthy
- **Start period:** 40 seconds (grace period for startup)

Check health status:
```bash
docker ps  # See "healthy" status
docker inspect ai-storyline-generator | grep Health
```

## 📊 Monitoring

### View Logs

```bash
# Docker Compose
docker-compose logs -f

# Docker CLI
docker logs -f ai-storyline-generator

# Last 100 lines
docker logs --tail 100 ai-storyline-generator
```

### Container Stats

```bash
# Real-time stats
docker stats ai-storyline-generator

# Docker Compose
docker-compose stats
```

## 🔄 Updates and Rebuilds

### Update Application

1. Pull latest code:
   ```bash
   git pull
   ```

2. Rebuild and restart:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Clear Everything and Rebuild

```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove old images
docker image prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## 🐛 Troubleshooting

### Container Won't Start

1. Check logs:
   ```bash
   docker-compose logs
   ```

2. Verify API key is set:
   ```bash
   docker-compose exec ai-storyline-generator env | grep GEMINI
   ```

3. Check port availability:
   ```bash
   # Linux/Mac
   lsof -i :3001

   # Windows
   netstat -ano | findstr :3001
   ```

### Application Errors

1. Check server logs:
   ```bash
   docker-compose logs -f ai-storyline-generator
   ```

2. Verify health status:
   ```bash
   docker ps
   ```

3. Test API endpoint directly:
   ```bash
   curl http://localhost:3001/api/health
   ```

### Cannot Access Frontend

1. Verify NODE_ENV is set to `production`
2. Check that frontend was built:
   ```bash
   docker-compose exec ai-storyline-generator ls -la /app/dist
   ```

3. Restart container:
   ```bash
   docker-compose restart
   ```

## 🌐 Production Deployment

### Recommended Setup

1. **Use environment variables for secrets:**
   ```bash
   # Never commit API keys to git!
   # Use environment variables or secrets management
   ```

2. **Enable HTTPS (Use reverse proxy):**
   ```bash
   # Example with Nginx
   server {
     listen 443 ssl;
     server_name your-domain.com;

     location / {
       proxy_pass http://localhost:3001;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

3. **Set up monitoring:**
   - Use Docker health checks
   - Monitor logs with ELK stack or similar
   - Set up alerts for container restarts

4. **Backup strategy:**
   - No persistent data stored in container
   - All generated content is ephemeral
   - Ensure API key is backed up securely

### Cloud Deployment Examples

#### AWS ECS
```bash
# Build and push to ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin account.dkr.ecr.region.amazonaws.com
docker build -t ai-storyline-generator .
docker tag ai-storyline-generator:latest account.dkr.ecr.region.amazonaws.com/ai-storyline-generator:latest
docker push account.dkr.ecr.region.amazonaws.com/ai-storyline-generator:latest
```

#### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/project-id/ai-storyline-generator
gcloud run deploy ai-storyline-generator \
  --image gcr.io/project-id/ai-storyline-generator \
  --platform managed \
  --set-env-vars GEMINI_API_KEY=your_key,NODE_ENV=production
```

#### Azure Container Instances
```bash
# Build and push to ACR
az acr build --registry myregistry --image ai-storyline-generator .
az container create \
  --resource-group mygroup \
  --name ai-storyline-generator \
  --image myregistry.azurecr.io/ai-storyline-generator:latest \
  --environment-variables GEMINI_API_KEY=your_key NODE_ENV=production
```

## 📝 Build Information

- **Base Image:** node:20-alpine
- **Build Time:** ~3-5 minutes (first build)
- **Image Size:** ~200-300 MB (compressed)
- **Architecture:** amd64 (x86_64)

To build for different architectures:
```bash
# Build for ARM64 (e.g., Apple Silicon)
docker buildx build --platform linux/arm64 -t ai-storyline-generator .

# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t ai-storyline-generator .
```

## 🎯 Next Steps

1. ✅ Build and run the Docker container
2. ✅ Test the application at http://localhost:3001
3. ✅ Configure reverse proxy for HTTPS
4. ✅ Set up monitoring and logging
5. ✅ Deploy to production environment
