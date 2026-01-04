const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer'); // Mail paketi
const crypto = require('crypto'); // Şifreli kod üretmek için
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
const SECRET_KEY = 'pito_gizli_anahtar';

// --- GMAIL AYARLARI ---
const EMAIL_USER = 'asanmuh4mmed@gmail.com'; 
const EMAIL_PASS = 'kssm ebtq dbxo vwkf';   

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// --- SUPABASE VERİTABANI ---
const CONNECTION_STRING = 'postgresql://postgres.sjmmyusbauvithzthpvo:Mhmmd1013.10@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';
const pool = new Pool({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

// --- SUPABASE STORAGE (RESİM YÜKLEME) ---
const SUPABASE_URL = 'https://sjmmyusbauvithzthpvo.supabase.co';
// DİKKAT: Az önce bulduğun 'sb_publishable_...' anahtarını buraya tekrar yapıştır!
const SUPABASE_KEY = 'sb_publishable_lCJAyrxh_u6tig0X9MNcnQ_yqzMZ5Q1'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));
// Eğer dosyalar 'public' klasöründeyse oraya da bak:
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

// Tabloları oluştur (Zaten varsa ellemez)
const createTables = async () => {
    try {
        console.log("✅ Veritabanı bağlantısı kontrol ediliyor...");
        // isVerified sütunu yoksa eklemeyi veritabanı panelinden SQL ile yaptık, burası sadece başlatma kontrolü.
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

// 1. KAYIT OL (Mail Göndermeli)
app.post('/api/register', upload.single('profileImage'), async (req, res) => {
    const { name, email, phone, password } = req.body;
    
    // Rastgele doğrulama kodu üret
    const verificationToken = crypto.randomBytes(32).toString('hex');

    try {
        const profileImageUrl = await uploadToSupabase(req.file);
        
        // Kullanıcıyı isVerified = 0 (Onaysız) olarak kaydet
        await pool.query(
            `INSERT INTO users (name, email, phone, password, profileImageUrl, isVerified, verificationToken) VALUES ($1, $2, $3, $4, $5, 0, $6)`,
            [name, email, phone, password, profileImageUrl, verificationToken]
        );

        // Doğrulama Linki
        // Not: Canlıya alınca buradaki 'localhost:3001' kısmını yeni site linkinle değiştireceğiz.
const verifyLink = `https://pito-projesi.onrender.com/api/verify-email?token=${verificationToken}`;
        // Mail İçeriği
        const mailOptions = {
            from: `"PİTO Platformu" <${EMAIL_USER}>`,
            to: email,
            subject: 'PİTO - Hesabını Doğrula 🐾',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #3E2723; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #A64D32;">Aramıza Hoş Geldin!</h2>
                    <p>Merhaba <b>${name}</b>,</p>
                    <p>PİTO hesabını oluşturduğun için teşekkürler. Hesabını aktif etmek için lütfen aşağıdaki butona tıkla:</p>
                    <br>
                    <a href="${verifyLink}" style="background-color: #A64D32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Hesabımı Doğrula</a>
                    <br><br>
                    <p>Buton çalışmazsa şu linke tıkla: <a href="${verifyLink}">${verifyLink}</a></p>
                </div>
            `
        };

        // Maili Gönder
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Email hatası:', error);
            } else {
                console.log('Email gönderildi: ' + info.response);
            }
        });

        res.status(201).json({ message: "Kayıt başarılı! Lütfen e-posta kutunu kontrol et ve hesabını doğrula." });

    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });
        res.status(500).json({ error: err.message });
    }
});

// 2. E-POSTA DOĞRULAMA ROTASI
app.get('/api/verify-email', async (req, res) => {
    const { token } = req.query;
    
    if (!token) return res.send("<h1>Geçersiz Link ❌</h1>");

    try {
        // Token'ı bul, kullanıcıyı onayla (1 yap), token'ı sil (tek kullanımlık olsun)
        const result = await pool.query(
            `UPDATE users SET isVerified = 1, verificationToken = NULL WHERE verificationToken = $1 RETURNING name`,
            [token]
        );

        if (result.rowCount === 0) {
            return res.send("<h1>Bu link geçersiz veya süresi dolmuş. ❌</h1>");
        }

        // Başarılı Sayfası
        res.send(`
            <div style="text-align: center; font-family: Arial; margin-top: 50px;">
                <h1 style="color: #28a745;">Tebrikler ${result.rows[0].name}! 🎉</h1>
                <p style="font-size: 18px;">Hesabın başarıyla doğrulandı.</p>
                <br>
                <a href="http://localhost:3001/login.html" style="background-color: #A64D32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 18px;">Giriş Yap</a>
            </div>
        `);

    } catch (err) {
        console.error(err);
        res.send("<h1>Bir hata oluştu.</h1>");
    }
});

// 3. GİRİŞ YAP (Doğrulama Kontrolü Eklendi)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(`SELECT * FROM users WHERE email = $1 AND password = $2`, [email, password]);
        const user = result.rows[0];

        if (!user) return res.status(401).json({ message: "Hatalı e-posta veya şifre!" });

        // DOĞRULAMA KONTROLÜ
        // Veritabanından gelen değer bazen 'isverified' (küçük harf) olabilir, her ikisini de kontrol edelim.
        if (user.isverified === 0 || user.isVerified === 0) {
            return res.status(403).json({ message: "Lütfen önce e-posta adresinize gelen linke tıklayarak hesabınızı doğrulayın." });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, profileImage: user.profileImageUrl } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- DİĞER STANDART ROTALAR ---
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try { const result = await pool.query("SELECT id, name, email, phone, profileImageUrl FROM users WHERE id = $1", [req.user.id]); res.json(result.rows[0]); } catch (err) { res.sendStatus(500); }
});

app.put('/api/auth/me', authenticateToken, upload.single('newProfileImage'), async (req, res) => {
    const { name, phone } = req.body;
    try {
        let imageUrl = await uploadToSupabase(req.file);
        let sql, params;
        if (imageUrl) {
            sql = `UPDATE users SET name = $1, phone = $2, profileImageUrl = $3 WHERE id = $4 RETURNING *`;
            params = [name, phone, imageUrl, req.user.id];
        } else {
            sql = `UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING *`;
            params = [name, phone, req.user.id];
        }
        const result = await pool.query(sql, params);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ message: "Hata" }); }
});

app.get('/api/pets', async (req, res) => {
    try { const result = await pool.query("SELECT *, 'Sahiplendirme' as tur FROM pets ORDER BY id DESC"); res.json(result.rows); } catch (err) { res.status(500).json({ message: err.message }); }
});
app.get('/api/breeding-pets', async (req, res) => {
    try { const sql = `SELECT bp.*, u.name as ownerName, u.profileImageUrl as ownerImage FROM breeding_pets bp LEFT JOIN users u ON bp.user_id = u.id ORDER BY bp.id DESC`; const result = await pool.query(sql); res.json(result.rows); } catch (err) { res.status(500).json({ message: err.message }); }
});
app.get('/api/caretakers', async (req, res) => {
    try { const sql = `SELECT c.*, u.name, u.phone, u.email FROM caretakers c JOIN users u ON c.user_id = u.id`; const result = await pool.query(sql); res.json(result.rows); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/vets', async (req, res) => {
    try { const sql = `SELECT v.*, u.name as ownerName, u.profileImageUrl as ownerImage FROM vets v LEFT JOIN users u ON v.user_id = u.id ORDER BY v.createdAt DESC`; const result = await pool.query(sql); res.json(result.rows); } catch (err) { res.status(500).json({ message: "Hata" }); }
});

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

app.get('/api/pets/:id', async (req, res) => {
    try { const result = await pool.query(`SELECT p.*, u.name as ownerName, u.email as ownerEmail, u.phone as ownerPhone FROM pets p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = $1`, [req.params.id]); if (result.rows.length === 0) return res.status(404).json({ message: "Bulunamadı" }); res.json(result.rows[0]); } catch (err) { res.status(500).json({ message: "Hata" }); }
});
app.get('/api/breeding-pets/:id', async (req, res) => {
    try { const result = await pool.query(`SELECT bp.*, u.name as ownerName, u.email as ownerEmail, u.phone as ownerPhone FROM breeding_pets bp LEFT JOIN users u ON bp.user_id = u.id WHERE bp.id = $1`, [req.params.id]); if (result.rows.length === 0) return res.status(404).json({ message: "Bulunamadı" }); res.json(result.rows[0]); } catch (err) { res.status(500).json({ message: err.message }); }
});

const deleteItem = async (table, id, userId, res) => {
    try { const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 AND user_id = $2`, [id, userId]); if (result.rowCount === 0) return res.status(404).json({ message: "Silinemedi veya yetkiniz yok" }); res.json({ message: "Silindi" }); } catch (err) { res.status(500).json({ message: err.message }); }
};
app.delete('/api/pets/:id', authenticateToken, (req, res) => deleteItem('pets', req.params.id, req.user.id, res));
app.delete('/api/breeding-pets/:id', authenticateToken, (req, res) => deleteItem('breeding_pets', req.params.id, req.user.id, res));
app.delete('/api/caretakers/:id', authenticateToken, (req, res) => deleteItem('caretakers', req.params.id, req.user.id, res));
app.delete('/api/vets/:id', authenticateToken, (req, res) => deleteItem('vets', req.params.id, req.user.id, res));

app.get('/api/my-messages', authenticateToken, async (req, res) => {
    try { const sql = `SELECT m.*, s.name as sender_name, r.name as receiver_name, COALESCE(p.name, bp.name, 'Genel Sohbet') as pet_name, m.post_type FROM messages m LEFT JOIN users s ON m.sender_id = s.id LEFT JOIN users r ON m.receiver_id = r.id LEFT JOIN pets p ON m.pet_id = p.id LEFT JOIN breeding_pets bp ON m.pet_id = bp.id WHERE m.receiver_id = $1 OR m.sender_id = $2 ORDER BY m.createdAt DESC`; const result = await pool.query(sql, [req.user.id, req.user.id]); res.json(result.rows); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/messages/thread/:otherId/:petId', authenticateToken, async (req, res) => {
    try { const sql = `SELECT * FROM messages WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $3 AND receiver_id = $4)) AND pet_id = $5 ORDER BY createdAt ASC`; const result = await pool.query(sql, [req.user.id, req.params.otherId, req.params.otherId, req.user.id, req.params.petId]); res.json(result.rows); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/messages', authenticateToken, async (req, res) => {
    const { receiver_id, pet_id, post_type, message } = req.body; const rId = receiver_id || req.body.receiverId; const pId = pet_id || req.body.petId; if (!rId || !message) return res.status(400).json({ message: "Eksik bilgi." }); try { const sql = `INSERT INTO messages (sender_id, receiver_id, pet_id, post_type, message) VALUES ($1, $2, $3, $4, $5) RETURNING *`; const result = await pool.query(sql, [req.user.id, rId, pId, post_type || 'adoption', message]); res.status(201).json({ message: "Mesaj gönderildi", id: result.rows[0].id }); } catch (err) { res.status(500).json({ message: "Hata" }); }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sunucu Render üzerinde aktif. Port: ${PORT}`);
});