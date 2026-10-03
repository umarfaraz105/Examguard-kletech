# Login Instructions for ExamGuard

## ✅ Both Servers Are Running

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000

## 🔑 Correct Login Credentials

**IMPORTANT**: Use these exact credentials (updated from previous docs):

```
Email: admin@examguard.edu
Password: admin123
```

## 📝 Steps to Login

1. **Open your browser** and go to: http://localhost:3000

2. The page will **redirect to /login** automatically (if not logged in)

3. **Enter credentials**:
   - Email: `admin@examguard.edu`
   - Password: `admin123`

4. **Click "Sign In"**

5. You should be redirected to the dashboard at http://localhost:3000/dashboard

## 🧪 Test Login Directly (Alternative Method)

If the frontend login isn't working, you can test the backend API directly:

### Option 1: Open Test HTML Page
1. Open a browser
2. Navigate to: `file:///C:/Users/umarf/OneDrive/Desktop/project mini/backend/test_login.html`
3. Click "Login" button
4. You should see a success message with a token

### Option 2: Use API Documentation
1. Open: http://localhost:8000/docs
2. Find the POST `/api/auth/login` endpoint
3. Click "Try it out"
4. Enter:
   ```json
   {
     "email": "admin@examguard.edu",
     "password": "admin123"
   }
   ```
5. Click "Execute"
6. You should receive an `access_token`

## 🐛 Troubleshooting

### If you see "401 Unauthorized":
- Make sure you're using `admin@examguard.edu` (NOT `admin@kletu.ac.in`)
- Password is exactly `admin123` (case-sensitive, no spaces)

### If the page doesn't load:
- Check that both servers are running (see terminal windows)
- Try refreshing the page (Ctrl + R)
- Clear browser cache and localStorage:
  - Press F12 to open Developer Tools
  - Go to "Application" tab
  - Click "Clear storage" → "Clear site data"
  - Refresh the page

### If login seems to work but doesn't redirect:
- Open browser Developer Tools (F12)
- Go to "Console" tab
- Look for any JavaScript errors
- Check "Network" tab for failed API requests

### Check Browser Console:
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Try logging in
4. Look for any error messages (they'll be in red)
5. Take a screenshot if you see errors

## ✅ Verify Backend is Working

Run this PowerShell command to test the API directly:

```powershell
$body = @{ email = "admin@examguard.edu"; password = "admin123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

You should see output with an `access_token` field.

## 📞 What to Report

If login still doesn't work, please provide:

1. **Which email you're using** (copy-paste it here)
2. **Error message** you see on the login page
3. **Browser console errors** (from F12 Developer Tools)
4. **Network tab** - any failed requests (red colored)
5. **Backend terminal output** - any error messages

---

**The backend API is confirmed working** (tested successfully with PowerShell). If frontend login fails, it's likely a browser/JavaScript issue that we can debug with the console logs.
