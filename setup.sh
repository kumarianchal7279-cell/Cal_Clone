#!/bin/bash
# Quick setup script for Cal.com Clone

echo "Cal.com Clone - Setup Script"
echo "============================"

# Backend setup
echo ""
echo "Setting up Backend..."
cd backend

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env file in backend"
  echo "Please edit .env with your PostgreSQL credentials"
fi

echo "Installing backend dependencies..."
npm install

echo "Waiting for PostgreSQL..."
sleep 2

echo "Setting up database schema..."
npm run db:setup

echo "Seeding sample data..."
npm run db:seed

# Frontend setup
echo ""
echo "Setting up Frontend..."
cd ../frontend

if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo "Created .env.local file in frontend"
fi

echo "Installing frontend dependencies..."
npm install

echo ""
echo "Setup complete! 🎉"
echo ""
echo "To start the application:"
echo "1. Terminal 1 (Backend): cd backend && npm run dev"
echo "2. Terminal 2 (Frontend): cd frontend && npm run dev"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
