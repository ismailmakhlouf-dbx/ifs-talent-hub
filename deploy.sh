#!/bin/bash
# ============================================================================
# Thomas Unified Talent Hub - Automated Production Deployment Script
# This script ensures frontend is rebuilt and synced properly
# ============================================================================

set -e  # Exit on any error

echo "=============================================="
echo "🚀 Thomas Unified Talent Hub - Production Deployment"
echo "=============================================="

# 1. Clean old frontend build artifacts
echo ""
echo "📦 Step 1: Cleaning old frontend build..."
rm -rf frontend/dist
rm -rf frontend/node_modules/.cache

# 2. Install dependencies and build frontend
echo ""
echo "📦 Step 2: Building frontend..."
cd frontend
npm install --silent
npm run build
cd ..

# 3. Verify new build
echo ""
echo "✅ Step 3: Verifying build..."
if [ -f "frontend/dist/index.html" ]; then
    echo "   Frontend build successful!"
    ls -la frontend/dist/assets/
else
    echo "❌ Frontend build failed!"
    exit 1
fi

# 4. Clean Python cache
echo ""
echo "🧹 Step 4: Cleaning Python cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

# 5. Git commit (optional)
echo ""
echo "📝 Step 5: Committing changes..."
git add -A
git commit -m "Automated production build - $(date '+%Y%m%d-%H%M%S')" || echo "No changes to commit"
git push origin main || echo "Push failed - continuing anyway"

# 6. Deploy to Databricks
echo ""
echo "🚀 Step 6: Deploying to Databricks Apps..."
databricks apps deploy thomas-talent-hub

echo ""
echo "=============================================="
echo "✅ Deployment Complete!"
echo "=============================================="
echo ""
echo "Check logs at: https://fevm-ismailmakhlouf-demo-ws.cloud.databricks.com/apps/thomas-talent-hub"
