@echo off
REM Quick setup script for Cal.com Clone (Windows)

echo Cal.com Clone - Setup Script
echo ============================

REM Backend setup
echo.
echo Setting up Backend...
cd backend

if not exist .env (
  copy .env.example .env
  echo Created .env file in backend
  echo Please edit .env with your PostgreSQL credentials
)

echo Installing backend dependencies...
call npm install

echo Waiting for PostgreSQL...
timeout /t 2

echo Setting up database schema...
call npm run db:setup

echo Seeding sample data...
call npm run db:seed

REM Frontend setup
echo.
echo Setting up Frontend...
cd ..\frontend

if not exist .env.local (
  copy .env.local.example .env.local
  echo Created .env.local file in frontend
)

echo Installing frontend dependencies...
call npm install

echo.
echo Setup complete! 
echo.
echo To start the application:
echo 1. Terminal 1 ^(Backend^): cd backend ^&& npm run dev
echo 2. Terminal 2 ^(Frontend^): cd frontend ^&& npm run dev
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
