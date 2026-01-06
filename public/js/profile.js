// --- js/profile.js (TAKİP SİSTEMİ EKLENDİ) ---

const API_URL = 'https://pito-projesi.onrender.com';
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
        // 1. Temel Bilgileri Al
        const userRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!userRes.ok) throw new Error("Oturum süresi dolmuş");

        currentUser = await userRes.json();
        updateProfileUI(currentUser);

        // 2. Takip İstatistiklerini Al ve UI Güncelle (YENİ EKLENDİ)
        await fetchUserStats(token, currentUser);

        // 3. İlanları Çek
        await fetchMyPets(token, currentUser);
        await fetchMyBreedingAds(token, currentUser); 
        await fetchMyCaretakers(token, currentUser);
        await fetchMyVets(token, currentUser);

    } catch (error) {
        console.error("Profil Yükleme Hatası:", error);
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

    if(nameEl) nameEl.innerText = user.name || "İsimsiz Kullanıcı";
    if(emailEl) emailEl.innerText = user.email || "";
    if(phoneEl) phoneEl.innerText = user.phone || "Telefon eklenmemiş";

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

// +++ YENİ: TAKİPÇİ İSTATİSTİKLERİNİ ÇEKME +++
async function fetchUserStats(token, user) {
    try {
        // Profil endpoint'i bize stats objesini de veriyor
        const res = await fetch(`${API_URL}/api/users/profile/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        const followerEl = document.getElementById('myFollowerCount');
        const followingEl = document.getElementById('myFollowingCount');

        if(followerEl && data.stats) {
            followerEl.querySelector('h5').innerText = data.stats.followers;
            // Tıklayınca listeyi aç
            followerEl.onclick = () => openConnectionsModal('followers');
        }

        if(followingEl && data.stats) {
            followingEl.querySelector('h5').innerText = data.stats.following;
            // Tıklayınca listeyi aç
            followingEl.onclick = () => openConnectionsModal('following');
        }

    } catch (err) {
        console.error("İstatistik Hatası:", err);
    }
}

// +++ YENİ: TAKİP LİSTESİ MODALI AÇMA +++
async function openConnectionsModal(type) {
    const titleEl = document.getElementById('connectionsTitle');
    const listEl = document.getElementById('connectionsList');
    
    // Modalı Aç
    const modal = new bootstrap.Modal(document.getElementById('connectionsModal'));
    modal.show();

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

            // Listeye eleman ekle
            const item = document.createElement('a');
            item.href = `user-profile.html?id=${u.id}`; // Profile gitmek için link
            item.className = "list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 p-2";
            
            item.innerHTML = `
                <img src="${userImg}" class="rounded-circle object-fit-cover" width="40" height="40">
                <span class="fw-bold text-dark small">${u.name}</span>
            `;
            listEl.appendChild(item);
        });

    } catch (err) {
        console.error(err);
        listEl.innerHTML = '<div class="text-danger p-2 small">Liste yüklenemedi.</div>';
    }
}

// --- 1. SAHİPLENDİRME İLANLARI ---
async function fetchMyPets(token, user) {
    const container = document.getElementById('myAdsContainer');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/api/pets`);
        if (!res.ok) throw new Error("Pets fetch failed");
        
        const allPets = await res.json();
        const myPets = allPets.filter(pet => String(pet.user_id) === String(user.id));
        
        const countEl = document.getElementById('adCount');
        if(countEl) countEl.innerText = myPets.length;
        
        container.innerHTML = ""; 

        if (myPets.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-3">Henüz sahiplendirme ilanınız yok.</div>`;
            return;
        }

        myPets.forEach(pet => {
            const rawImg = pet.imageurl || pet.imageUrl;
            let petImg = 'https://via.placeholder.com/600x400?text=Resim+Yok';
            if (rawImg) {
                petImg = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;
            }

            const status = pet.adoptionstatus || pet.adoptionStatus;
            const isAdopted = status === 'Sahiplendirildi';

            container.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 pet-card shadow-sm border-0 position-relative overflow-hidden">
                    <img src="${petImg}" class="pet-img" style="height: 200px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/600x400?text=Hata'">
                    <div class="card-body">
                        <h5 class="fw-bold text-truncate" style="color: #A64D32;">${pet.name}</h5>
                        <p class="text-muted small">${pet.species} • ${pet.age} Yaş</p>
                        <div class="d-flex justify-content-between mt-3 gap-2">
                            <a href="pet-detail.html?id=${pet.id}" class="btn btn-sm btn-outline-primary rounded-pill px-3 flex-grow-1" style="border-color: #A64D32; color: #A64D32;">Gör</a>
                            <button onclick="openDeleteModal(${pet.id}, 'pet')" class="btn btn-sm btn-outline-danger rounded-pill px-3">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${isAdopted ? '<span class="badge bg-secondary position-absolute top-0 end-0 m-2">Yuva Buldu</span>' : ''}
                </div>
            </div>`;
        });
    } catch (error) {
        console.error("Pets Error:", error);
        container.innerHTML = '<div class="text-danger">İlanlar yüklenirken hata oluştu.</div>';
    }
}

// --- 2. EŞ ARAYAN İLANLARIM ---
async function fetchMyBreedingAds(token, user) {
    const container = document.getElementById('myBreedingContainer');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/api/breeding-pets`);
        if (!res.ok) throw new Error("Veri çekilemedi.");
        
        const allAds = await res.json();
        const myAds = allAds.filter(ad => String(ad.user_id) === String(user.id));

        container.innerHTML = "";

        if (myAds.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-3">Henüz eş arayan ilanınız yok.</div>`;
            return;
        }

        myAds.forEach(ad => {
            const rawImg = ad.imageurl || ad.imageUrl;
            let imgUrl = 'https://via.placeholder.com/600x400?text=Resim+Yok';
            if (rawImg) {
                imgUrl = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;
            }

            container.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0 position-relative overflow-hidden">
                    <span class="position-absolute top-0 start-0 m-2 badge bg-danger shadow-sm"><i class="fa-solid fa-heart"></i></span>
                    <img src="${imgUrl}" class="card-img-top" style="height: 200px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/600x400?text=Hata'">
                    <div class="card-body">
                        <h5 class="fw-bold text-truncate" style="color: #A64D32;">${ad.name}</h5>
                        <p class="text-muted small">${ad.species} • ${ad.breed || 'Belirsiz'} • ${ad.age} Yaş</p>
                        
                        <div class="d-flex justify-content-between mt-3 gap-2">
                             <a href="breeding-detail.html?id=${ad.id}" class="btn btn-sm btn-outline-primary rounded-pill px-3 flex-grow-1" style="border-color: #A64D32; color: #A64D32;">
                                <i class="fa-solid fa-eye me-1"></i> Gör
                             </a>
                            <button onclick="openDeleteModal(${ad.id}, 'breeding')" class="btn btn-sm btn-outline-danger rounded-pill px-3">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    } catch (error) {
        console.error("Breeding Error:", error);
    }
}

// --- 3. BAKICILIK İLANLARIM ---
async function fetchMyCaretakers(token, user) {
    const container = document.getElementById('myCaretakersContainer');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/api/caretakers`);
        if (!res.ok) throw new Error("Caretaker fetch failed");

        const allCaretakers = await res.json();
        const myCaretakers = allCaretakers.filter(c => String(c.user_id) === String(user.id));
        
        container.innerHTML = "";

        if (myCaretakers.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-3">Henüz bakıcılık ilanınız yok.</div>`;
            return;
        }

        myCaretakers.forEach(item => {
            const rawImg = item.imageurl || item.imageUrl;
            let imgUrl = 'https://via.placeholder.com/600x400?text=Resim+Yok';
            if (rawImg) {
                imgUrl = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;
            }

            container.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0 border-warning overflow-hidden">
                    <img src="${imgUrl}" class="card-img-top" style="height: 150px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/600x400?text=Hata'">
                    <div class="card-body">
                        <h6 class="fw-bold text-truncate" style="color: #3E2723;">${item.title}</h6>
                        <div class="d-flex justify-content-between small text-muted mb-2">
                            <span><i class="fa-solid fa-star text-warning"></i> ${item.experience} Yıl</span>
                            <span><i class="fa-solid fa-location-dot"></i> ${item.location}</span>
                        </div>
                        <p class="fw-bold" style="color:#A64D32">${item.price} ₺ <small class="text-muted fw-normal">/ gün</small></p>
                        
                        <div class="d-flex justify-content-between mt-3 gap-2">
                             <a href="caretakers.html" class="btn btn-sm btn-outline-primary rounded-pill px-3 flex-grow-1" style="border-color: #A64D32; color: #A64D32;">
                                <i class="fa-solid fa-list me-1"></i> Listede Gör
                             </a>
                            <button onclick="openDeleteModal(${item.id}, 'caretaker')" class="btn btn-sm btn-outline-danger w-auto rounded-pill px-3">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    } catch (error) {
        console.error("Caretaker Error:", error);
    }
}

// --- 4. VETERİNER İLANLARIM ---
async function fetchMyVets(token, user) {
    const container = document.getElementById('myVetsContainer');
    if (!container) return; 

    try {
        const res = await fetch(`${API_URL}/api/vets`);
        if (!res.ok) throw new Error("Vets fetch failed");

        const allVets = await res.json();
        const myVets = allVets.filter(v => String(v.user_id) === String(user.id));
        
        container.innerHTML = "";

        if (myVets.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-3">Henüz veteriner kliniği ilanınız yok.</div>`;
            return;
        }

        myVets.forEach(vet => {
            const rawImg = vet.imageurl || vet.imageUrl;
            let imgUrl = 'https://images.pexels.com/photos/6235231/pexels-photo-6235231.jpeg?auto=compress&cs=tinysrgb&w=400';
            if (rawImg) {
                imgUrl = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;
            }

            const cName = vet.clinicname || vet.clinicName || "Klinik İsmi";
            const vCity = vet.city || "Şehir Yok";

            container.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0 overflow-hidden" style="border-bottom: 3px solid #3E2723 !important;">
                    <div class="position-relative">
                        <img src="${imgUrl}" class="card-img-top" style="height: 150px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/600x400?text=Hata'">
                        <span class="badge bg-white text-dark position-absolute top-0 end-0 m-2 shadow-sm">
                            <i class="fa-solid fa-location-dot text-danger me-1"></i> ${vCity}
                        </span>
                    </div>
                    <div class="card-body">
                        <h6 class="fw-bold text-truncate" style="color: #3E2723;">${cName}</h6>
                        <p class="small text-muted mb-2"><i class="fa-solid fa-user-doctor me-1"></i> ${vet.vetname || vet.vetName}</p>
                        
                        <div class="d-flex justify-content-between mt-3 gap-2">
                             <a href="vets.html" class="btn btn-sm btn-outline-primary rounded-pill px-3 flex-grow-1" style="border-color: #3E2723; color: #3E2723;">
                                <i class="fa-solid fa-list me-1"></i> Listede Gör
                             </a>
                            <button onclick="openDeleteModal(${vet.id}, 'vet')" class="btn btn-sm btn-outline-danger w-auto rounded-pill px-3">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    } catch (error) {
        console.error("Vets Error:", error);
    }
}

// --- ORTAK İŞLEMLER ---

function openEditProfileModal() {
    if (!currentUser) return;
    document.getElementById('editName').value = currentUser.name || "";
    document.getElementById('editPhone').value = currentUser.phone || "";
    document.getElementById('editImageFile').value = ""; 
    
    const previewContainer = document.getElementById('imagePreviewContainer');
    if(previewContainer) previewContainer.classList.add('d-none');
    
    const modalEl = document.getElementById('editProfileModal');
    if(modalEl) {
        new bootstrap.Modal(modalEl).show();
    }
}

window.openDeleteModal = function(id, type) {
    currentDeleteId = id;
    currentDeleteType = type; 
    const modalEl = document.getElementById('deleteModal');
    if(modalEl) {
        new bootstrap.Modal(modalEl).show();
    }
}

async function handleConfirmDelete() {
    if (!currentDeleteId || !currentDeleteType) return;
    
    const token = localStorage.getItem('token');
    let endpoint = '';
    
    if (currentDeleteType === 'pet') endpoint = `${API_URL}/api/pets/${currentDeleteId}`;
    else if (currentDeleteType === 'breeding') endpoint = `${API_URL}/api/breeding-pets/${currentDeleteId}`;
    else if (currentDeleteType === 'caretaker') endpoint = `${API_URL}/api/caretakers/${currentDeleteId}`;
    else if (currentDeleteType === 'vet') endpoint = `${API_URL}/api/vets/${currentDeleteId}`;

    try {
        const res = await fetch(endpoint, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const modalEl = document.getElementById('deleteModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if(modal) modal.hide();
            
            alert("İlan başarıyla silindi.");
            window.location.reload();
        } else {
            alert("Silme işlemi başarısız oldu.");
        }
    } catch (err) { 
        console.error(err);
        alert("Sunucuya bağlanılamadı.");
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    if(btn) {
        btn.innerText = "Yükleniyor...";
        btn.disabled = true;
    }

    const formData = new FormData();
    formData.append('name', document.getElementById('editName').value);
    formData.append('phone', document.getElementById('editPhone').value);
    
    const fileInput = document.getElementById('editImageFile');
    if (fileInput.files[0]) {
        formData.append('newProfileImage', fileInput.files[0]);
    }

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/auth/me`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            alert("Profil başarıyla güncellendi! ✅");
            window.location.reload();
        } else {
            alert("Güncelleme başarısız oldu.");
        }
    } catch (err) { 
        console.error(err);
        alert("Bir hata oluştu.");
    } finally {
        if(btn) {
            btn.innerText = "Kaydet";
            btn.disabled = false;
        }
    }
}