-- =====================================================
-- PNEVMOSCAN AI - COMPLETE SUPABASE DATABASE SETUP
-- =====================================================
-- Bu faylni Supabase Dashboard > SQL Editor da ishga tushiring
-- Barcha jadvalar, indekslar, RLS policies va funksiyalar
-- =====================================================

-- 1. USERS JADVALI (Foydalanuvchilar)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'user')),
    
    -- Profil ma'lumotlari
    bio TEXT,
    phone TEXT,
    telegram TEXT,
    address TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    
    -- Tug'ilgan sana (alohida maydonlar)
    birth_day INTEGER CHECK (birth_day BETWEEN 1 AND 31),
    birth_month INTEGER CHECK (birth_month BETWEEN 1 AND 12),
    birth_year INTEGER CHECK (birth_year BETWEEN 1900 AND 2100),
    
    -- Tibbiy ma'lumotlar
    weight FLOAT CHECK (weight > 0),
    height FLOAT CHECK (height > 0),
    blood_type TEXT CHECK (blood_type IN ('A', 'B', 'AB', 'O')),
    rh_factor TEXT CHECK (rh_factor IN ('+', '-')),
    allergies TEXT,
    chronic_diseases TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users jadvali uchun indekslar
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);


-- 2. HISTORIES JADVALI (Tahlillar tarixi)
-- =====================================================
CREATE TABLE IF NOT EXISTS histories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    
    -- Tahlil turi
    type TEXT NOT NULL CHECK (type IN ('lung', 'diabetes', 'uzi')),
    
    -- Natija va ma'lumotlar
    report TEXT NOT NULL,
    summary TEXT,
    image_url TEXT, -- lung va uzi uchun
    input_data JSONB, -- diabetes uchun
    
    -- Shifokor xulosasi
    doctor_comment TEXT,
    
    -- Timestamp
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Histories jadvali uchun indekslar
CREATE INDEX IF NOT EXISTS idx_histories_user_email ON histories(user_email);
CREATE INDEX IF NOT EXISTS idx_histories_type ON histories(type);
CREATE INDEX IF NOT EXISTS idx_histories_timestamp ON histories(timestamp DESC);


-- 3. MESSAGES JADVALI (Chat xabarlari)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages jadvali uchun indekslar
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at DESC);


-- 4. NOTIFICATIONS JADVALI (Bildirishnomalar)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('message', 'comment', 'alert')),
    message TEXT NOT NULL,
    link_id TEXT, -- xabar ID yoki tahlil ID
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications jadvali uchun indekslar
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);


-- 5. TRIGGERS (Auto-update timestamp)
-- =====================================================
-- Updated_at ni avtomatik yangilash funksiyasi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users jadvali uchun trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- RLS ni hozircha o'chiramiz (chunki custom auth ishlatiladi)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE histories DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Agar kelajakda Supabase Auth ishlatmoqchi bo'lsangiz, quyidagi politsiyalarni yoqing:

-- USERS TABLE POLICIES
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
-- CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id);

-- HISTORIES TABLE POLICIES
-- ALTER TABLE histories ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own history" ON histories FOR SELECT USING (user_email = (SELECT email FROM users WHERE id = auth.uid()::text));
-- CREATE POLICY "Users can insert their own history" ON histories FOR INSERT WITH CHECK (user_email = (SELECT email FROM users WHERE id = auth.uid()::text));

-- MESSAGES TABLE POLICIES
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (sender_id = auth.uid()::text OR receiver_id = auth.uid()::text);
-- CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid()::text);

-- NOTIFICATIONS TABLE POLICIES
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (user_id = auth.uid()::text);


-- 7. REALTIME SUBSCRIPTION
-- =====================================================
-- Realtime uchun barcha jadvallarni qo'shish
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE messages, notifications, histories;
COMMIT;


-- 8. HELPER FUNCTIONS (Yordamchi funksiyalar)
-- =====================================================

-- Foydalanuvchi xabarlar sonini olish
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*)::INTEGER FROM messages WHERE receiver_id = p_user_id AND is_read = FALSE);
END;
$$ LANGUAGE plpgsql;

-- Foydalanuvchi bildirishnomalar sonini olish
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*)::INTEGER FROM notifications WHERE user_id = p_user_id AND is_read = FALSE);
END;
$$ LANGUAGE plpgsql;

-- Ikki foydalanuvchi o'rtasidagi xabarlarni olish
CREATE OR REPLACE FUNCTION get_conversation(p_user1 TEXT, p_user2 TEXT)
RETURNS TABLE (
    id UUID,
    sender_id TEXT,
    receiver_id TEXT,
    content TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.sender_id, m.receiver_id, m.content, m.is_read, m.created_at
    FROM messages m
    WHERE (m.sender_id = p_user1 AND m.receiver_id = p_user2)
       OR (m.sender_id = p_user2 AND m.receiver_id = p_user1)
    ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql;


-- 9. DEFAULT SUPER ADMIN (Agar mavjud bo'lmasa)
-- =====================================================
-- Super admin foydalanuvchini yaratish (agar mavjud bo'lmasa)
INSERT INTO users (id, name, email, password, role)
VALUES ('SUPER-ADMIN-001', 'Super Admin', 'mansur3909@gmail.com', 'admin1', 'super_admin')
ON CONFLICT (email) 
DO UPDATE SET role = 'super_admin';


-- 10. STATISTIKA VA ANALITIKA
-- =====================================================

-- Foydalanuvchilar statistikasi
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS TABLE (
    total_users BIGINT,
    super_admins BIGINT,
    admins BIGINT,
    regular_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'super_admin') as super_admins,
        COUNT(*) FILTER (WHERE role = 'admin') as admins,
        COUNT(*) FILTER (WHERE role = 'user') as regular_users
    FROM users;
END;
$$ LANGUAGE plpgsql;

-- Tahlillar statistikasi
CREATE OR REPLACE FUNCTION get_analysis_statistics()
RETURNS TABLE (
    total_analyses BIGINT,
    lung_analyses BIGINT,
    diabetes_analyses BIGINT,
    uzi_analyses BIGINT,
    analyses_with_doctor_comments BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_analyses,
        COUNT(*) FILTER (WHERE type = 'lung') as lung_analyses,
        COUNT(*) FILTER (WHERE type = 'diabetes') as diabetes_analyses,
        COUNT(*) FILTER (WHERE type = 'uzi') as uzi_analyses,
        COUNT(*) FILTER (WHERE doctor_comment IS NOT NULL) as analyses_with_doctor_comments
    FROM histories;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- TUGADI! Database tayyor
-- =====================================================

-- Barcha jadvallarni ko'rish
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Jadvallar sonini tekshirish
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'histories', COUNT(*) FROM histories
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
