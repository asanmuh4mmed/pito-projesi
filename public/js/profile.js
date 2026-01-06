// --- js/profile.js (GÜNCEL - BİLDİRİM SİSTEMİ DAHİL) ---

const API_URL = 'https://pitopets.com'; 
let currentDeleteId = null;
let currentDeleteType = null; 
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    setupEventListeners();

    try {
        // 1. Temel Bilgiler
        const userRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
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

        // 4. BİLDİRİMLERİ KONTROL ET (YENİ)
        await checkNotifications(token);

    } catch (error) {
        console.error("Yükleme Hatası:", error);
        localStorage.removeItem('token'); 
        window.location.href = 'login.html';
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

function updateProfileUI(user) {
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const phoneEl = document.getElementById('profilePhone');
    const imgEl = document.getElementById('displayProfileImg');

    if(nameEl) nameEl.innerText = user.name || "İsimsiz";
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

// +++ BİLDİRİM FONKSİYONLARI (YENİ) +++
let notificationsData = [];

async function checkNotifications(token) {
    try {
        const res = await fetch(`${API_URL}/api/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        notificationsData = data;

        // Okunmamış var mı?
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
    if(badge) badge.classList.add('d-none'); // Kırmızı noktayı gizle

    // Backend'e okundu bilgisi gönder
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
        
        const bgColor = notif.is_read ? 'bg-white' : 'bg-light'; // Okunmamışlar hafif gri
        
        // Tarih formatla
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
// +++++++++++++++++++++++++++++++++++++

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

// --- İLAN ÇEKME FONKSİYONLARI (KISA VERSİYONLAR) ---
// (Not: Yukarıdaki tam versiyonlarda yazdığım için burayı kısa geçiyorum, ama mantık aynı)

async function fetchMyPets(token, user) {
    // ... (Mevcut kodunun aynısı)
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
             // Bakıcı kartı özel olduğu için manuel ekliyorum
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
    // Genel Kart Oluşturucu
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

// Diğer Edit/Delete Modal Fonksiyonları Aynen Kalıyor (Zaten yukarıda tanımlı)
function openEditProfileModal() {
    if (!currentUser) return;
    document.getElementById('editName').value = currentUser.name || "";
    document.getElementById('editPhone').value = currentUser.phone || "";
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
    const file = document.getElementById('editImageFile').files[0];
    if (file) formData.append('newProfileImage', file);
    
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/auth/me`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
    if(res.ok) { alert("Güncellendi!"); window.location.reload(); }
}