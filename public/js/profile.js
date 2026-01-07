// --- js/profile.js (GÜNCEL - TOKEN KORUMALI + MAVİ TİK + MESLEK DAHİL) ---

const API_URL = 'https://pitopets.com'; 
let currentDeleteId = null;
let currentDeleteType = null; 
let currentUser = null;

// --- YENİ EKLENEN TOKEN ÇÖZÜCÜ ---
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}
// ----------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    // 1. Token Yoksa Giriş Ekranına At
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Token Bozuksa Temizle ve At (User objesine bağımlılığı kaldırdık)
    const payload = parseJwt(token);
    if (!payload) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        return;
    }

    setupEventListeners();

    try {
        // 3. Backend'den Güncel Veriyi Çek
        const userRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Eğer token süresi dolmuşsa (401/403) çıkış yaptır
        if (userRes.status === 401 || userRes.status === 403) {
            throw new Error("Oturum süresi doldu");
        }

        if (!userRes.ok) throw new Error("Oturum hatası");

        currentUser = await userRes.json();
        updateProfileUI(currentUser);

        // 2. İstatistikler
        await fetchUserStats(token, currentUser);

        // 3. İlanlar
        await fetchMyPets(token, currentUser);
        await fetchMyBreedingAds(token, currentUser); 
        await fetchMyCaretakers(token, currentUser);
        await fetchMyVets(token, currentUser);

        // 4. BİLDİRİMLERİ KONTROL ET
        await checkNotifications(token);

    } catch (error) {
        console.error("Yükleme Hatası:", error);
        
        // Sadece kritik oturum hatalarında çıkış yap
        if (error.message === "Oturum süresi doldu") {
            localStorage.removeItem('token'); 
            window.location.href = 'login.html';
        }
    }
});

function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    const editBtn = document.getElementById('btnOpenEditProfile');
    const editForm = document.getElementById('editProfileForm');
    const deleteBtn = document.getElementById('confirmDeleteBtn');
    const fileInput = document.getElementById('editImageFile');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm("Çıkış yapmak istediğinize emin misiniz?")) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            }
        });
    }

    if (editBtn) editBtn.addEventListener('click', openEditProfileModal);
    if (editForm) editForm.addEventListener('submit', handleProfileUpdate);
    if (deleteBtn) deleteBtn.addEventListener('click', handleConfirmDelete);

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.getElementById('imagePreview');
                    const container = document.getElementById('imagePreviewContainer');
                    if(preview) preview.src = e.target.result;
                    if(container) container.classList.remove('d-none');
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

// --- GÜNCELLENEN updateProfileUI FONKSİYONU ---
function updateProfileUI(user) {
    // Dedektif Kodu (İstersen silebilirsin)
    console.log("--------------------------------");
    console.log("Profil Verisi Yüklendi:", user);
    console.log("Meslek:", user.job_title); 
    console.log("--------------------------------");

    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const phoneEl = document.getElementById('profilePhone');
    const imgEl = document.getElementById('displayProfileImg');
    const jobEl = document.getElementById('profileJob');

    // Mavi Tik SVG İkonu
    const verifiedIconSVG = `
    <svg class="verified-tick" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: #1da1f2; margin-left: 8px; vertical-align: middle;">
        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.416-.166-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 2.049 1.43 3.81 3.35 4.327a4.56 4.56 0 00-.238 1.402c0 2.21 1.71 4 3.818 4 .47 0 .92-.084 1.336-.25.62 1.333 1.926 2.25 3.437 2.25s2.816-.917 3.437-2.25c.416.166.866.25 1.336.25 2.11 0 3.818-1.79 3.818-4 0-.495-.084-.965-.238-1.402 1.92-.517 3.35-2.278 3.35-4.327zM12 17.5l-4.5-4.5 1.414-1.414L12 14.672l7.086-7.086 1.414 1.414L12 17.5z"/>
    </svg>`;

    if(nameEl) {
        nameEl.innerHTML = user.name || "İsimsiz";
        
        // Mavi Tik Kontrolü
        if (user.is_verified === true || user.is_verified === "true" || user.is_verified === 1) {
            nameEl.innerHTML += verifiedIconSVG;
        }
    }

    // Meslek Bilgisini Yazdır
    if (jobEl) {
        jobEl.innerText = user.job_title || ""; 
    }

    if(emailEl) emailEl.innerText = user.email || "";
    if(phoneEl) phoneEl.innerText = user.phone || "";

    if (imgEl) {
        const rawImg = user.profileimageurl || user.profileImageUrl;
        if (rawImg) {
            const finalUrl = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;
            imgEl.src = finalUrl;
        } else {
            imgEl.src = "https://via.placeholder.com/150?text=Profil";
        }
    }
}

// +++ BİLDİRİM FONKSİYONLARI +++
let notificationsData = [];

async function checkNotifications(token) {
    try {
        const res = await fetch(`${API_URL}/api/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        notificationsData = data;

        const hasUnread = data.some(n => !n.is_read);
        const badge = document.getElementById('notificationBadge');
        
        if (hasUnread && badge) {
            badge.classList.remove('d-none');
        } else if (badge) {
            badge.classList.add('d-none');
        }

    } catch (err) { console.error(err); }
}

window.openNotificationsModal = async function() {
    const modalEl = document.getElementById('notificationsModal');
    const listEl = document.getElementById('notificationsList');
    const badge = document.getElementById('notificationBadge');

    new bootstrap.Modal(modalEl).show();
    if(badge) badge.classList.add('d-none');

    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/notifications/read`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }});

    listEl.innerHTML = '';

    if (notificationsData.length === 0) {
        listEl.innerHTML = '<div class="text-center p-3 text-muted small">Bildirim yok.</div>';
        return;
    }

    notificationsData.forEach(notif => {
        const img = notif.sender_image 
            ? (notif.sender_image.startsWith('http') ? notif.sender_image : `${API_URL}${notif.sender_image}`)
            : 'https://via.placeholder.com/50';
        
        const bgColor = notif.is_read ? 'bg-white' : 'bg-light';
        const date = new Date(notif.created_at).toLocaleDateString('tr-TR', {day:'numeric', month:'short'});

        listEl.innerHTML += `
            <a href="user-profile.html?id=${notif.sender_id}" class="list-group-item list-group-item-action border-0 mb-1 rounded-3 ${bgColor} p-3">
                <div class="d-flex align-items-center gap-3">
                    <img src="${img}" class="rounded-circle" width="40" height="40" style="object-fit:cover;">
                    <div class="flex-grow-1">
                        <p class="mb-0 small text-dark">
                            <span class="fw-bold">${notif.sender_name}</span> ${notif.message}
                        </p>
                        <small class="text-muted" style="font-size: 0.7rem;">${date}</small>
                    </div>
                    ${!notif.is_read ? '<span class="badge bg-danger rounded-circle p-1"> </span>' : ''}
                </div>
            </a>
        `;
    });
}

async function fetchUserStats(token, user) {
    try {
        const res = await fetch(`${API_URL}/api/users/profile/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        const followerEl = document.getElementById('myFollowerCount');
        const followingEl = document.getElementById('myFollowingCount');

        if(followerEl && data.stats) {
            followerEl.querySelector('h5').innerText = data.stats.followers;
            followerEl.onclick = () => openConnectionsModal('followers');
        }

        if(followingEl && data.stats) {
            followingEl.querySelector('h5').innerText = data.stats.following;
            followingEl.onclick = () => openConnectionsModal('following');
        }
    } catch (err) { console.error("İstatistik Hatası:", err); }
}

async function openConnectionsModal(type) {
    const titleEl = document.getElementById('connectionsTitle');
    const listEl = document.getElementById('connectionsList');
    
    new bootstrap.Modal(document.getElementById('connectionsModal')).show();

    titleEl.innerText = type === 'followers' ? 'Takipçilerim' : 'Takip Ettiklerim';
    listEl.innerHTML = '<div class="text-center p-3"><div class="spinner-border text-primary spinner-border-sm"></div></div>';

    try {
        const res = await fetch(`${API_URL}/api/users/connections/${currentUser.id}`);
        const data = await res.json();
        const userList = type === 'followers' ? data.followers : data.following;
        
        listEl.innerHTML = ''; 
        if (userList.length === 0) {
            listEl.innerHTML = '<div class="text-center p-3 text-muted small">Listeniz boş.</div>';
            return;
        }

        userList.forEach(u => {
            const userImg = u.profileimageurl 
                ? (u.profileimageurl.startsWith('http') ? u.profileimageurl : `${API_URL}${u.profileimageurl}`)
                : 'https://via.placeholder.com/50';

            listEl.innerHTML += `
                <a href="user-profile.html?id=${u.id}" class="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 p-2">
                    <img src="${userImg}" class="rounded-circle object-fit-cover" width="40" height="40">
                    <span class="fw-bold text-dark small">${u.name}</span>
                </a>
            `;
        });
    } catch (err) { listEl.innerHTML = '<div class="text-danger p-2 small">Hata.</div>'; }
}

async function fetchMyPets(token, user) {
    const container = document.getElementById('myAdsContainer');
    if (!container) return;
    try {
        const res = await fetch(`${API_URL}/api/pets`);
        const allPets = await res.json();
        const myPets = allPets.filter(pet => String(pet.user_id) === String(user.id));
        if(document.getElementById('adCount')) document.getElementById('adCount').innerText = myPets.length;
        container.innerHTML = ""; 
        if (myPets.length === 0) container.innerHTML = `<div class="col-12 text-center text-muted py-3">Henüz ilan yok.</div>`;
        myPets.forEach(pet => {
             const rawImg = pet.imageurl || pet.imageUrl;
             let imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`) : 'https://via.placeholder.com/600';
             container.innerHTML += createCardHTML(pet, imgUrl, 'pet', 'pet-detail.html', pet.adoptionstatus === 'Sahiplendirildi' ? '<span class="badge bg-secondary absolute-badge">Yuva Buldu</span>' : '');
        });
    } catch (e) { console.error(e); }
}

async function fetchMyBreedingAds(token, user) {
    const container = document.getElementById('myBreedingContainer');
    if (!container) return;
    try {
        const res = await fetch(`${API_URL}/api/breeding-pets`);
        const myAds = (await res.json()).filter(ad => String(ad.user_id) === String(user.id));
        container.innerHTML = "";
        if (myAds.length === 0) container.innerHTML = `<div class="col-12 text-center text-muted py-3">İlan yok.</div>`;
        myAds.forEach(ad => {
             const rawImg = ad.imageurl || ad.imageUrl;
             let imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`) : 'https://via.placeholder.com/600';
             container.innerHTML += createCardHTML(ad, imgUrl, 'breeding', 'breeding-detail.html', '<span class="badge bg-danger absolute-badge"><i class="fa-solid fa-heart"></i></span>');
        });
    } catch (e) { console.error(e); }
}

async function fetchMyCaretakers(token, user) {
    const container = document.getElementById('myCaretakersContainer');
    if (!container) return;
    try {
        const res = await fetch(`${API_URL}/api/caretakers`);
        const myData = (await res.json()).filter(c => String(c.user_id) === String(user.id));
        container.innerHTML = "";
        if (myData.length === 0) container.innerHTML = `<div class="col-12 text-center text-muted py-3">İlan yok.</div>`;
        myData.forEach(item => {
             const rawImg = item.imageurl || item.imageUrl;
             let imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`) : 'https://via.placeholder.com/600';
             container.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0 border-warning overflow-hidden">
                    <img src="${imgUrl}" class="card-img-top" style="height: 150px; object-fit: cover;">
                    <div class="card-body">
                        <h6 class="fw-bold text-truncate" style="color: #3E2723;">${item.title}</h6>
                        <p class="fw-bold" style="color:#A64D32">${item.price} ₺</p>
                        <div class="d-flex justify-content-between mt-2 gap-2">
                             <a href="caretakers.html" class="btn btn-sm btn-outline-primary rounded-pill px-3 flex-grow-1">Gör</a>
                            <button onclick="openDeleteModal(${item.id}, 'caretaker')" class="btn btn-sm btn-outline-danger px-3"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    } catch (e) { console.error(e); }
}

async function fetchMyVets(token, user) {
     const container = document.getElementById('myVetsContainer');
    if (!container) return;
    try {
        const res = await fetch(`${API_URL}/api/vets`);
        const myData = (await res.json()).filter(v => String(v.user_id) === String(user.id));
        container.innerHTML = "";
        if (myData.length === 0) container.innerHTML = `<div class="col-12 text-center text-muted py-3">İlan yok.</div>`;
        myData.forEach(item => {
             const rawImg = item.imageurl || item.imageUrl;
             let imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`) : 'https://images.pexels.com/photos/6235231/pexels-photo-6235231.jpeg';
             container.innerHTML += createCardHTML(item, imgUrl, 'vet', 'vets.html', '');
        });
    } catch (e) { console.error(e); }
}

function createCardHTML(item, imgUrl, type, link, badge) {
    let title = item.name || item.clinicName || item.clinicname;
    let subtitle = item.species ? `${item.species} • ${item.age} Yaş` : (item.vetname || item.vetName || '');
    
    return `
    <div class="col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm border-0 position-relative overflow-hidden">
            ${badge}
            <img src="${imgUrl}" class="card-img-top" style="height: 200px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/600?text=Hata'">
            <div class="card-body">
                <h5 class="fw-bold text-truncate" style="color: #A64D32;">${title}</h5>
                <p class="text-muted small">${subtitle}</p>
                <div class="d-flex justify-content-between mt-3 gap-2">
                    <a href="${link}?id=${item.id}" class="btn btn-sm btn-outline-primary rounded-pill px-3 flex-grow-1" style="border-color: #A64D32; color: #A64D32;">Gör</a>
                    <button onclick="openDeleteModal(${item.id}, '${type}')" class="btn btn-sm btn-outline-danger rounded-pill px-3">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

function openEditProfileModal() {
    if (!currentUser) return;
    document.getElementById('editName').value = currentUser.name || "";
    document.getElementById('editPhone').value = currentUser.phone || "";
    
    const jobInput = document.getElementById('editJob');
    if (jobInput) {
        jobInput.value = currentUser.job_title || "";
    }
    
    new bootstrap.Modal(document.getElementById('editProfileModal')).show();
}

window.openDeleteModal = function(id, type) {
    currentDeleteId = id; currentDeleteType = type; 
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

async function handleConfirmDelete() {
    if (!currentDeleteId) return;
    const token = localStorage.getItem('token');
    let ep = currentDeleteType === 'pet' ? 'pets' : (currentDeleteType === 'breeding' ? 'breeding-pets' : (currentDeleteType === 'vet' ? 'vets' : 'caretakers'));
    try {
        const res = await fetch(`${API_URL}/api/${ep}/${currentDeleteId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if(res.ok) { alert("Silindi."); window.location.reload(); }
        else alert("Hata.");
    } catch(e) { alert("Sunucu hatası."); }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('editName').value);
    formData.append('phone', document.getElementById('editPhone').value);
    
    const jobInput = document.getElementById('editJob');
    if (jobInput) {
        formData.append('job_title', jobInput.value);
    }

    const file = document.getElementById('editImageFile').files[0];
    if (file) formData.append('newProfileImage', file);
    
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/auth/me`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
    if(res.ok) { alert("Güncellendi!"); window.location.reload(); }
}