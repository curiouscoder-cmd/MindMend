-- MindMend AI Database Schema for Supabase
-- Run this in your Supabase SQL editor to create the required tables

-- Note: Supabase handles JWT secrets automatically, no manual configuration needed

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{}',
    personality_traits JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood entries table
CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mood TEXT NOT NULL,
    intensity INTEGER DEFAULT 5 CHECK (intensity >= 1 AND intensity <= 10),
    triggers TEXT[] DEFAULT '{}',
    notes TEXT DEFAULT '',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise completions table
CREATE TABLE IF NOT EXISTS exercise_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL,
    exercise_type TEXT NOT NULL,
    duration INTEGER, -- in seconds
    completion_rate INTEGER DEFAULT 100 CHECK (completion_rate >= 0 AND completion_rate <= 100),
    mood_before TEXT,
    mood_after TEXT,
    effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 5),
    notes TEXT DEFAULT '',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    forum_id TEXT NOT NULL,
    title TEXT DEFAULT '',
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    likes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User metrics table
CREATE TABLE IF NOT EXISTS user_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT,
    session_duration INTEGER, -- in milliseconds
    features_used TEXT[] DEFAULT '{}',
    exercises_completed INTEGER DEFAULT 0,
    mood_entries INTEGER DEFAULT 0,
    ai_interactions INTEGER DEFAULT 0,
    voice_usage INTEGER DEFAULT 0,
    community_engagement INTEGER DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced BOOLEAN DEFAULT TRUE,
    events JSONB DEFAULT '[]'
);

-- Feedback data table
CREATE TABLE IF NOT EXISTS feedback_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'recommendation', 'exercise', 'implicit'
    target_id TEXT, -- recommendation_id, exercise_id, etc.
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    helpful BOOLEAN,
    used BOOLEAN,
    outcome TEXT, -- 'improved', 'no_change', 'worse'
    comments TEXT DEFAULT '',
    context JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crisis interventions table
CREATE TABLE IF NOT EXISTS crisis_interventions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL,
    urgency_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    actions_provided TEXT[] DEFAULT '{}',
    user_response TEXT,
    escalated BOOLEAN DEFAULT FALSE,
    professional_contacted BOOLEAN DEFAULT FALSE,
    outcome TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_timestamp ON mood_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_completions_user_id ON exercise_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_completions_timestamp ON exercise_completions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_forum_id ON forum_posts(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_timestamp ON forum_posts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metrics_date ON user_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_data_user_id ON feedback_data(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_interventions_user_id ON crisis_interventions(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_interventions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own mood entries" ON mood_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood entries" ON mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood entries" ON mood_entries FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own exercise completions" ON exercise_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercise completions" ON exercise_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Forum posts can be viewed by all users (for community features)
CREATE POLICY "Anyone can view forum posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own forum posts" ON forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own forum posts" ON forum_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own metrics" ON user_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metrics" ON user_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" ON feedback_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feedback" ON feedback_data FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own crisis interventions" ON crisis_interventions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own crisis interventions" ON crisis_interventions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for development (optional)
INSERT INTO users (id, email, name, preferences) VALUES 
('00000000-0000-0000-0000-000000000001', 'demo@mindmend.ai', 'Demo User', '{"theme": "light", "notifications": true}')
ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
