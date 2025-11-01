# 🚀 Quota Increase Guide - $500 Credit Usage

## Current Status
- **Credits Available**: $500
- **CPU Quota**: 20,000 milli vCPU (100% used)
- **Functions Deployed**: 20/31 (11 failed due to quota)
- **Core Features**: ✅ Working (Your Friend, AI Coach, Voice)

## 🎯 Step-by-Step Quota Increase

### Method 1: Google Cloud Console (Easiest)

1. **Open Quotas Page**:
   ```
   https://console.cloud.google.com/iam-admin/quotas?project=mindmend-25dca
   ```

2. **Filter Quotas**:
   - Click "Filter" button
   - Search: `Cloud Run CPU`
   - Or filter by: `region: asia-south1`

3. **Select Quota to Increase**:
   - ☑️ Check: **"Total CPU allocation, in milli vCPU, per project per region"**
   - Current limit: 20,000
   - Current usage: 20,000 (100%)

4. **Request Increase**:
   - Click: **"EDIT QUOTAS"** (top right)
   - New limit: **40,000** (recommended) or **60,000** (for growth)
   - Justification: 
     ```
     Mental health AI platform for Google Gen AI Exchange Hackathon.
     
     Project: MindMend - AI-powered mental wellness platform
     Features: Real-time voice AI, multilingual support (8 languages), 
     mood tracking, crisis detection
     
     Need: 31 Cloud Functions for:
     - Real-time conversational AI (Your Friend feature)
     - Multilingual chat (Hindi, Tamil, Telugu, etc.)
     - Voice-to-text and text-to-speech
     - Analytics and BigQuery exports
     - Crisis intervention and notifications
     
     Current: 20/31 functions deployed (11 failed due to CPU quota)
     Request: 40,000 milli vCPU to deploy all functions
     
     Using $500 Google Cloud credits for hackathon project.
     ```

5. **Submit**:
   - Click: **"SUBMIT REQUEST"**
   - Approval time: Usually **minutes to 2 hours**
   - Check email for approval notification

### Method 2: gcloud CLI

```bash
# List current quotas
gcloud compute project-info describe --project=mindmend-25dca

# Request quota increase (requires manual approval)
gcloud alpha compute project-info update \
  --project=mindmend-25dca \
  --quota=CPUS=40000 \
  --region=asia-south1
```

### Method 3: Support Ticket (If Rejected)

If automatic approval fails:

1. **Open Support Console**:
   ```
   https://console.cloud.google.com/support?project=mindmend-25dca
   ```

2. **Create Case**:
   - Type: **"Quota increase"**
   - Product: **"Cloud Run"**
   - Subject: **"CPU Quota Increase for Hackathon Project"**
   - Description: Use justification from Method 1
   - Attach: Screenshot of failed deployments

3. **Mention Credits**:
   - "Using $500 Google Cloud credits"
   - "For Google Gen AI Exchange Hackathon"
   - "Non-production/educational use"

---

## 💰 Cost Optimization with $500 Credit

### Current Costs (Estimated)

**Per Month**:
- Cloud Functions: ~$50-100 (31 functions)
- Cloud Run: ~$20-40 (compute time)
- Firestore: ~$10-20 (reads/writes)
- ElevenLabs: ~$50-100 (voice synthesis)
- **Total**: ~$130-260/month

**With $500 credit**: **~2-4 months free** ✅

### Reduce Costs Further

**1. Optimize Function Memory/CPU**:
```javascript
// In functions/src/index.js
setGlobalOptions({
  memory: '256MiB',  // Was 512MiB
  cpu: 0.5,          // Was 1
  timeoutSeconds: 60 // Was 300
});
```
**Savings**: ~40% reduction in CPU costs

**2. Use Minimum Instances Wisely**:
```javascript
// Only for critical functions
export const chatPersonalized = onRequest({
  minInstances: 1,  // Keep warm
  maxInstances: 10
}, handler);

// For others
export const analytics = onRequest({
  minInstances: 0,  // Cold start OK
  maxInstances: 5
}, handler);
```
**Savings**: ~$20-30/month

**3. Enable Caching**:
```javascript
// Cache Gemini responses
const cache = new Map();
// Saves ~30% on API calls
```

**4. Monitor Usage**:
```bash
# Check costs daily
gcloud billing accounts list
gcloud billing projects describe mindmend-25dca
```

---

## 🎯 Recommended Quota Increases

### Priority 1 (Critical):
| Quota | Current | Request | Reason |
|-------|---------|---------|--------|
| CPU (milli vCPU) | 20,000 | 40,000 | Deploy all 31 functions |
| Memory (GB) | 42.95 | 80 | Support concurrent users |
| Write requests/min | 30 | 60 | Handle traffic spikes |

### Priority 2 (Nice to have):
| Quota | Current | Request | Reason |
|-------|---------|---------|--------|
| Services per region | 1,000 | 1,000 | Already sufficient |
| Concurrent builds | 20 | 40 | Faster deployments |

---

## 📊 After Quota Increase

### 1. Redeploy Failed Functions

```bash
# Deploy only failed functions
firebase deploy --only functions:chatMultilingual,functions:speechToText,functions:exportChatMessage,functions:exportExerciseCompletion,functions:exportMoodEntry,functions:getAnalyticsDashboard,functions:getUserInsights,functions:onCrisisDetected,functions:onStreakMilestone,functions:sendDailyReminder,functions:streamingTranslationMetrics
```

### 2. Verify All Functions

```bash
# List all functions
firebase functions:list

# Test each endpoint
curl https://asia-south1-mindmend-25dca.cloudfunctions.net/healthCheck
```

### 3. Monitor Costs

```bash
# Enable billing alerts
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT \
  --display-name="MindMend Budget Alert" \
  --budget-amount=500 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90
```

---

## 🚨 Quota Increase Tips

### ✅ DO:
- Mention hackathon/educational use
- Provide detailed justification
- Reference $500 credits
- Show legitimate use case
- Request reasonable increase (2x current)

### ❌ DON'T:
- Request excessive quotas (10x)
- Use vague justifications
- Submit multiple requests
- Mention production/commercial use

---

## 📞 Support Contacts

**If quota request is denied**:

1. **Google Cloud Support**:
   - Console: https://console.cloud.google.com/support
   - Email: cloud-support@google.com

2. **Hackathon Organizers**:
   - May help with quota approvals
   - Can provide additional credits

3. **Firebase Support**:
   - Console: https://console.firebase.google.com/support
   - Community: https://firebase.google.com/community

---

## ✅ Success Checklist

- [ ] Submitted quota increase request
- [ ] Received approval email
- [ ] Redeployed failed functions
- [ ] Verified all 31 functions working
- [ ] Set up billing alerts
- [ ] Optimized function configurations
- [ ] Monitored costs daily

---

## 🎉 Expected Timeline

- **Request submission**: 5 minutes
- **Approval**: 30 minutes - 2 hours (usually fast)
- **Redeploy**: 10-15 minutes
- **Verification**: 5 minutes
- **Total**: ~1-3 hours

**Your $500 credit should last 2-4 months with all functions running!** 🚀
