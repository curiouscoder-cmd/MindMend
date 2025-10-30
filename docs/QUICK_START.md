# 🚀 MindMend AI - Quick Start Guide

## Deploy in 3 Commands

### 1. Deploy Without Gemma (Fastest - 5 minutes)

```bash
# Deploy everything with Gemini only
./deploy.sh
```

**What you get:**
- ✅ Full app deployed
- ✅ AI chat with Gemini 2.5
- ✅ All features working
- ✅ English + basic multilingual

**Cost:** ~$60/month for 1000 users

---

### 2. Deploy With Gemma Cloud (Recommended - 15 minutes)

#### Step A: Deploy Gemma Models

```bash
# 1. Open Vertex AI Model Garden
open https://console.cloud.google.com/vertex-ai/model-garden?project=mindmend-25dca

# 2. Search for "Gemma 3" and deploy:
#    - Gemma 3 4B (for translation)
#    - Region: asia-south1
#    - Machine: n1-standard-8 + T4 GPU
#    - Copy the Endpoint ID

# 3. Configure endpoint
firebase functions:config:set gemma.endpoint_4b="YOUR_ENDPOINT_ID"
```

#### Step B: Install & Deploy

```bash
# Install Vertex AI package
cd functions && npm install @google-cloud/aiplatform && cd ..

# Deploy everything
./deploy.sh
```

**What you get:**
- ✅ Everything from option 1
- ✅ Advanced multilingual (10 languages)
- ✅ Better translation quality
- ✅ Faster language detection

**Cost:** ~$95/month for 1000 users

---

### 3. Test Deployment

```bash
# Open your app
open https://mindmend-25dca.web.app

# Test API
curl https://asia-south1-mindmend-25dca.cloudfunctions.net/healthCheck

# Monitor logs
firebase functions:log --follow
```

---

## Troubleshooting

### Build fails?
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Deployment fails?
```bash
firebase login
firebase use mindmend-25dca
./deploy.sh
```

### Gemma not working?
- Check endpoint ID is correct
- Verify model is deployed in asia-south1
- Check Firebase Functions config: `firebase functions:config:get`

---

## What's Next?

1. ✅ **Test your app** - Visit the live URL
2. 📹 **Record demo video** - Show all features
3. 📊 **Create slides** - For hackathon presentation
4. 🏆 **Submit to hackathon** - You're ready!

---

**Need help?** Check these docs:
- Full deployment: `DEPLOYMENT_GUIDE.md`
- Gemma setup: `GEMMA_DEPLOYMENT_GUIDE.md`
- All fixes: `ALL_FIXES_COMPLETE.md`

**Ready to deploy? Run:** `./deploy.sh` 🚀
