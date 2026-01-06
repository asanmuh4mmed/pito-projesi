// --- js/user-profile.js (GÜNCEL - TAKİP LİSTESİ ÖZELLİKLİ) ---

const API_URL = 'https://pitopets.com'; 
let profileUserId = null;
let profileData = null; // Verileri burada tutacağız

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    // Eğer URL'de id varsa onu al, yoksa (kendi profilimse) localStorage'dan al
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (urlParams.get('id')) {
        profileUserId = urlParams.get('id');
    } else if (storedUser) {
        profileUserId = storedUser.id;
    } else {
        window.location.href = 'login.html'; // Giriş yoksa at
        return;
    }

    await loadUserProfile();
});

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_URL}/api/users/profile/${profileUserId}`, { headers });
        if (!res.ok) throw new Error("Profil yüklenemedi");

        const data = await res.json();
        profileData = data; // Veriyi global değişkene ata
        
        renderProfile(data);
        renderTabs(data.listings);

    } catch (err) {
        console.error(err);
        document.body.innerHTML = `<div class="alert alert-danger text-center m-5">Profil bulunamadı.</div>`;
    }
}

function renderProfile(data) {
    const user = data.user;
    const stats = data.stats;
    const isMe = isCurrentUser(user.id);

    // Resim ve İsim
    document.getElementById('profileName').innerText = user.name;
    document.getElementById('profileAbout').innerText = user.about_me || "Henüz bir biyografi eklenmemiş.";
    
    const imgUrl = user.profileimageurl 
        ? (user.profileimageurl.startsWith('http') ? user.profileimageurl : `${API_URL}${user.profileimageurl}`)
        : 'https://via.placeholder.com/150';
    document.getElementById('profileImage').src = imgUrl;

    // --- İSTATİSTİKLER (TIKLANABİLİR) ---
    // HTML'deki id'lerin 'followerCount' ve 'followingCount' olduğundan emin ol
    const followerEl = document.getElementById('followerCount');
    const followingEl = document.getElementById('followingCount');

    // Sayıları yaz ve Tıklama Özelliği Ekle
    followerEl.innerHTML = `<strong>${stats.followers}</strong><br><span class="small text-muted">Takipçi</span>`;
    followingEl.innerHTML = `<strong>${stats.following}</strong><br><span class="small text-muted">Takip</span>`;

    // Mouse ile üzerine gelince el işareti çıksın
    followerEl.style.cursor = "pointer";
    followingEl.style.cursor = "pointer";

    // Tıklayınca Modal Aç
    followerEl.onclick = () => openConnectionsModal('followers');
    followingEl.onclick = () => openConnectionsModal('following');


    // --- TAKİP ET BUTONU ---
    const actionBtnContainer = document.getElementById('profileActionBtn');
    if (isMe) {
        // Kendi profilimse "Profili Düzenle"
        actionBtnContainer.innerHTML = `<a href="settings.html" class="btn btn-outline-secondary rounded-pill px-4">Profili Düzenle</a>`;
    } else {
        // Başkasıysa "Takip Et" butonu
        updateFollowButton(stats.isFollowing);
    }
}

function updateFollowButton(isFollowing) {
    const btnContainer = document.getElementById('profileActionBtn');
    if (isFollowing) {
        btnContainer.innerHTML = `<button onclick="toggleFollow()" class="btn btn-secondary rounded-pill px-4">Takip Ediliyor</button>`;
    } else {
        btnContainer.innerHTML = `<button onclick="toggleFollow()" class="btn btn-primary rounded-pill px-4" style="background-color: #A64D32; border:none;">Takip Et</button>`;
    }
}

async function toggleFollow() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Takip etmek için giriş yapmalısınız.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/users/follow`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ targetId: profileUserId })
        });

        const result = await res.json();
        if (res.ok) {
            // Sayfayı yenilemeden sayıları güncellemek için tekrar veriyi çekiyoruz
            loadUserProfile(); 
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error(err);
    }
}

// --- POPUP (MODAL) İŞLEMLERİ ---
async function openConnectionsModal(type) {
    const titleEl = document.getElementById('connectionsTitle');
    const listEl = document.getElementById('connectionsList');
    
    // Modalı Aç
    const modal = new bootstrap.Modal(document.getElementById('connectionsModal'));
    modal.show();

    // Başlığı ve İçeriği Sıfırla
    titleEl.innerText = type === 'followers' ? 'Takipçiler' : 'Takip Edilenler';
    listEl.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary"></div></div>';

    try {
        // Listeyi Çek
        const res = await fetch(`${API_URL}/api/users/connections/${profileUserId}`);
        const data = await res.json();
        
        const userList = type === 'followers' ? data.followers : data.following;
        
        listEl.innerHTML = ''; // Spinner'ı temizle

        if (userList.length === 0) {
            listEl.innerHTML = '<div class="text-center p-3 text-muted">Kimse yok.</div>';
            return;
        }

        // Listeyi Oluştur
        userList.forEach(user => {
            const userImg = user.profileimageurl 
                ? (user.profileimageurl.startsWith('http') ? user.profileimageurl : `${API_URL}${user.profileimageurl}`)
                : 'https://via.placeholder.com/50';

            const item = document.createElement('a');
            item.href = `user-profile.html?id=${user.id}`; // Tıklayınca o kişinin profiline git
            item.className = "list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 p-2";
            item.style.backgroundColor = "transparent";
            
            item.innerHTML = `
                <img src="${userImg}" class="rounded-circle object-fit-cover" width="40" height="40">
                <span class="fw-bold text-dark">${user.name}</span>
            `;
            listEl.appendChild(item);
        });

    } catch (err) {
        console.error(err);
        listEl.innerHTML = '<div class="text-danger p-2">Liste yüklenemedi.</div>';
    }
}

function renderTabs(listings) {
    // İlanları listeleme fonksiyonu (Pets ve Breeding ilanlarını ayırıp gösterir)
    // Bu kısım senin mevcut tasarımına göre aynı kalabilir veya HTML yapına göre burayı düzenleyebiliriz.
    // Şimdilik boş bırakıyorum, senin mevcut listeleme kodun varsa buraya ekle.
}

function isCurrentUser(id) {
    const stored = JSON.parse(localStorage.getItem('user'));
    return stored && String(stored.id) === String(id);
}