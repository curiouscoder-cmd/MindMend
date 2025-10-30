# Gemma 3 Deployment Guide - Google Cloud Vertex AI

## Overview

This guide shows you how to deploy and use Gemma 3 models on Google Cloud Vertex AI Model Garden (cloud-native approach, no Ollama needed).

---

## Option 1: Vertex AI Model Garden (Recommended) ⭐

### Advantages
- ✅ Fully managed (no infrastructure)
- ✅ Auto-scaling
- ✅ Pay-per-use
- ✅ High availability
- ✅ Integrated with Google Cloud

### Step 1: Deploy Gemma Models via Vertex AI Console

#### 1.1 Open Vertex AI Model Garden

```bash
# Open in browser
open https://console.cloud.google.com/vertex-ai/model-garden?project=mindmend-25dca
```

Or navigate to:
1. Google Cloud Console
2. Vertex AI → Model Garden
3. Search for "Gemma 3"

#### 1.2 Deploy Gemma 3 Models

**For Gemma 3 1B (Fast, Language Detection):**
1. Click on "Gemma 3 1B"
2. Click "Deploy"
3. Configure:
   - **Region**: asia-south1 (Mumbai)
   - **Machine type**: n1-standard-4
   - **Accelerator**: NVIDIA T4 (1 GPU)
   - **Endpoint name**: gemma-3-1b-endpoint
4. Click "Deploy"
5. Wait 5-10 minutes for deployment
6. Copy the **Endpoint ID** (e.g., `1234567890123456789`)

**For Gemma 3 4B (Translation):**
1. Click on "Gemma 3 4B"
2. Click "Deploy"
3. Configure:
   - **Region**: asia-south1
   - **Machine type**: n1-standard-8
   - **Accelerator**: NVIDIA T4 (1 GPU)
   - **Endpoint name**: gemma-3-4b-endpoint
4. Click "Deploy"
5. Copy the **Endpoint ID**

**For Gemma 3 27B (Complex Reasoning):**
1. Click on "Gemma 3 27B"
2. Click "Deploy"
3. Configure:
   - **Region**: asia-south1
   - **Machine type**: n1-highmem-8
   - **Accelerator**: NVIDIA L4 (1 GPU) or A100 (1 GPU)
   - **Endpoint name**: gemma-3-27b-endpoint
4. Click "Deploy"
5. Copy the **Endpoint ID**

### Step 2: Configure Environment Variables

Add the endpoint IDs to your Firebase Functions config:

```bash
# Set Gemma endpoint IDs
firebase functions:config:set \
  gemma.endpoint_1b="1234567890123456789" \
  gemma.endpoint_4b="9876543210987654321" \
  gemma.endpoint_27b="5555555555555555555"

# Verify configuration
firebase functions:config:get
```

Or add to `.env` for local development:

```bash
# .env
GEMMA_1B_ENDPOINT=1234567890123456789
GEMMA_4B_ENDPOINT=9876543210987654321
GEMMA_27B_ENDPOINT=5555555555555555555
```

### Step 3: Install Required Package

```bash
cd functions
npm install @google-cloud/aiplatform
cd ..
```

### Step 4: Deploy Updated Functions

```bash
# Deploy functions with Gemma support
firebase deploy --only functions:streamingTranslation,functions:chatMultilingual
```

### Step 5: Test Gemma Integration

```bash
# Test language detection
curl -X POST \
  https://asia-south1-mindmend-25dca.cloudfunctions.net/chatMultilingual \
  -H "Content-Type: application/json" \
  -d '{
    "message": "मुझे मदद चाहिए",
    "language": "auto"
  }'

# Expected response with Hindi detection and translation
```

---

## Option 2: Cloud Run with Ollama (Alternative)

### Advantages
- ✅ Full control over infrastructure
- ✅ Can run offline (if deployed on GKE)
- ✅ Lower cost for high volume

### Step 1: Deploy Ollama on Cloud Run

```bash
# Clone the setup
mkdir gemma-cloud-run
cd gemma-cloud-run

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM ollama/ollama:latest

# Set environment variables
ENV OLLAMA_HOST=0.0.0.0:8080
ENV OLLAMA_MODELS=/models
ENV OLLAMA_KEEP_ALIVE=-1

# Create models directory
RUN mkdir -p /models

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]
EOF

# Create startup script
cat > start.sh << 'EOF'
#!/bin/bash
set -e

# Start Ollama in background
ollama serve &

# Wait for Ollama to start
sleep 5

# Pull Gemma models
ollama pull gemma3:1b
ollama pull gemma3:4b
ollama pull gemma3:27b

# Keep container running
wait
EOF

# Build and push to Artifact Registry
gcloud builds submit --tag asia-south1-docker.pkg.dev/mindmend-25dca/cloud-run-source-deploy/ollama-gemma

# Deploy to Cloud Run
gcloud run deploy ollama-gemma \
  --image asia-south1-docker.pkg.dev/mindmend-25dca/cloud-run-source-deploy/ollama-gemma \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 16Gi \
  --cpu 4 \
  --timeout 3600 \
  --concurrency 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars OLLAMA_HOST=0.0.0.0:8080
```

### Step 2: Get Cloud Run URL

```bash
# Get the service URL
gcloud run services describe ollama-gemma \
  --region asia-south1 \
  --format 'value(status.url)'

# Example output: https://ollama-gemma-abc123-uc.a.run.app
```

### Step 3: Configure Functions to Use Cloud Run

```bash
# Set Ollama URL
firebase functions:config:set \
  ollama.url="https://ollama-gemma-abc123-uc.a.run.app"
```

---

## Cost Comparison

### Vertex AI Model Garden (Pay-per-use)

| Model | Machine Type | GPU | Cost per Hour | Best For |
|-------|--------------|-----|---------------|----------|
| Gemma 1B | n1-standard-4 | T4 | ~$0.50 | Language detection |
| Gemma 4B | n1-standard-8 | T4 | ~$0.80 | Translation |
| Gemma 27B | n1-highmem-8 | L4 | ~$1.50 | Complex reasoning |

**Estimated Monthly Cost (1000 users):**
- Language detection: 10K requests × $0.001 = $10
- Translation: 5K requests × $0.005 = $25
- Total: ~$35/month

### Cloud Run with Ollama

| Resource | Specification | Cost per Hour |
|----------|---------------|---------------|
| CPU | 4 vCPU | $0.10 |
| Memory | 16 GB | $0.01 |
| Total | | ~$0.11/hour |

**Estimated Monthly Cost (1000 users):**
- Running 24/7: $0.11 × 720 hours = $79/month
- With auto-scaling (avg 4h/day): $0.11 × 120 hours = $13/month

**Recommendation:** Use Vertex AI for simplicity and auto-scaling.

---

## Testing Gemma Integration

### Test 1: Language Detection

```bash
curl -X POST \
  https://asia-south1-mindmend-25dca.cloudfunctions.net/chatMultilingual \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how are you?",
    "detectLanguage": true
  }'

# Expected: {"language": "en", "confidence": 0.9}
```

### Test 2: Translation

```bash
curl -X POST \
  https://asia-south1-mindmend-25dca.cloudfunctions.net/streamingTranslation \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I need help with anxiety",
    "fromLanguage": "en",
    "toLanguage": "hi"
  }'

# Expected: {"translatedText": "मुझे चिंता में मदद चाहिए"}
```

### Test 3: Multilingual Chat

```bash
curl -X POST \
  https://asia-south1-mindmend-25dca.cloudfunctions.net/chatMultilingual \
  -H "Content-Type: application/json" \
  -d '{
    "message": "मुझे तनाव है",
    "language": "hi",
    "moodHistory": [],
    "userProgress": {}
  }'

# Expected: Hindi response from AI
```

---

## Monitoring & Optimization

### Monitor Vertex AI Endpoints

```bash
# View endpoint metrics
gcloud ai endpoints list --region=asia-south1

# View prediction logs
gcloud logging read "resource.type=aiplatform.googleapis.com/Endpoint" \
  --limit 50 \
  --format json
```

### Optimize Costs

1. **Use smaller models when possible:**
   - Language detection → Gemma 1B
   - Translation → Gemma 4B
   - Complex reasoning → Gemma 27B

2. **Enable auto-scaling:**
   - Min instances: 0 (scale to zero)
   - Max instances: 3 (prevent runaway costs)

3. **Set request timeouts:**
   - Gemma 1B: 5 seconds
   - Gemma 4B: 10 seconds
   - Gemma 27B: 30 seconds

4. **Cache translations:**
   - Use Firestore to cache common translations
   - Reduce redundant API calls

---

## Troubleshooting

### Issue: Endpoint not found

```bash
# List all endpoints
gcloud ai endpoints list --region=asia-south1

# Verify endpoint ID
gcloud ai endpoints describe ENDPOINT_ID --region=asia-south1
```

### Issue: Quota exceeded

```bash
# Check quotas
gcloud compute project-info describe --project=mindmend-25dca

# Request quota increase
# Go to: https://console.cloud.google.com/iam-admin/quotas
```

### Issue: High latency

**Solutions:**
1. Use smaller models for simple tasks
2. Enable model caching
3. Increase machine type
4. Add more GPUs

---

## Migration from Ollama to Vertex AI

If you're currently using Ollama locally:

### Step 1: Update Function Code

Replace Ollama calls with Vertex AI calls:

```javascript
// Old (Ollama)
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  body: JSON.stringify({ model: 'gemma3:4b', prompt })
});

// New (Vertex AI)
const { translateText } = require('./vertexGemmaService');
const response = await translateText(text, 'en', 'hi');
```

### Step 2: Deploy Models

Follow the Vertex AI deployment steps above.

### Step 3: Update Environment Variables

```bash
# Remove Ollama URL
firebase functions:config:unset ollama.url

# Add Vertex AI endpoints
firebase functions:config:set \
  gemma.endpoint_1b="YOUR_1B_ENDPOINT_ID" \
  gemma.endpoint_4b="YOUR_4B_ENDPOINT_ID"
```

### Step 4: Redeploy Functions

```bash
firebase deploy --only functions
```

---

## Next Steps

1. ✅ Deploy Gemma models to Vertex AI
2. ✅ Configure endpoint IDs
3. ✅ Test integration
4. ✅ Monitor performance
5. ✅ Optimize costs

---

**Recommended Approach:** Start with Vertex AI Model Garden for simplicity and scalability. Switch to Cloud Run + Ollama only if you need more control or have very high volume.

**Status:** Ready to deploy Gemma 3 on Google Cloud ✅
