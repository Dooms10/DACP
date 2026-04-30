@echo off
echo Pushing DACP Modern UI to GitHub...
echo.

REM Replace YOUR_USERNAME with your actual GitHub username
set GITHUB_USERNAME=YOUR_USERNAME
set REPO_URL=https://github.com/%GITHUB_USERNAME%/dacp-modern-ui.git

echo Adding GitHub remote...
git remote add origin %REPO_URL%

echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Push complete! Now connect this repository to your Render service.
echo 🚀 Visit https://dacp-app.onrender.com to see the modern UI!
pause
