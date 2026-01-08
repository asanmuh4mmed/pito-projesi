const API_URL = 'https://pitopets.com'; 
let profileUserId = null;
let myCurrentId = null; 

// Token çözümleme
function parseJwt(token) {
    try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
}

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    if (!token) { window.location.href = 'login.html'; return; }

    const payload = parseJwt(token);
    if (payload && payload.id) {
        myCurrentId = payload.id;
    } else {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('id')) {
        profileUserId = urlParams.get('id'); 
    } else {
        profileUserId = myCurrentId; 
    }

    await loadUserProfile();
});

// Profil Verilerini Çekme
async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_URL}/api/users/profile/${profileUserId}`, { headers });
        if (!res.ok) throw new Error("Profil yüklenemedi");

        const data = await res.json();
        
        renderProfile(data);
        renderTabs(data.listings);

    } catch (err) {
        console.error(err);
        document.querySelector('.container.mt-5').innerHTML = `<div class="alert alert-danger text-center m-5">Kullanıcı bulunamadı veya profil gizli.</div>`;
    }
}

// Profili Ekrana Basma
function renderProfile(data) {
    const user = data.user;
    const stats = data.stats;
    const isMe = (String(myCurrentId) === String(user.id));

    // --- 1. İSİM ve MAVİ TİK ---
    const nameEl = document.getElementById('profileName');
    nameEl.innerHTML = user.name; 

    if (user.is_verified === true || user.is_verified === "true" || user.is_verified === 1) {
        nameEl.innerHTML += `
        <svg class="verified-tick" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: #1da1f2; margin-left: 8px; vertical-align: sub;">
            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.416-.166-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 2.049 1.43 3.81 3.35 4.327a4.56 4.56 0 00-.238 1.402c0 2.21 1.71 4 3.818 4 .47 0 .92-.084 1.336-.25.62 1.333 1.926 2.25 3.437 2.25s2.816-.917 3.437-2.25c.416.166.866.25 1.336.25 2.11 0 3.818-1.79 3.818-4 0-.495-.084-.965-.238-1.402 1.92-.517 3.35-2.278 3.35-4.327zM12 17.5l-4.5-4.5 1.414-1.414L12 14.672l7.086-7.086 1.414 1.414L12 17.5z"/>
        </svg>`;
    }

    // --- 2. MESLEK ve BİYOGRAFİ ---
    const jobHTML = user.job_title 
        ? `<div class="mb-2"><span class="badge bg-light text-dark border px-3 py-2" style="font-size: 0.9rem; letter-spacing: 0.5px;">${user.job_title}</span></div>` 
        : '';
        
    document.getElementById('profileAbout').innerHTML = jobHTML + (user.about_me || "Henüz bir biyografi eklenmemiş.");
    
    // --- 3. Profil Resmi ---
    const imgUrl = user.profileimageurl 
        ? (user.profileimageurl.startsWith('http') ? user.profileimageurl : `${API_URL}${user.profileimageurl}`)
        : 'https://via.placeholder.com/150';
    document.getElementById('profileImage').src = imgUrl;

    // --- 4. İstatistikler ---
    const followerEl = document.getElementById('followerCount');
    const followingEl = document.getElementById('followingCount');

    // ID vererek içindeki rakamı yakalayabilir hale getiriyoruz (h4 id="numFollowers")
    followerEl.innerHTML = `<h4 id="numFollowers" class="fw-bold mb-0" style="color: #A64D32;">${stats.followers}</h4><small class="text-muted">Takipçi</small>`;
    followingEl.innerHTML = `<h4 class="fw-bold mb-0" style="color: #A64D32;">${stats.following}</h4><small class="text-muted">Takip</small>`;

    followerEl.style.cursor = "pointer";
    followingEl.style.cursor = "pointer";
    followerEl.onclick = () => openConnectionsModal('followers');
    followingEl.onclick = () => openConnectionsModal('following');

    // --- 5. Butonlar (GÜNCELLENEN KISIM) ---
    const btnContainer = document.getElementById('profileActionBtn');
    
    if (isMe) {
        // Kendi profilimse
        btnContainer.innerHTML = `<a href="profile.html" class="btn btn-outline-secondary rounded-pill px-4 w-100">Profili Düzenle</a>`;
    } else {
        // Başkasının profiliyse (Gelişmiş Buton Yapısı)
        updateFollowButton(stats.isFollowing);
    }
}

/**
 * GÜNCELLENMİŞ BUTON YAPISI
 * Takip Et / Mesaj / Takipçiyi Çıkar
 */
function updateFollowButton(isFollowing) {
    const btnContainer = document.getElementById('profileActionBtn');
    
    // Takip Durumuna Göre Stil ve Metin
    const btnText = isFollowing ? "Takip Ediliyor" : "Takip Et";
    const btnClass = isFollowing ? "btn-secondary" : "btn-primary"; // btn-primary için stil aşağıda inline verilecek
    const btnStyle = isFollowing ? "" : "background-color: #A64D32; border:none;";

    const html = `
    <div class="d-flex flex-column gap-2 w-100 mt-2">
        <div class="d-flex gap-2">
            <button id="followActionBtn" onclick="handleFollowAction()" 
                class="btn ${btnClass} flex-grow-1 rounded-pill fw-bold transition-btn" 
                style="${btnStyle}">
                ${btnText}
            </button>

            <button id="removeFollowerBtn" onclick="handleRemoveFollower()" 
                class="btn btn-outline-danger rounded-circle shadow-sm d-flex align-items-center justify-content-center transition-btn" 
                style="width: 42px; height: 42px; min-width: 42px;" 
                title="Takipçiyi Çıkar" data-bs-toggle="tooltip">
                <i class="fa-solid fa-user-minus"></i>
            </button>
        </div>

        <button onclick="openMessageModal()" class="btn btn-outline-dark w-100 rounded-pill fw-bold transition-btn">
            <i class="fa-regular fa-paper-plane me-2"></i>Mesaj Gönder
        </button>
    </div>
    `;
    
    btnContainer.innerHTML = html;
}

/**
 * Takip Etme / Takipten Çıkma Mantığı (Matematiksel Güncelleme Dahil)
 */
async function handleFollowAction() {
    const btn = document.getElementById('followActionBtn');
    const countEl = document.getElementById('numFollowers');
    let currentCount = parseInt(countEl.innerText);

    // Basit dokunma efekti
    btn.style.transform = "scale(0.95)";
    setTimeout(() => btn.style.transform = "scale(1)", 150);

    const isFollowing = btn.innerText.includes("Takip Ediliyor");

    if (isFollowing) {
        // --- TAKİPTEN ÇIKMA ---
        if (confirm("Bu kullanıcıyı takipten çıkmak istediğinize emin misiniz?")) {
            // 1. UI Güncelle (Hızlı tepki)
            btn.innerText = "Takip Et";
            btn.className = "btn btn-primary flex-grow-1 rounded-pill fw-bold transition-btn";
            btn.style.backgroundColor = "#A64D32";
            btn.style.border = "none";
            btn.style.color = "white";
            
            // Rakamı düşür
            if (currentCount > 0) countEl.innerText = currentCount - 1;

            // 2. API İsteği
            await toggleFollowAPI(); 
        }
    } else {
        // --- TAKİP ETME ---
        // 1. UI Güncelle
        btn.innerText = "Takip Ediliyor";
        btn.className = "btn btn-secondary flex-grow-1 rounded-pill fw-bold transition-btn";
        btn.style.backgroundColor = ""; // Default gri
        btn.style.color = "";
        
        // Rakamı artır
        countEl.innerText = currentCount + 1;

        // 2. API İsteği
        await toggleFollowAPI();
    }
}

/**
 * Takipçiyi Çıkarma Mantığı
 */
function handleRemoveFollower() {
    if (confirm("Bu kişinin sizi takip etmesini engellemek istiyor musunuz?")) {
        const btn = document.getElementById('removeFollowerBtn');
        
        // Animasyonla yok et
        btn.style.transition = "all 0.3s ease";
        btn.style.transform = "scale(0) rotate(180deg)";
        btn.style.opacity = "0";

        setTimeout(() => {
            btn.remove(); // DOM'dan sil
            alert("Kişi takipçi listenizden çıkarıldı.");
            // Burada API isteği yapılabilir: /api/users/remove-follower
        }, 300);
    }
}

// API Çağrısı (Mevcut toggleFollow fonksiyonunun sadeleşmiş hali)
async function toggleFollowAPI() {
    const token = localStorage.getItem('token');
    try {
        await fetch(`${API_URL}/api/users/follow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ targetId: profileUserId })
        });
    } catch (err) { console.error(err); }
}

// --- Diğer Yardımcı Fonksiyonlar (Liste, Mesaj vb.) ---

async function openConnectionsModal(type) {
    const titleEl = document.getElementById('connectionsTitle');
    const listEl = document.getElementById('connectionsList');
    
    new bootstrap.Modal(document.getElementById('connectionsModal')).show();

    titleEl.innerText = type === 'followers' ? 'Takipçiler' : 'Takip Edilenler';
    listEl.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary spinner-border-sm"></div></div>';

    try {
        const res = await fetch(`${API_URL}/api/users/connections/${profileUserId}`);
        const data = await res.json();
        const userList = type === 'followers' ? data.followers : data.following;
        
        listEl.innerHTML = ''; 

        if (userList.length === 0) {
            listEl.innerHTML = '<div class="text-center p-3 text-muted small">Kimse yok.</div>';
            return;
        }

        userList.forEach(user => {
            const userImg = user.profileimageurl 
                ? (user.profileimageurl.startsWith('http') ? user.profileimageurl : `${API_URL}${user.profileimageurl}`)
                : 'https://via.placeholder.com/50';

            const item = document.createElement('a');
            item.href = `user-profile.html?id=${user.id}`;
            item.className = "list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 p-2";
            item.innerHTML = `
                <img src="${userImg}" class="rounded-circle object-fit-cover" width="40" height="40">
                <span class="fw-bold text-dark small">${user.name}</span>
            `;
            listEl.appendChild(item);
        });

    } catch (err) {
        listEl.innerHTML = '<div class="text-danger p-2 small">Liste yüklenemedi.</div>';
    }
}

function openMessageModal() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }
    new bootstrap.Modal(document.getElementById('messageModal')).show();
}

async function sendMessage() {
    const msgInput = document.getElementById('messageText');
    const msgText = msgInput.value.trim();
    const token = localStorage.getItem('token');

    if(!msgText) { alert("Lütfen bir mesaj yazın."); return; }

    try {
        const res = await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                receiver_id: profileUserId, 
                pet_id: 0, 
                post_type: 'direct', 
                message: msgText
            })
        });

        if(res.ok) {
            alert("Mesajınız iletildi! 📨");
            bootstrap.Modal.getInstance(document.getElementById('messageModal')).hide();
            msgInput.value = '';
        } else {
            const err = await res.json();
            alert("Hata: " + (err.message || "Mesaj gönderilemedi."));
        }
    } catch (e) {
        console.error(e);
        alert("Bağlantı hatası.");
    }
}

function renderTabs(listings) {
    const adoptList = document.getElementById('adoptList');
    const breedList = document.getElementById('breedList');

    if(adoptList) adoptList.innerHTML = '';
    if(breedList) breedList.innerHTML = '';

    const adoptAds = listings.filter(l => l.type === 'adoption');
    const breedAds = listings.filter(l => l.type === 'breeding');

    if(adoptList) {
        if(adoptAds.length === 0) adoptList.innerHTML = '<div class="text-center text-muted py-5">Henüz ilan yok.</div>';
        else adoptAds.forEach(pet => adoptList.innerHTML += createCard(pet, 'adoption'));
    }

    if(breedList) {
        if(breedAds.length === 0) breedList.innerHTML = '<div class="text-center text-muted py-5">Henüz ilan yok.</div>';
        else breedAds.forEach(pet => breedList.innerHTML += createCard(pet, 'breeding'));
    }
}

function createCard(pet, type) {
    const rawImg = pet.imageurl || pet.imageUrl;
    let imgUrl = 'https://via.placeholder.com/400x300';
    if(rawImg) imgUrl = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;
    
    const detailPage = type === 'adoption' ? 'pet-detail.html' : 'breeding-detail.html';

    return `
    <div class="col-md-6 col-lg-4">
        <div class="card h-100 border-0 shadow-sm">
            <img src="${imgUrl}" class="card-img-top" style="height: 200px; object-fit: cover;">
            <div class="card-body">
                <h5 class="card-title fw-bold">${pet.name}</h5>
                <p class="card-text text-muted small">${pet.species} • ${pet.gender}</p>
                <a href="${detailPage}?id=${pet.id}" class="btn btn-sm btn-outline-dark w-100 rounded-pill">İncele</a>
            </div>
        </div>
    </div>`;
}