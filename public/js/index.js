// --- js/index.js (GÜNCELLENMİŞ VERSİYON) ---

const API_URL = 'https://pito-projesi.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar(); // Navbarı güncelle
    loadShowcase(); // Vitrinleri doldur
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
        // Giriş Yapmış
        navbarList.innerHTML = `
            ${commonLinks}
            <li class="nav-item"><a class="nav-link fw-bold" href="messages.html">Mesajlar</a></li>
            <li class="nav-item"><a class="nav-link fw-bold" href="profile.html" style="color: #A64D32;">Profilim</a></li>
            <li class="nav-item ms-2"><button onclick="logout()" class="btn btn-sm btn-outline-danger rounded-pill px-3 mt-1">Çıkış</button></li>
        `;
    } else {
        // Misafir
        navbarList.innerHTML = `
            ${commonLinks}
            <li class="nav-item ms-2"><a class="btn btn-sm btn-outline-primary rounded-pill px-3 mt-1" href="login.html">Giriş Yap</a></li>
            <li class="nav-item ms-1"><a class="btn btn-sm btn-primary rounded-pill px-3 mt-1 text-white" href="register.html">Kayıt Ol</a></li>
        `;
    }
}

// --- VİTRİN YÜKLEME (TÜM KATEGORİLER) ---
async function loadShowcase() {
    const adoptionContainer = document.getElementById('adoptionContainer');
    const breedingContainer = document.getElementById('breedingContainer');
    const caretakersContainer = document.getElementById('caretakersShowcase');
    const vetsContainer = document.getElementById('vetsShowcase');

    try {
        // 1. SAHİPLENDİRME (İlk 3)
        if(adoptionContainer) {
            const res = await fetch(`${API_URL}/api/pets`);
            const data = await res.json();
            // Sadece sahiplendirme olanları filtrele
            const adoptionPets = data.filter(p => p.tur === 'Sahiplendirme' || !p.tur);
            renderPets(adoptionPets.slice(0, 3), adoptionContainer, 'adoption');
        }

        // 2. EŞ BULMA (İlk 3)
        if(breedingContainer) {
            const res = await fetch(`${API_URL}/api/breeding-pets`);
            const data = await res.json();
            renderPets(data.slice(0, 3), breedingContainer, 'breeding');
        }

        // 3. BAKICILAR (İlk 3)
        if(caretakersContainer) {
            const res = await fetch(`${API_URL}/api/caretakers`);
            const data = await res.json();
            renderCaretakers(data.slice(0, 3), caretakersContainer);
        }

        // 4. VETERİNERLER (İlk 3)
        if(vetsContainer) {
            const res = await fetch(`${API_URL}/api/vets`);
            const data = await res.json();
            renderVets(data.slice(0, 3), vetsContainer);
        }

    } catch (error) {
        console.error("Vitrin Hatası:", error);
    }
}

// --- KART OLUŞTURUCU FONKSİYONLAR ---

// 1. Evcil Hayvan Kartları (Sahiplendirme & Eş Bulma) - KONUM EKLENDİ
function renderPets(pets, container, type) {
    container.innerHTML = '';
    if (!pets || pets.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">İlan bulunamadı.</div>';
        return;
    }

    pets.forEach(pet => {
        // Resim Kontrolü
        const rawImg = pet.imageurl || pet.imageUrl;
        let imgUrl = 'https://via.placeholder.com/300x200?text=Resim+Yok';
        if (rawImg) imgUrl = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;

        // Konum Bilgisi Ayıklama (YENİ)
        let locationText = "Konum Yok";
        // Eş Bulma için 'description' veya 'location' sütunu
        // Sahiplendirme için 'story' veya 'location' sütunu
        const sourceText = pet.location || pet.description || pet.story || "";
        
        // Eğer location sütunu temiz geliyorsa kullan
        if (pet.location) {
            locationText = pet.location;
        } 
        // Yoksa metin içinden ayıkla: [Konum: İstanbul]
        else if (sourceText.includes('[Konum:')) {
            const match = sourceText.match(/\[Konum:\s*(.*?)\]/);
            if (match && match[1]) {
                locationText = match[1];
            }
        }

        let badge = type === 'breeding' 
            ? '<span class="badge bg-danger position-absolute top-0 start-0 m-2"><i class="fa-solid fa-heart"></i> Eş Arıyor</span>'
            : '<span class="badge bg-primary position-absolute top-0 start-0 m-2"><i class="fa-solid fa-home"></i> Yuva Arıyor</span>';
            
        let link = type === 'breeding' 
            ? `breeding-detail.html?id=${pet.id}` 
            : `pet-detail.html?id=${pet.id}&type=adoption`;

        container.innerHTML += `
        <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm overflow-hidden card-hover-effect">
                <div class="position-relative">
                    ${badge}
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

// 2. Bakıcı Kartları
function renderCaretakers(data, container) {
    container.innerHTML = '';
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">Henüz bakıcı ilanı yok.</div>';
        return;
    }

    data.forEach(item => {
        const rawImg = item.imageurl || item.imageUrl;
        let imgUrl = 'https://via.placeholder.com/300x200?text=Bakici';
        if (rawImg) imgUrl = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;

        container.innerHTML += `
        <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm overflow-hidden card-hover-effect">
                <div class="position-relative">
                     <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2 fw-bold">
                        ${item.price} ₺ / Gün
                     </span>
                    <img src="${imgUrl}" class="card-img-top" style="height: 250px; object-fit: cover;">
                </div>
                <div class="card-body">
                    <h6 class="fw-bold text-dark-brown text-truncate">${item.title || item.name}</h6>
                    <div class="d-flex justify-content-between small text-muted mb-3">
                        <span><i class="fa-solid fa-star text-warning"></i> ${item.experience} Yıl</span>
                        <span><i class="fa-solid fa-location-dot"></i> ${item.location || 'Konum Yok'}</span>
                    </div>
                    <a href="caretakers.html" class="btn btn-sm btn-outline-warning w-100 rounded-pill text-dark fw-bold">Profili Gör</a>
                </div>
            </div>
        </div>`;
    });
}

// 3. Veteriner Kartları
function renderVets(data, container) {
    container.innerHTML = '';
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">Henüz klinik ilanı yok.</div>';
        return;
    }

    data.forEach(item => {
        const rawImg = item.imageurl || item.imageUrl;
        let imgUrl = 'https://images.pexels.com/photos/6235231/pexels-photo-6235231.jpeg?auto=compress&cs=tinysrgb&w=400';
        if (rawImg) imgUrl = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;

        const cName = item.clinicname || item.clinicName || "Klinik";

        container.innerHTML += `
        <div class="col-md-4">
            <div class="card h-100 border-0 shadow-sm overflow-hidden card-hover-effect">
                <div class="position-relative">
                     <span class="badge bg-white text-dark position-absolute top-0 end-0 m-2 shadow-sm">
                        <i class="fa-solid fa-location-dot text-danger"></i> ${item.city || 'Konum Yok'}
                     </span>
                    <img src="${imgUrl}" class="card-img-top" style="height: 250px; object-fit: cover;">
                </div>
                <div class="card-body text-center">
                    <h6 class="fw-bold text-dark-brown text-truncate">${cName}</h6>
                    <p class="small text-muted mb-3"><i class="fa-solid fa-user-doctor me-1"></i> ${item.vetname || item.vetName}</p>
                    <a href="vets.html" class="btn btn-sm btn-outline-danger w-100 rounded-pill" style="border-color:#A64D32; color:#A64D32;">Detaylar</a>
                </div>
            </div>
        </div>`;
    });
}

// Çıkış Fonksiyonu
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}