# Motia Backend Deployment Guide

## Option 1: Deploy via WSL (Recommended for Windows)

Since you have WSL installed, this is the fastest way to deploy.

1. **Open your WSL Terminal** (Ubuntu/Debian)

2. **Navigate to the project**
   ```bash
   cd /mnt/e/saas-starter/motia-backend
   ```

3. **Install Motia CLI**
   ```bash
   # You might need sudo depending on your node setup
   npm install -g motia@latest
   ```

4. **Deploy**
   Run this exact command (it uses the .env file we already created):
   ```bash
   motia cloud deploy \
     --api-key motia-MDc5NTM4NWItYjUxYy00MDAwLWEzNGIt \
     --project-name pte-lms-backend \
     --environment-name production \
     --env-file .env \
     --version-name v1.0.0 \
     --version-description "Initial deployment via WSL"
   ```

---

## Option 2: GitHub Actions CI/CD (Automated)

We've also set up automated deployment via GitHub Actions.

1. **Add GitHub Secrets**
   Go to your repository settings → Secrets and variables → Actions:
   - `MOTIA_API_KEY`: `motia-MDc5NTM4NWItYjUxYy00MDAwLWEzNGIt`
   - `DATABASE_URL`: `postgresql://postgres:FIomnuqssqiTlJvGIePMPZZBjZzNbZKS@trolley.proxy.rlwy.net:27731/railway`
   - `GOOGLE_API_KEY`: `AIzaSyB_5n6O8e8PpU7vXyZ1234567890abcdef`

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Motia backend with CI/CD"
   git push origin main
   ```

3. **Monitor Deployment**
   Check the "Actions" tab in your GitHub repository.

---

## After Deployment

Once deployed, you'll get a URL from Motia Cloud (e.g., `https://pte-lms-backend.motia.cloud`).

**Update your main app:**
1. Open `e:\saas-starter\.env`
2. Add/Update:
   ```
   NEXT_PUBLIC_MOTIA_BACKEND_URL=https://your-deployed-url.motia.cloud
   ```
