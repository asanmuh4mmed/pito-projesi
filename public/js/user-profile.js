// --- js/user-profile.js (MESAJLAŞMA EKLENDİ) ---

const API_URL = 'https://pitopets.com'; 
let profileUserId = null;
let profileData = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (urlParams.get('id')) {
        profileUserId = urlParams.get('id');
    } else if (storedUser) {
        profileUserId = storedUser.id;
    } else {
        window.location.href = 'login.html'; 
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
        profileData = data; 
        
        renderProfile(data);
        renderTabs(data.listings);

    } catch (err) {
        console.error(err);
        document.body.innerHTML = `<div class="alert alert-danger text-center m-5">Kullanıcı bulunamadı veya profil gizli.</div>`;
    }
}

function renderProfile(data) {
    const user = data.user;
    const stats = data.stats;
    const isMe = isCurrentUser(user.id);

    // Temel Bilgiler
    document.getElementById('profileName').innerText = user.name;
    document.getElementById('profileAbout').innerText = user.about_me || "Henüz bir biyografi eklenmemiş.";
    
    const imgUrl = user.profileimageurl 
        ? (user.profileimageurl.startsWith('http') ? user.profileimageurl : `${API_URL}${user.profileimageurl}`)
        : 'https://via.placeholder.com/150';
    document.getElementById('profileImage').src = imgUrl;

    // İstatistikler
    const followerEl = document.getElementById('followerCount');
    const followingEl = document.getElementById('followingCount');

    followerEl.innerHTML = `
        <h4 class="fw-bold mb-0" style="color: #A64D32;">${stats.followers}</h4>
        <small class="text-muted">Takipçi</small>
    `;
    followingEl.innerHTML = `
        <h4 class="fw-bold mb-0" style="color: #A64D32;">${stats.following}</h4>
        <small class="text-muted">Takip</small>
    `;

    followerEl.style.cursor = "pointer";
    followingEl.style.cursor = "pointer";
    followerEl.onclick = () => openConnectionsModal('followers');
    followingEl.onclick = () => openConnectionsModal('following');

    // --- BUTON AYARLARI ---
    const btnContainer = document.getElementById('profileActionBtn');
    if (isMe) {
        btnContainer.innerHTML = `<a href="settings.html" class="btn btn-outline-secondary rounded-pill px-4">Profili Düzenle</a>`;
    } else {
        // Başkasıysa Takip + Mesaj butonlarını göster
        updateFollowButton(stats.isFollowing);
    }
}

// +++ BUTONLARI GÜNCELLEME (TAKİP + MESAJ) +++
function updateFollowButton(isFollowing) {
    const btnContainer = document.getElementById('profileActionBtn');
    let followBtnHTML = '';

    if (isFollowing) {
        followBtnHTML = `<button onclick="toggleFollow()" class="btn btn-secondary rounded-pill px-4 me-2">Takip Ediliyor</button>`;
    } else {
        followBtnHTML = `<button onclick="toggleFollow()" class="btn btn-primary rounded-pill px-4 me-2" style="background-color: #A64D32; border:none;">Takip Et</button>`;
    }

    // Mesaj Butonunu Ekle
    const msgBtnHTML = `<button onclick="openMessageModal()" class="btn btn-outline-dark rounded-pill px-4"><i class="fa-regular fa-paper-plane me-2"></i>Mesaj</button>`;

    btnContainer.innerHTML = followBtnHTML + msgBtnHTML;
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
            loadUserProfile(); // Verileri güncelle
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

// +++ YENİ: MESAJLAŞMA FONKSİYONLARI +++
function openMessageModal() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Mesaj göndermek için giriş yapmalısınız.");
        return;
    }
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
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                receiver_id: profileUserId, 
                pet_id: 0, // Genel mesaj (Pet ID yok)
                post_type: 'direct', 
                message: msgText
            })
        });

        if(res.ok) {
            alert("Mesajınız iletildi! 📨");
            const modalEl = document.getElementById('messageModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
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
// +++++++++++++++++++++++++++++++++++++

function renderTabs(listings) {
    const adoptList = document.getElementById('adoptList');
    const breedList = document.getElementById('breedList');

    adoptList.innerHTML = '';
    breedList.innerHTML = '';

    const adoptAds = listings.filter(l => l.type === 'adoption');
    const breedAds = listings.filter(l => l.type === 'breeding');

    if(adoptAds.length === 0) adoptList.innerHTML = '<div class="text-center text-muted py-5">Henüz ilan yok.</div>';
    else adoptAds.forEach(pet => adoptList.innerHTML += createCard(pet, 'adoption'));

    if(breedAds.length === 0) breedList.innerHTML = '<div class="text-center text-muted py-5">Henüz ilan yok.</div>';
    else breedAds.forEach(pet => breedList.innerHTML += createCard(pet, 'breeding'));
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

function isCurrentUser(id) {
    const stored = JSON.parse(localStorage.getItem('user'));
    return stored && String(stored.id) === String(id);
}