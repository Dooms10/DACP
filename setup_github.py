#!/usr/bin/env python3
"""
Setup GitHub repository for DACP Modern UI
Replace YOUR_USERNAME with your actual GitHub username
"""

import subprocess
import sys

def run_command(cmd):
    """Run a command and return the result"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    print("🚀 DACP Modern UI GitHub Setup")
    print("=" * 40)
    
    # Get GitHub username from user
    github_username = input("Enter your GitHub username: ").strip()
    
    if not github_username:
        print("❌ GitHub username is required!")
        sys.exit(1)
    
    repo_url = f"https://github.com/{github_username}/dacp-modern-ui.git"
    
    print(f"\n📋 Repository URL: {repo_url}")
    print("⚠️  Make sure you've created this repository on GitHub first!")
    
    confirm = input("\nContinue? (y/n): ").strip().lower()
    
    if confirm != 'y':
        print("❌ Setup cancelled.")
        sys.exit(0)
    
    # Add remote
    print("\n🔗 Adding GitHub remote...")
    success, stdout, stderr = run_command(f"git remote add origin {repo_url}")
    
    if success:
        print("✅ Remote added successfully!")
    else:
        print(f"❌ Failed to add remote: {stderr}")
        sys.exit(1)
    
    # Push to GitHub
    print("\n📤 Pushing to GitHub...")
    success, stdout, stderr = run_command("git branch -M main")
    
    if success:
        print("✅ Branch renamed to main")
    else:
        print(f"⚠️  Branch rename warning: {stderr}")
    
    success, stdout, stderr = run_command("git push -u origin main")
    
    if success:
        print("✅ Successfully pushed to GitHub!")
        print("\n🎯 Next Steps:")
        print("1. Go to your Render dashboard")
        print("2. Connect your DACP service to this GitHub repository")
        print("3. Render will automatically deploy the modern UI")
        print("4. Visit https://dacp-app.onrender.com to see the changes!")
    else:
        print(f"❌ Push failed: {stderr}")
        print("\n💡 You may need to:")
        print("- Create the repository on GitHub first")
        print("- Use a Personal Access Token if you have 2FA")
        print("- Check your GitHub credentials")

if __name__ == "__main__":
    main()
