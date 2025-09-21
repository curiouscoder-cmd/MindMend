# MindMend AI - Database Setup Guide

## 🗄️ **Supabase Database Implementation**

### **Step 1: Create Supabase Project**

1. Go to [Supabase](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `mindmend-ai`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project initialization (2-3 minutes)

### **Step 2: Get Your Credentials**

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Step 3: Set Environment Variables**

Add to your `.env` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# For Netlify Functions (server-side)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Service role key
```

### **Step 4: Create Database Schema**

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to execute the schema
5. Verify tables are created in **Table Editor**

### **Step 5: Install Dependencies**

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Restart your development server
npm run dev
```

### **Step 6: Test Database Connection**

1. Open browser console
2. Look for: `"Supabase initialized successfully"`
3. If you see connection errors, verify your credentials

---

## 📊 **Database Schema Overview**

### **Core Tables**

#### **users**
- User profiles and preferences
- Personality traits and onboarding status
- Authentication handled by Supabase Auth

#### **mood_entries**
- Daily mood tracking data
- Intensity levels (1-10)
- Triggers and notes

#### **exercise_completions**
- CBT exercise completion tracking
- Before/after mood comparison
- Effectiveness ratings

#### **forum_posts**
- Community forum discussions
- Anonymous posting support
- Tags and engagement metrics

#### **user_metrics**
- Session analytics and usage patterns
- Feature adoption tracking
- Wellness outcome measurements

#### **feedback_data**
- AI recommendation feedback
- Exercise effectiveness ratings
- User behavior analysis

#### **crisis_interventions**
- Crisis mode activations
- Professional escalation tracking
- Outcome monitoring

### **Key Features**

#### **Row Level Security (RLS)**
- Users can only access their own data
- Forum posts are publicly readable
- Admin functions require service key

#### **Real-time Subscriptions**
- Live updates for community features
- Real-time mood tracking
- Instant feedback collection

#### **Offline Sync**
- Automatic data synchronization
- Conflict resolution
- Queue management for offline actions

---

## 🔧 **Database Service Features**

### **Automatic Fallback**
```javascript
// The service automatically falls back to offline storage
const moodEntry = await databaseService.saveMoodEntry(userId, moodData);
// Works online (Supabase) or offline (IndexedDB)
```

### **Real-time Updates**
```javascript
// Subscribe to forum updates
const subscription = databaseService.subscribeToForumUpdates(forumId, (update) => {
  console.log('New forum activity:', update);
});
```

### **Sync Queue Management**
```javascript
// Automatically syncs when back online
window.addEventListener('online', () => {
  databaseService.syncOfflineData();
});
```

---

## 🚀 **Production Deployment**

### **Netlify Environment Variables**

In your Netlify dashboard, add:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
```

### **Database Scaling**

#### **Free Tier Limits**
- 500MB database storage
- 2GB bandwidth per month
- 50,000 monthly active users

#### **Pro Tier ($25/month)**
- 8GB database storage
- 250GB bandwidth
- 100,000 monthly active users

#### **Team Tier ($599/month)**
- Unlimited database storage
- Unlimited bandwidth
- Unlimited users

---

## 📈 **Analytics & Monitoring**

### **Built-in Metrics**
- Daily/Monthly Active Users
- Feature adoption rates
- Mood improvement tracking
- Crisis intervention success rates

### **Custom Queries**
```sql
-- User engagement over time
SELECT DATE(created_at) as date, COUNT(*) as active_users
FROM user_metrics 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- Most effective exercises
SELECT exercise_type, AVG(effectiveness) as avg_effectiveness
FROM exercise_completions 
WHERE effectiveness IS NOT NULL
GROUP BY exercise_type
ORDER BY avg_effectiveness DESC;

-- Mood improvement trends
SELECT 
  DATE(timestamp) as date,
  AVG(CASE WHEN mood IN ('happy', 'calm') THEN 1 ELSE 0 END) as positive_mood_rate
FROM mood_entries
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date;
```

---

## 🔒 **Security & Privacy**

### **Data Protection**
- All data encrypted at rest and in transit
- Row Level Security prevents unauthorized access
- GDPR compliant data handling

### **Authentication**
- Supabase Auth integration
- Anonymous user support
- Social login options

### **Backup & Recovery**
- Automatic daily backups
- Point-in-time recovery
- Cross-region replication (Pro+)

---

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Connection Failed**
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Verify in browser console
databaseService.healthCheck()
```

#### **RLS Policy Errors**
- Ensure user is authenticated
- Check policy conditions in Supabase dashboard
- Verify service key for admin operations

#### **Sync Issues**
- Check network connectivity
- Verify offline queue in browser storage
- Monitor sync status in console logs

### **Debug Commands**
```javascript
// Check database status
await databaseService.healthCheck();

// View sync queue
console.log(databaseService.syncQueue);

// Test connection
await databaseService.supabase.from('users').select('count');
```

---

## 📚 **Next Steps**

1. **Set up Supabase project** and run schema
2. **Add environment variables** to `.env` and Netlify
3. **Test database connection** in development
4. **Deploy to production** with proper scaling
5. **Monitor usage** and optimize queries

**Your MindMend AI now has a production-ready database! 🎉**
