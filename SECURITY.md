# 🔒 Security Guide - API Key Management

## ⚠️ IMPORTANT: API Key Security

Your Gemini API key was **accidentally committed** to GitHub. This is a security risk!

## 🚨 Immediate Actions Required

### 1. Revoke the Exposed Key
1. Go to [Google AI Studio API Keys](https://makersuite.google.com/app/apikey)
2. **Delete** the old key: `AIzaSyBIN3jVecrb1t0xLWtEtAVtdOpcaTQjkoY`
3. **Generate** a new key

### 2. Use Environment Variables (Already Fixed)

The code has been updated to use environment variables instead of hardcoded keys.

## ✅ How to Set Up API Key Securely

### Option 1: Using .env File (Recommended for Development)

1. **Create `.env` file** in the `backend/` directory:
```bash
cd backend
cp .env.example .env
```

2. **Edit `.env` file** and add your new API key:
```bash
GEMINI_API_KEY=your-new-gemini-api-key-here
```

3. **Install python-dotenv** (if not already installed):
```bash
pip install python-dotenv
```

4. **Load .env in main.py** (add at the top):
```python
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file
```

### Option 2: Set Environment Variable Directly

**Windows PowerShell:**
```powershell
$env:GEMINI_API_KEY = "your-new-api-key-here"
python main.py
```

**Linux/Mac:**
```bash
export GEMINI_API_KEY="your-new-api-key-here"
python main.py
```

**Windows Command Prompt:**
```cmd
set GEMINI_API_KEY=your-new-api-key-here
python main.py
```

## 🔐 Best Practices

### ✅ DO:
- Use environment variables for API keys
- Add `.env` to `.gitignore`
- Use `.env.example` as a template (without real keys)
- Rotate keys regularly
- Use different keys for dev/staging/production

### ❌ DON'T:
- Never commit API keys to Git
- Never share keys in public forums/chat
- Never hardcode keys in source code
- Never commit `.env` files

## 🛡️ Additional Security Measures

### 1. Check Git History
The old key is still in Git history. To remove it completely:

```bash
# Warning: This rewrites Git history!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/main.py" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (BE CAREFUL!)
git push origin --force --all
```

**OR** (easier but less thorough):
- Revoke the old key (most important!)
- Continue with new key setup

### 2. Use API Key Restrictions
In Google Cloud Console:
- Restrict key to specific APIs (Gemini API only)
- Set HTTP referrer restrictions
- Set IP address restrictions
- Monitor usage for unusual activity

### 3. Add GitHub Secret Scanning Alerts
GitHub automatically detects exposed secrets. Check:
- Repository Settings → Security → Secret scanning alerts

## 📦 For Production Deployment

### Using Docker Secrets
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      GEMINI_API_KEY: ${GEMINI_API_KEY}
```

### Using Cloud Providers
- **AWS**: AWS Secrets Manager or Parameter Store
- **Google Cloud**: Secret Manager
- **Azure**: Azure Key Vault
- **Heroku**: Config Vars
- **Vercel/Netlify**: Environment Variables in dashboard

## ✅ Verification

After setting up, verify your API key is loaded:

```bash
cd backend
python -c "import os; print('Key loaded!' if os.getenv('GEMINI_API_KEY') else 'Key NOT found!')"
```

## 📞 What If Key Was Abused?

1. **Check API usage** in Google Cloud Console
2. **Revoke key immediately**
3. **Generate new key**
4. **Set up billing alerts** to detect unusual usage
5. **Report to Google** if you see fraudulent charges

## 🔄 Key Rotation Schedule

- **Development**: Every 3-6 months
- **Production**: Every 1-3 months
- **After exposure**: Immediately

---

**Remember**: The best security practice is to **never commit secrets to Git** in the first place!

For questions, see: [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/best-practices-for-preventing-data-leaks-in-your-organization)
