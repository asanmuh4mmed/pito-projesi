// --- js/index.js (BEĞENİ SİSTEMİ ENTEGRELİ) ---

const API_URL = 'https://pito-projesi.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar(); // Navbarı güncelle
    loadShowcase(); // Vitrinleri doldur
    checkGlobalUnreadMessages(); // Bildirim kontrolü
    setInterval(checkGlobalUnreadMessages, 5000); // 5 saniyede bir bildirim tazele
});

// --- NAVBAR GÜNCELLEME ---
function updateNavbar() {
    const token = localStorage.getItem('token');
    const navbarList = document.querySelector('.navbar-nav');
    if (!navbarList) return;

    const commonLinks = `
        <li class="nav-item"><a class="nav-link active" href="index.html">Ana Sayfa</a></li>
        <li class="nav-item"><a class="nav-link" href="about.html">Hakkımızda</a></li>
        <li class="nav-item"><a class="nav-link" href="vets.html">Veterinerler</a></li>
        <li class="nav-item"><a class="nav-link" href="breeding.html">Eş Bul</a></li>
        <li class="nav-item"><a class="nav-link" href="pets.html">Sahiplen</a></li>
        <li class="nav-item"><a class="nav-link" href="caretakers.html">Bakıcılar</a></li>
    `;

    if (token) {
        navbarList.innerHTML = `
            ${commonLinks}
            <li class="nav-item position-relative">
                <a class="nav-link fw-bold" href="messages.html">Mesajlar</a>
                <span id="navMsgBadge" class="notification-dot d-none" style="position: absolute; top: 0; right: 0; width: 10px; height: 10px; background: red; border-radius: 50%;"></span>
            </li>
            <li class="nav-item"><a class="nav-link fw-bold" href="profile.html" style="color: #A64D32;">Profilim</a></li>
            <li class="nav-item ms-2"><button onclick="logout()" class="btn btn-sm btn-outline-danger rounded-pill px-3 mt-1">Çıkış</button></li>
        `;
    } else {
        navbarList.innerHTML = `
            ${commonLinks}
            <li class="nav-item ms-2"><a class="btn btn-sm btn-outline-primary rounded-pill px-3 mt-1" href="login.html">Giriş Yap</a></li>
            <li class="nav-item ms-1"><a class="btn btn-sm btn-primary rounded-pill px-3 mt-1 text-white" href="register.html">Kayıt Ol</a></li>
        `;
    }
}

// --- VİTRİN YÜKLEME ---
async function loadShowcase() {
    const adoptionContainer = document.getElementById('adoptionContainer');
    const breedingContainer = document.getElementById('breedingContainer');
    const caretakersContainer = document.getElementById('caretakersShowcase');
    const vetsContainer = document.getElementById('vetsShowcase');
    
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    try {
        if(adoptionContainer) {
            const res = await fetch(`${API_URL}/api/pets`, { headers });
            const data = await res.json();
            const adoptionPets = data.filter(p => p.tur === 'Sahiplendirme' || !p.tur);
            renderPets(adoptionPets.slice(0, 3), adoptionContainer, 'adoption');
        }

        if(breedingContainer) {
            const res = await fetch(`${API_URL}/api/breeding-pets`, { headers });
            const data = await res.json();
            renderPets(data.slice(0, 3), breedingContainer, 'breeding');
        }

        if(caretakersContainer) {
            const res = await fetch(`${API_URL}/api/caretakers`);
            const data = await res.json();
            renderCaretakers(data.slice(0, 3), caretakersContainer);
        }

        if(vetsContainer) {
            const res = await fetch(`${API_URL}/api/vets`);
            const data = await res.json();
            renderVets(data.slice(0, 3), vetsContainer);
        }
    } catch (error) { console.error("Vitrin Hatası:", error); }
}

// --- KONUM AYIKLAMA YARDIMCISI ---
function getLocationFromText(pet) {
    let locationText = "Konum Yok";
    const sourceText = pet.location || pet.description || pet.story || "";
    if (pet.location) {
        locationText = pet.location;
    } else if (sourceText.includes('[Konum:')) {
        const match = sourceText.match(/\[Konum:\s*(.*?)\]/);
        if (match && match[1]) locationText = match[1];
    }
    return locationText;
}

// --- KALP (BEĞENİ) FONKSİYONU ---
async function toggleLike(btn, postId, postType) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Beğenmek için giriş yapmalısınız! 🐾");
        window.location.href = 'login.html';
        return;
    }

    const icon = btn.querySelector('i');
    const countBadge = document.getElementById(`like-count-${postType}-${postId}`);
    let currentCount = parseInt(countBadge.innerText) || 0;

    // Optimistic UI: Anında değişim
    const isLiking = icon.classList.contains('fa-regular'); 
    if (isLiking) {
        icon.classList.replace('fa-regular', 'fa-solid');
        icon.style.color = '#e91e63';
        countBadge.innerText = currentCount + 1;
    } else {
        icon.classList.replace('fa-solid', 'fa-regular');
        icon.style.color = '#ccc';
        countBadge.innerText = Math.max(0, currentCount - 1);
    }

    try {
        const res = await fetch(`${API_URL}/api/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ post_id: postId, post_type: postType })
        });
        if (!res.ok) throw new Error();
    } catch (err) {
        // Hata olursa geri al
        loadShowcase(); 
    }
}

// --- PET KART RENDER (BEĞENİ DAHİL) ---
function renderPets(pets, container, type) {
    container.innerHTML = '';
    if (!pets || pets.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">İlan bulunamadı.</div>';
        return;
    }

    pets.forEach(pet => {
        const rawImg = pet.imageurl || pet.imageUrl;
        let imgUrl = 'https://via.placeholder.com/300x200?text=Resim+Yok';
        if (rawImg) imgUrl = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;

        const locationText = getLocationFromText(pet);
        const isLiked = pet.is_liked === true || pet.is_liked > 0;
        const heartClass = isLiked ? 'fa-solid' : 'fa-regular';
        const heartColor = isLiked ? '#e91e63' : '#ccc';
        const likeCount = pet.like_count || 0;

        let badge = type === 'breeding' 
            ? '<span class="badge bg-danger position-absolute top-0 start-0 m-2"><i class="fa-solid fa-heart"></i> Eş Arıyor</span>'
            : '<span class="badge bg-primary position-absolute top-0 start-0 m-2"><i class="fa-solid fa-home"></i> Yuva Arıyor</span>';
            
        let link = type === 'breeding' ? `breeding-detail.html?id=${pet.id}` : `pet-detail.html?id=${pet.id}&type=adoption`;

        container.innerHTML += `
        <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm overflow-hidden card-hover-effect position-relative">
                <div class="position-relative">
                    ${badge}
                    <div class="position-absolute top-0 end-0 m-2 text-center" style="z-index: 5;">
                        <button onclick="toggleLike(this, ${pet.id}, '${type}')" class="btn btn-light rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" style="width:35px; height:35px; border:none;">
                            <i class="${heartClass} fa-heart" style="color: ${heartColor}; font-size: 1.2rem;"></i>
                        </button>
                        <span id="like-count-${type}-${pet.id}" class="badge bg-white text-dark mt-1 shadow-sm">${likeCount}</span>
                    </div>
                    <img src="${imgUrl}" class="card-img-top" style="height: 250px; object-fit: cover;">
                </div>
                <div class="card-body text-center">
                    <h5 class="fw-bold text-dark-brown">${pet.name}</h5>
                    <p class="text-muted small mb-2">${pet.species} • ${pet.age} Yaş</p>
                    <div class="small text-danger fw-bold mb-3">
                        <i class="fa-solid fa-location-dot me-1"></i> ${locationText}
                    </div>
                    <a href="${link}" class="btn btn-sm btn-outline-dark rounded-pill px-4">İncele</a>
                </div>
            </div>
        </div>`;
    });
}

// --- CARETAKER RENDER ---
function renderCaretakers(data, container) {
    container.innerHTML = '';
    if (!data || data.length === 0) return;
    data.forEach(item => {
        const rawImg = item.imageurl || item.imageUrl;
        let imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`) : 'https://via.placeholder.com/300x200?text=Bakici';
        container.innerHTML += `
        <div class="col-md-4"><div class="card h-100 border-0 shadow-sm overflow-hidden card-hover-effect">
            <div class="position-relative">
                <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2 fw-bold">${item.price} ₺ / Gün</span>
                <img src="${imgUrl}" class="card-img-top" style="height: 250px; object-fit: cover;">
            </div>
            <div class="card-body"><h6 class="fw-bold text-dark-brown text-truncate">${item.title || item.name}</h6>
                <div class="d-flex justify-content-between small text-muted mb-3">
                    <span><i class="fa-solid fa-star text-warning"></i> ${item.experience} Yıl</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${item.location || 'Konum Yok'}</span>
                </div>
                <a href="caretakers.html" class="btn btn-sm btn-outline-warning w-100 rounded-pill text-dark fw-bold">Profili Gör</a>
            </div>
        </div></div>`;
    });
}

// --- VET RENDER ---
function renderVets(data, container) {
    container.innerHTML = '';
    if (!data || data.length === 0) return;
    data.forEach(item => {
        const rawImg = item.imageurl || item.imageUrl;
        let imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`) : 'https://images.pexels.com/photos/6235231/pexels-photo-6235231.jpeg';
        container.innerHTML += `
        <div class="col-md-4"><div class="card h-100 border-0 shadow-sm overflow-hidden card-hover-effect">
            <div class="position-relative"><span class="badge bg-white text-dark position-absolute top-0 end-0 m-2 shadow-sm"><i class="fa-solid fa-location-dot text-danger"></i> ${item.city || 'Konum Yok'}</span>
                <img src="${imgUrl}" class="card-img-top" style="height: 250px; object-fit: cover;">
            </div>
            <div class="card-body text-center"><h6 class="fw-bold text-dark-brown text-truncate">${item.clinicname || item.clinicName || "Klinik"}</h6>
                <p class="small text-muted mb-3"><i class="fa-solid fa-user-doctor me-1"></i> ${item.vetname || item.vetName}</p>
                <a href="vets.html" class="btn btn-sm btn-outline-danger w-100 rounded-pill" style="border-color:#A64D32; color:#A64D32;">Detaylar</a>
            </div>
        </div></div>`;
    });
}

// --- MESAJ BİLDİRİM KONTROLÜ ---
async function checkGlobalUnreadMessages() {
    const token = localStorage.getItem('token');
    const badge = document.getElementById('navMsgBadge');
    if (!token || !badge) return;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const myId = payload.id;
        const response = await fetch(`${API_URL}/api/my-messages`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) {
            const messages = await response.json();
            const hasUnread = messages.some(m => m.receiver_id === myId && m.is_read === false);
            hasUnread ? badge.classList.remove('d-none') : badge.classList.add('d-none');
        }
    } catch (e) { console.log("Bildirim hatası."); }
}

window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}