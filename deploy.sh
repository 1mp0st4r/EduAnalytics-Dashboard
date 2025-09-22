#!/bin/bash

# EduAnalytics Dashboard - Quick Deployment Script
echo "🚀 Starting EduAnalytics Dashboard Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_success "Found project files"

# Step 2: Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local not found. Please create it with your environment variables."
    exit 1
fi

print_success "Found environment configuration"

# Step 3: Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=postgresql://" .env.local; then
    print_error "DATABASE_URL not found in .env.local. Please add your Neon connection string."
    exit 1
fi

print_success "Database configuration found"

# Step 4: Test local build
print_status "Testing local build..."
if npm run build; then
    print_success "Local build successful"
else
    print_error "Local build failed. Please fix errors before deploying."
    exit 1
fi

# Step 5: Check git status
print_status "Checking git status..."
if git status --porcelain | grep -q .; then
    print_warning "You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "🚀 Pre-deployment commit - $(date)"
fi

# Step 6: Push to GitHub
print_status "Pushing to GitHub..."
if git push origin main; then
    print_success "Code pushed to GitHub successfully"
else
    print_error "Failed to push to GitHub. Please check your git configuration."
    exit 1
fi

# Step 7: Display deployment instructions
echo ""
echo "🎉 Code is ready for Vercel deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Sign in with your GitHub account"
echo "3. Click 'New Project'"
echo "4. Import repository: 1mp0st4r/EduAnalytics-Dashboard"
echo "5. Add environment variables (see VERCEL_DEPLOYMENT.md)"
echo "6. Click 'Deploy'"
echo ""
echo "🔗 Your app will be available at: https://eduanalytics-dashboard.vercel.app"
echo ""
echo "📚 For detailed instructions, see: VERCEL_DEPLOYMENT.md"
echo ""

print_success "Deployment preparation complete! 🚀"
