const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const SECRET_KEY = 'pito_gizli_anahtar';

// --- GEMINI AYARLARI ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "BURAYA_API_KEYINI_YAZ");
const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",
    systemInstruction: "Sen PITO (Pitopets) asistanısın. Hayvan sahiplendirme, eş bulma ve veterinerlik konularında yardım edersin."
});

// --- MAİL GÖNDERME AYARLARI (SERVİS MODU) ---
const transporter = nodemailer.createTransport({
  service: 'gmail', // Host ve Port yerine bunu kullanıyoruz
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- SUPABASE VERİTABANI ---
const CONNECTION_STRING = 'postgresql://postgres.sjmmyusbauvithzthpvo:Mhmmd1013.10@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';
const pool = new Pool({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

// --- SUPABASE STORAGE ---
const SUPABASE_URL = 'https://sjmmyusbauvithzthpvo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lCJAyrxh_u6tig0X9MNcnQ_yqzMZ5Q1'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

// --- YARDIMCI FONKSİYONLAR ---
async function uploadToSupabase(file) {
    if (!file) return null;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
    const { data, error } = await supabase.storage.from('images').upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) { console.error('Supabase Yükleme Hatası:', error); throw new Error('Resim yüklenirken hata oluştu'); }
    const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
}

const createTables = async () => {
    try {
        console.log("✅ Veritabanı bağlantısı kontrol ediliyor...");
        // Test sorgusu
        await pool.query('SELECT NOW()');
        console.log("✅ Veritabanı bağlantısı başarılı.");
    } catch (err) { console.error("Başlatma hatası:", err); }
};
createTables();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ================= ROTALAR =================
// --- 1. KAYIT OL ROTASI (BYPASS MODU) ---
app.post('/api/register', upload.single('profileImage'), async (req, res) => {
    const { name, email, phone, password } = req.body;
    
    // Doğrulama kodu oluştur
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        console.log(`🚀 KAYIT İSTEĞİ GELDİ: ${email}`);

        // 1. Kullanıcıyı Kaydet
        let profileImageUrl = null;
        if(req.file) {
            profileImageUrl = await uploadToSupabase(req.file);
        }

        await pool.query(
            `INSERT INTO users (name, email, phone, password, profileImageUrl, is_verified, verificationToken) VALUES ($1, $2, $3, $4, $5, false, $6)`,
            [name, email, phone, password, profileImageUrl, verificationCode]
        );

        // ============================================================
        //  KRİTİK DEĞİŞİKLİK: MAİL GÖNDERMEYİ KAPATIYORUZ
        //  Render Gmail'i engellediği için kodu buraya (Loglara) yazıyoruz.
        // ============================================================
        
        console.log("------------------------------------------------");
        console.log(`🔑 DOĞRULAMA KODU (LOG): ${verificationCode}`);
        console.log("------------------------------------------------");

        // Mail göndermeye ÇALIŞMIYORUZ, direkt başarılı diyoruz.
        // Böylece "İşleniyor" ekranında kalmayacak.
        
        res.status(201).json({ 
            success: true, 
            message: "Kayıt başarılı! (Mail sunucusu yanıt vermediği için kod sistem loglarına yazıldı)",
            requireVerification: true,
            email: email
        });

    } catch (err) {
        console.error("❌ HATA:", err);
        
        if (err.code === '23505') {
            return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });
        }
        res.status(500).json({ message: "Sunucu hatası." });
    }
});

// --- 2. DOĞRULAMA ROTASI (BUNU EKLEMEN LAZIM) ---
app.post('/api/verify-otp', async (req, res) => {
    const { email, code } = req.body;

    try {
        // 1. Kullanıcıyı ve Kodu Bul
        // Kodun eşleştiğini ve emailin doğru olduğunu kontrol ediyoruz
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1 AND "verificationToken" = $2`, 
            [email, code]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Hatalı kod veya geçersiz e-posta!" });
        }

        // 2. Hesabı Onayla (is_verified = true) ve Kodu Sil
        await pool.query(
            `UPDATE users SET is_verified = true, "verificationToken" = NULL WHERE email = $1`,
            [email]
        );

        res.status(200).json({ success: true, message: "Hesabınız doğrulandı! Giriş yapabilirsiniz." });

    } catch (err) {
        console.error("Doğrulama Hatası:", err);
        res.status(500).json({ message: "Sunucu hatası." });
    }
});

// 2. GİRİŞ YAP
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(`SELECT * FROM users WHERE email = $1 AND password = $2`, [email, password]);
        const user = result.rows[0];

        if (!user) return res.status(401).json({ message: "Hatalı e-posta veya şifre!" });

        // isVerified kontrolü (veritabanında bazen küçük bazen büyük harf olabilir, ikisini de kontrol et)
if (user.isverified === false || user.isVerified === false) {            return res.status(403).json({ message: "Lütfen önce hesabınızı doğrulayın." });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, profileImage: user.profileImageUrl } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- KULLANICI ROTALARI ---

// 1. KENDİ BİLGİLERİMİ GETİR
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try { 
        const result = await pool.query(
            "SELECT id, name, email, phone, profileImageUrl, is_verified, job_title FROM users WHERE id = $1", 
            [req.user.id]
        ); 
        res.json(result.rows[0]); 
    } catch (err) { 
        console.error(err);
        res.sendStatus(500); 
    }
});

// 2. PROFİLİMİ GÜNCELLE
app.put('/api/auth/me', authenticateToken, upload.single('newProfileImage'), async (req, res) => {
    const { name, phone, job_title } = req.body; 
    
    try {
        let imageUrl = await uploadToSupabase(req.file);
        let sql, params;
        
        if (imageUrl) {
            sql = `UPDATE users SET name = $1, phone = $2, job_title = $3, profileImageUrl = $4 WHERE id = $5 RETURNING *`;
            params = [name, phone, job_title, imageUrl, req.user.id];
        } else {
            sql = `UPDATE users SET name = $1, phone = $2, job_title = $3 WHERE id = $4 RETURNING *`;
            params = [name, phone, job_title, req.user.id];
        }
        
        const result = await pool.query(sql, params);
        res.json(result.rows[0]);
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ message: "Güncelleme hatası" }); 
    }
});

// --- GET ROTALARI ---
app.get('/api/pets', async (req, res) => {
    try { 
        const sql = `SELECT p.*, u.name as ownerName, u.is_verified as ownerVerified, 'Sahiplendirme' as tur 
            FROM pets p 
            LEFT JOIN users u ON p.user_id = u.id 
            ORDER BY p.id DESC`;
        const result = await pool.query(sql); 
        res.json(result.rows); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

app.get('/api/pets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `SELECT p.*, u.name as ownerName, u.email as ownerEmail, u.profileImageUrl as ownerImage, u.is_verified as ownerVerified
            FROM pets p 
            LEFT JOIN users u ON p.user_id = u.id 
            WHERE p.id = $1`;
        
        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "İlan bulunamadı" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Detay hatası:", err);
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

app.get('/api/breeding-pets', async (req, res) => {
    try { 
        const sql = `SELECT bp.*, u.name as ownerName, u.is_verified as ownerVerified, u.profileImageUrl as ownerImage FROM breeding_pets bp LEFT JOIN users u ON bp.user_id = u.id ORDER BY bp.id DESC`; 
        const result = await pool.query(sql); 
        res.json(result.rows); 
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

app.get('/api/breeding-pets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `SELECT bp.*, u.name as ownerName, u.email as ownerEmail, u.profileImageUrl as ownerImage, u.is_verified as ownerVerified
            FROM breeding_pets bp 
            LEFT JOIN users u ON bp.user_id = u.id 
            WHERE bp.id = $1`;
        
        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Eş ilanı bulunamadı" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Breeding detay hatası:", err);
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

app.get('/api/caretakers', async (req, res) => {
    try { const sql = `SELECT c.*, u.name, u.phone, u.email FROM caretakers c JOIN users u ON c.user_id = u.id`; const result = await pool.query(sql); res.json(result.rows); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/vets', async (req, res) => {
    try { const sql = `SELECT v.*, u.name as ownerName, u.profileImageUrl as ownerImage FROM vets v LEFT JOIN users u ON v.user_id = u.id ORDER BY v.createdAt DESC`; const result = await pool.query(sql); res.json(result.rows); } catch (err) { res.status(500).json({ message: "Hata" }); }
});

// --- POST ROTALARI (İLAN EKLEME) ---
app.post('/api/pets', authenticateToken, upload.single('petImage'), async (req, res) => {
    const { name, species, age, gender, story } = req.body;
    try { const imageUrl = await uploadToSupabase(req.file); await pool.query(`INSERT INTO pets (user_id, name, species, age, gender, story, imageUrl) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [req.user.id, name, species, age, gender, story, imageUrl]); res.status(201).json({ message: "İlan eklendi!" }); } catch (err) { res.status(500).json({ message: err.message }); }
});
app.post('/api/breeding-pets', authenticateToken, upload.single('petImage'), async (req, res) => {
    const { name, species, breed, gender, age, description } = req.body;
    try { const imageUrl = await uploadToSupabase(req.file); await pool.query(`INSERT INTO breeding_pets (user_id, name, species, breed, gender, age, description, imageUrl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [req.user.id, name, species, breed, gender, age, description, imageUrl]); res.status(201).json({ message: "İlan eklendi" }); } catch (err) { res.status(500).json({ message: err.message }); }
});
app.post('/api/caretakers', authenticateToken, upload.single('caretakerImage'), async (req, res) => {
    const { title, experience, price, location, description } = req.body;
    try { const imageUrl = await uploadToSupabase(req.file); await pool.query(`INSERT INTO caretakers (user_id, title, experience, price, location, description, imageUrl) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [req.user.id, title, experience, price, location, description, imageUrl]); res.status(201).json({ message: "Bakıcı eklendi" }); } catch (err) { res.status(500).json({ message: err.message }); }
});
app.post('/api/vets', authenticateToken, upload.single('vetImage'), async (req, res) => {
    const { clinicName, vetName, city, phone, address } = req.body;
    try { const imageUrl = await uploadToSupabase(req.file); await pool.query(`INSERT INTO vets (user_id, clinicName, vetName, city, phone, address, imageUrl) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [req.user.id, clinicName, vetName, city, phone, address, imageUrl]); res.status(201).json({ message: "Klinik başarıyla eklendi!" }); } catch (err) { res.status(500).json({ message: "Veritabanı hatası" }); }
});
// --- server.js ---

// Mevcut kodlarının arasına bu yeni rotayı ekle
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "Lütfen tüm alanları doldurun." });
    }

    // Gönderilecek mail içeriği
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'petspito@gmail.com', // Alıcı adresi
        subject: `PİTO - Yeni İletişim Formu Mesajı (${name})`,
        html: `
            <h3>Yeni İletişim Mesajı</h3>
            <p><b>Gönderen:</b> ${name}</p>
            <p><b>E-posta:</b> ${email}</p>
            <p><b>Mesaj:</b></p>
            <p>${message}</p>
            <hr>
            <p>Bu mesaj PİTO web sitesi iletişim formu aracılığıyla gönderilmiştir.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Mesajınız başarıyla gönderildi!" });
    } catch (error) {
        console.error("Mail gönderme hatası:", error);
        res.status(500).json({ message: "Mesaj gönderilirken bir hata oluştu." });
    }
});

// --- YORUMLAR ---
app.get('/api/reviews/:vetId', async (req, res) => {
    const { vetId } = req.params;
    try {
        const sql = `SELECT r.*, u.name as user_name 
            FROM reviews r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.vet_id = $1 
            ORDER BY r.created_at DESC`;        
        const result = await pool.query(sql, [vetId]);
        res.json(result.rows);
    } catch (err) {
        console.error("Yorum Getirme Hatası:", err);
        res.status(500).json({ message: "Yorumlar alınamadı." });
    }
});

app.post('/api/reviews', authenticateToken, async (req, res) => {
    const { vet_id, rating, comment } = req.body;
    const user_id = req.user.id; 

    if (!vet_id || !rating || !comment) {
        return res.status(400).json({ message: "Eksik bilgi gönderildi." });
    }

    try {
        const sql = `INSERT INTO reviews (vet_id, user_id, rating, comment) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *`;        
        await pool.query(sql, [vet_id, user_id, rating, comment]);
        res.status(201).json({ message: "Yorum başarıyla kaydedildi!" });
    } catch (err) {
        console.error("Yorum Kaydetme Hatası:", err);
        res.status(500).json({ message: "Sunucu hatası oluştu." });
    }
});

// --- SİLME ROTALARI ---
const deleteItem = async (table, id, userId, res) => {
    try { const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 AND user_id = $2`, [id, userId]); if (result.rowCount === 0) return res.status(404).json({ message: "Silinemedi veya yetkiniz yok" }); res.json({ message: "Silindi" }); } catch (err) { res.status(500).json({ message: err.message }); }
};
app.delete('/api/pets/:id', authenticateToken, (req, res) => deleteItem('pets', req.params.id, req.user.id, res));
app.delete('/api/breeding-pets/:id', authenticateToken, (req, res) => deleteItem('breeding_pets', req.params.id, req.user.id, res));
app.delete('/api/caretakers/:id', authenticateToken, (req, res) => deleteItem('caretakers', req.params.id, req.user.id, res));
app.delete('/api/vets/:id', authenticateToken, (req, res) => deleteItem('vets', req.params.id, req.user.id, res));

// --- MESAJLAŞMA ROTALARI ---
// --- server.js ---

app.get('/api/my-messages', authenticateToken, async (req, res) => {
    try {
        // GÜNCELLEME: s.is_verified ve r.is_verified alanlarını seçtik
        const sql = `SELECT m.*, 
            s.name as sender_name, s.is_verified as sender_verified, 
            r.name as receiver_name, r.is_verified as receiver_verified, 
            COALESCE(p.name, bp.name, 'Genel Sohbet') as pet_name, m.post_type, m.is_read
            FROM messages m
            LEFT JOIN users s ON m.sender_id = s.id
            LEFT JOIN users r ON m.receiver_id = r.id
            LEFT JOIN pets p ON m.pet_id = p.id
            LEFT JOIN breeding_pets bp ON m.pet_id = bp.id
            WHERE m.receiver_id = $1 OR m.sender_id = $2
            ORDER BY m.createdAt DESC`;        
        
        const result = await pool.query(sql, [req.user.id, req.user.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/messages/thread/:otherId/:petId', authenticateToken, async (req, res) => {
    try {
        const otherId = parseInt(req.params.otherId);
        const petId = parseInt(req.params.petId);
        const sql = `SELECT * FROM messages WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $3 AND receiver_id = $4)) AND pet_id = $5 ORDER BY createdAt ASC`;
        const result = await pool.query(sql, [req.user.id, otherId, otherId, req.user.id, petId]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/messages', authenticateToken, upload.single('messageImage'), async (req, res) => {
    const receiver_id = req.body.receiver_id !== undefined ? req.body.receiver_id : req.body.receiverId;
    let pet_id = req.body.pet_id !== undefined ? req.body.pet_id : (req.body.petId || 0);
    const { message, post_type } = req.body;

    if (!receiver_id || (!message && !req.file)) {
        return res.status(400).json({ message: "Mesaj veya resim göndermelisiniz." });
    }

    try {
        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadToSupabase(req.file);
        }

        const sql = `INSERT INTO messages (sender_id, receiver_id, pet_id, post_type, message, image_url, is_read) 
            VALUES ($1, $2, $3, $4, $5, $6, FALSE) 
            RETURNING *`;        
        const result = await pool.query(sql, [
            req.user.id, 
            receiver_id, 
            pet_id, 
            post_type || 'adoption', 
            message || '', 
            imageUrl
        ]);
        
        res.status(201).json({ message: "Mesaj gönderildi", data: result.rows[0] });

    } catch (err) { 
        console.error("Mesaj Gönderme Hatası:", err);
        res.status(500).json({ message: "Hata: " + err.message }); 
    }
});

// --- BAŞKASININ PROFİLİNİ GÖR (GET) ---
app.get('/api/users/profile/:id', async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    
    const authHeader = req.headers['authorization'];
    let currentUserId = null;
    
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            currentUserId = decoded.id;
        } catch (e) { }
    }

    try {
        const userRes = await pool.query(
            `SELECT id, name, profileImageUrl, about_me, createdAt, is_verified, job_title FROM users WHERE id = $1`, 
            [targetUserId]
        );

        if (userRes.rows.length === 0) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        const user = userRes.rows[0];

        const followerCountRes = await pool.query(`SELECT COUNT(*) FROM follows WHERE following_id = $1`, [targetUserId]);
        const followingCountRes = await pool.query(`SELECT COUNT(*) FROM follows WHERE follower_id = $1`, [targetUserId]);

        let isFollowing = false;
        if (currentUserId) {
            const followCheck = await pool.query(
                `SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2`, 
                [currentUserId, targetUserId]
            );
            isFollowing = followCheck.rows.length > 0;
        }

        const petsRes = await pool.query(`SELECT *, 'adoption' as type FROM pets WHERE user_id = $1`, [targetUserId]);
        const breedingRes = await pool.query(`SELECT *, 'breeding' as type FROM breeding_pets WHERE user_id = $1`, [targetUserId]);

        res.json({
            user: user,
            stats: {
                followers: parseInt(followerCountRes.rows[0].count),
                following: parseInt(followingCountRes.rows[0].count),
                isFollowing: isFollowing
            },
            listings: [...petsRes.rows, ...breedingRes.rows] 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Profil yüklenirken hata oluştu" });
    }
});

// --- TAKİP ET / TAKİBİ BIRAK (TOGGLE) ---
app.post('/api/users/follow', authenticateToken, async (req, res) => {
    const { targetId } = req.body;
    const myId = req.user.id;

    if (parseInt(targetId) === myId) {
        return res.status(400).json({ message: "Kendinizi takip edemezsiniz." });
    }

    try {
        const check = await pool.query(
            `SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2`,
            [myId, targetId]
        );

        if (check.rows.length > 0) {
            // TAKİBİ BIRAK
            await pool.query(
                `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
                [myId, targetId]
            );
            res.json({ status: 'unfollowed', message: "Takip bırakıldı." });
        } else {
            // TAKİP ET
            await pool.query(
                `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`,
                [myId, targetId]
            );

            // BİLDİRİM EKLEME
            await pool.query(
                `INSERT INTO notifications (user_id, sender_id, type, message) VALUES ($1, $2, 'follow', 'seni takip etmeye başladı.')`,
                [targetId, myId]
            );
            
            res.json({ status: 'followed', message: "Takip edildi." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "İşlem başarısız." });
    }
});

// --- TAKİPÇİYİ ÇIKARMA ROTASI (DÜZELTİLDİ: TEK SEFER VE POSTGRESQL UYUMLU) ---
app.post('/api/users/remove-follower', authenticateToken, async (req, res) => {
    try {
        const myId = req.user.id;           // Senin ID'n
        const targetId = req.body.targetId; // Seni takip eden kişinin ID'si

        if (!targetId) {
            return res.status(400).json({ message: "Hedef kullanıcı ID'si eksik." });
        }

        // PostgreSQL Sorgusu ($1, $2 syntax)
        const text = 'DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2';
        
        // DİKKAT: Veritabanındaki sütun adlarına göre burayı güncelledim.
        // Genelde tablo yapısı: follower_id (takip eden), following_id (takip edilen) olur.
        // Eğer senin tablon farklıysa (örn: followed_id) ona göre ayarlarız.
        // Standart PITO yapısında 'following_id' kullanılıyor.
        
        const deleteQuery = 'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2';
        const values = [targetId, myId];

        const result = await pool.query(deleteQuery, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Bu kullanıcı zaten sizi takip etmiyor." });
        }

        res.status(200).json({ message: "Kişi takipçilerinizden çıkarıldı." });

    } catch (err) {
        console.error("Takipçi çıkarma hatası (Postgres):", err);
        res.status(500).json({ message: "Sunucu hatası oluştu." });
    }
});

app.get('/api/users/connections/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const followersSql = `SELECT u.id, u.name, u.profileImageUrl 
            FROM follows f 
            JOIN users u ON f.follower_id = u.id 
            WHERE f.following_id = $1`;        
        
        const followingSql = `SELECT u.id, u.name, u.profileImageUrl 
            FROM follows f 
            JOIN users u ON f.following_id = u.id 
            WHERE f.follower_id = $1`;

        const followers = await pool.query(followersSql, [userId]);
        const following = await pool.query(followingSql, [userId]);

        res.json({
            followers: followers.rows,
            following: following.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Liste alınamadı" });
    }
});

// --- BİLDİRİM ROTALARI ---
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const sql = `SELECT n.*, u.name as sender_name, u.profileImageUrl as sender_image
            FROM notifications n
            JOIN users u ON n.sender_id = u.id
            WHERE n.user_id = $1
            ORDER BY n.created_at DESC`;        
        const result = await pool.query(sql, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Bildirimler alınamadı" });
    }
});

app.put('/api/notifications/read', authenticateToken, async (req, res) => {
    try {
        await pool.query("UPDATE notifications SET is_read = TRUE WHERE user_id = $1", [req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Hata" });
    }
});

app.delete('/api/messages/thread/:otherId/:petId', authenticateToken, async (req, res) => {
    const otherId = parseInt(req.params.otherId);
    const petId = parseInt(req.params.petId);
    const myId = req.user.id;

    try {
        const sql = `DELETE FROM messages 
            WHERE (
                (sender_id = $1 AND receiver_id = $2) OR 
                (sender_id = $3 AND receiver_id = $4)
            ) AND pet_id = $5`;        
        await pool.query(sql, [myId, otherId, otherId, myId, petId]);
        res.json({ message: "Sohbet silindi." });
    } catch (err) {
        console.error("Silme hatası:", err);
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

// --- PITO BOT (YAPAY ZEKA) ---
app.post('/api/pito-bot', authenticateToken, async (req, res) => {
    const { userMessage } = req.body;
    if (!userMessage) return res.status(400).json({ message: "Mesaj boş olamaz." });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Senin adın "PITO Bot". Sen PITO (Evcil Hayvan Platformu) asistanısın. GÖREVİN: Kullanıcıların evcil hayvanlarla ilgili sorularını yanıtlamak. KURALLAR: Asla kesin tıbbi teşhis koyma. Nazik ve emojili dil kullan. KULLANICI SORUSU: "${userMessage}"`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ reply: text });
    } catch (err) {
        console.error("Gemini Hatası:", err);
        res.status(500).json({ message: "PITO Bot şu an meşgul." });
    }
});

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const text = response.text();
        res.json({ reply: text });
    } catch (error) {
        console.error("AI Hatası:", error);
        res.status(500).json({ error: "Yapay zeka yanıt veremedi." });
    }
});

// --- BAKICI YORUMLARI API (YENİ) ---

// 1. Bakıcıya ait yorumları getir
app.get('/api/caretaker-reviews/:caretakerId', async (req, res) => {
    const { caretakerId } = req.params;
    try {
        const sql = `
            SELECT cr.*, u.name as user_name, u.profileImageUrl as user_image
            FROM caretaker_reviews cr
            JOIN users u ON cr.user_id = u.id
            WHERE cr.caretaker_id = $1
            ORDER BY cr.created_at DESC`;
        const result = await pool.query(sql, [caretakerId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Yorumlar alınamadı" });
    }
});

// 2. Bakıcıya yorum yap
app.post('/api/caretaker-reviews', authenticateToken, async (req, res) => {
    const { caretaker_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!caretaker_id || !rating || !comment) {
        return res.status(400).json({ message: "Eksik bilgi." });
    }

    try {
        // Kullanıcı kendine yorum yapamasın
        const checkOwner = await pool.query("SELECT user_id FROM caretakers WHERE id = $1", [caretaker_id]);
        if (checkOwner.rows.length > 0 && checkOwner.rows[0].user_id === user_id) {
            return res.status(400).json({ message: "Kendinize yorum yapamazsınız." });
        }

        const sql = `
            INSERT INTO caretaker_reviews (caretaker_id, user_id, rating, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
        await pool.query(sql, [caretaker_id, user_id, rating, comment]);
        
        res.status(201).json({ message: "Yorumunuz kaydedildi!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Yorum kaydedilemedi." });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sunucu Render üzerinde aktif. Port: ${PORT}`);
});