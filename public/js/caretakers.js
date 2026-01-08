// --- js/caretakers.js (YENİLENMİŞ VERSİYON) ---

const API_URL = 'https://pito-projesi.onrender.com';
let currentCaretakerUserId = null; // Mesaj göndermek için (Receiver ID)
let currentCaretakerId = null;     // Yorum yapmak için (Caretaker Table ID)

// ŞEHİR VERİTABANI (Aynı kaldı, yer kaplamasın diye kısalttım, sen eski dosyadaki uzun listeyi buraya koyabilirsin veya olduğu gibi bırakabilirsin)
// Not: Sen elindeki cityData nesnesini buraya kopyala.
const cityData = { "Adana": ["Seyhan", "Çukurova"], "Ankara": ["Çankaya", "Keçiören"], "İstanbul": ["Kadıköy", "Beşiktaş"] }; 
// (Gerçek projede yukarıdaki kısa listeyi kendi uzun listenle değiştirmeyi unutma!)

document.addEventListener('DOMContentLoaded', () => {
    loadCities();     // Şehirleri doldur
    loadCaretakers(); // Bakıcıları çek
});

// --- ŞEHİR VE İLÇE YÖNETİMİ ---
function loadCities() {
    const cityListElement = document.getElementById('cityOptions');
    if (cityListElement) {
        // Eğer uzun cityData kullanacaksan burası çalışır
        // cityData değişkeni tanımlı olmalı
        if(typeof cityData !== 'undefined') {
             for (const city in cityData) {
                const option = document.createElement('option');
                option.value = city;
                cityListElement.appendChild(option);
            }
        }
    }

    const cityInput = document.getElementById('filterCity');
    const districtSelect = document.getElementById('filterDistrict');

    if (cityInput && districtSelect) {
        cityInput.addEventListener('input', function() {
            const selectedCity = this.value;
            districtSelect.innerHTML = '<option value="">İlçe Seç</option>';
            districtSelect.disabled = true;

            if (typeof cityData !== 'undefined' && cityData[selectedCity]) {
                districtSelect.disabled = false;
                cityData[selectedCity].forEach(district => {
                    const option = document.createElement('option');
                    option.value = district;
                    option.textContent = district;
                    districtSelect.appendChild(option);
                });
            }
            loadCaretakers();
        });
        districtSelect.addEventListener('change', loadCaretakers);
    }
}

// --- BAKICILARI ÇEK VE LİSTELE ---
async function loadCaretakers() {
    const list = document.getElementById('caretakerList');
    const cityVal = document.getElementById('filterCity').value.trim().toLowerCase();
    const districtVal = document.getElementById('filterDistrict').value.toLowerCase();
    
    list.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-earth"></div></div>';

    try {
        const res = await fetch(`${API_URL}/api/caretakers`);
        if (!res.ok) throw new Error("Veri çekilemedi");
        const data = await res.json();
        
        list.innerHTML = '';

        const filteredData = data.filter(c => {
            const loc = (c.location || "").toLowerCase();
            if (districtVal) return loc.includes(districtVal);
            if (cityVal) return loc.includes(cityVal);
            return true;
        });

        if (filteredData.length === 0) {
            list.innerHTML = '<div class="col-12 text-center text-muted py-5">Kriterlere uygun bakıcı bulunamadı.</div>';
            return;
        }

        filteredData.forEach(c => {
            const rawImg = c.imageurl || c.imageUrl;
            let imgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`) : 'https://via.placeholder.com/400x300';
            
            const name = c.name || "İsimsiz";
            const title = c.title || "Bakıcı";
            const id = c.id; // Caretaker ID (Yorumlar için)
            const userId = c.user_id; // User ID (Mesajlaşma için)

            list.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden caretaker-card">
                    <div class="position-relative">
                        <img src="${imgUrl}" class="card-img-top object-fit-cover" style="height: 240px;">
                        <span class="badge bg-white text-dark position-absolute top-0 end-0 m-3 shadow-sm fw-bold">
                            ${c.price} ₺ / Gün
                        </span>
                        <div class="position-absolute bottom-0 start-0 w-100 p-3" style="background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);">
                            <h5 class="text-white fw-bold mb-0">${name}</h5>
                            <small class="text-white-50">${title}</small>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <div class="d-flex gap-2 mb-3">
                            <span class="badge bg-light text-dark border"><i class="fa-solid fa-location-dot"></i> ${c.location}</span>
                            <span class="badge bg-light text-warning border"><i class="fa-solid fa-star"></i> ${c.experience} Yıl</span>
                        </div>
                        <p class="text-muted small text-truncate-3">${c.description || 'Açıklama yok.'}</p>
                        
                        <button class="btn btn-clay w-100 rounded-pill py-2 fw-bold" 
                            onclick="openContactModal('${name}', '${title}', '${c.phone}', '${imgUrl}', ${userId}, ${id})">
                            <i class="fa-solid fa-comments me-1"></i> İletişime Geç
                        </button>
                    </div>
                </div>
            </div>`;
        });

    } catch (e) {
        console.error(e);
        list.innerHTML = '<p class="text-danger text-center">Bir hata oluştu.</p>';
    }
}

// --- MODAL İŞLEMLERİ ---
function openContactModal(name, title, phone, imgUrl, userId, caretakerId) {
    // 1. Bilgileri Doldur
    document.getElementById('modalName').innerText = name;
    document.getElementById('modalTitle').innerText = title;
    
    // Resim hatası önleyici (Boşsa varsayılan resim)
    const safeImg = (imgUrl && imgUrl !== 'null' && imgUrl !== 'undefined') 
        ? imgUrl 
        : 'https://via.placeholder.com/150';
    document.getElementById('modalImg').src = safeImg;

    // --- TELEFON KODU BURADAN KALDIRILDI ---

    // 2. ID'leri Kaydet (Global Değişkenlere)
    currentCaretakerUserId = userId; // Mesaj için
    currentCaretakerId = caretakerId; // Yorum için

    // 3. Yorumları Temizle ve Yükle
    const reviewsList = document.getElementById('reviewsList');
    if (reviewsList) {
        reviewsList.innerHTML = '<div class="text-center py-2"><div class="spinner-border spinner-border-sm"></div></div>';
    }
    loadCaretakerReviews(caretakerId);

    // 4. Modalı Aç
    new bootstrap.Modal(document.getElementById('contactModal')).show();
}

// --- MESAJ GÖNDERME ---
async function sendCaretakerMessage() {
    const msg = document.getElementById('modalMessageText').value.trim();
    if (!msg) return alert("Lütfen bir mesaj yazın.");

    const token = localStorage.getItem('token');
    if (!token) return window.location.href = 'login.html';

    try {
        const res = await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                receiver_id: currentCaretakerUserId,
                pet_id: 0,
                post_type: 'caretaker_contact',
                message: msg
            })
        });

        if (res.ok) {
            alert("Mesajınız iletildi! 📨");
            document.getElementById('modalMessageText').value = '';
            bootstrap.Modal.getInstance(document.getElementById('contactModal')).hide();
        } else {
            alert("Mesaj gönderilemedi.");
        }
    } catch (e) { console.error(e); }
}

// --- YORUM SİSTEMİ ---
async function loadCaretakerReviews(caretakerId) {
    const list = document.getElementById('reviewsList');
    try {
        const res = await fetch(`${API_URL}/api/caretaker-reviews/${caretakerId}`);
        const reviews = await res.json();

        if (reviews.length === 0) {
            list.innerHTML = '<div class="text-center text-muted small py-3">Henüz yorum yapılmamış. İlk yorumu sen yap!</div>';
            return;
        }

        list.innerHTML = '';
        reviews.forEach(r => {
            const stars = '⭐'.repeat(r.rating);
            const userImg = r.user_image || 'https://via.placeholder.com/40';
            list.innerHTML += `
            <div class="d-flex gap-3 mb-3 border-bottom pb-2">
                <img src="${userImg}" class="rounded-circle" width="40" height="40">
                <div>
                    <div class="d-flex justify-content-between">
                        <small class="fw-bold text-dark">${r.user_name}</small>
                        <small class="text-warning">${stars}</small>
                    </div>
                    <p class="small text-muted mb-0">${r.comment}</p>
                </div>
            </div>`;
        });
    } catch (e) {
        list.innerHTML = '<small class="text-danger">Yorumlar yüklenemedi.</small>';
    }
}

function toggleReviewForm() {
    const form = document.getElementById('addReviewForm');
    form.classList.toggle('d-none');
}

async function submitCaretakerReview() {
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value.trim();
    const token = localStorage.getItem('token');

    if (!token) return window.location.href = 'login.html';
    if (!comment) return alert("Lütfen bir yorum yazın.");

    try {
        const res = await fetch(`${API_URL}/api/caretaker-reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ caretaker_id: currentCaretakerId, rating, comment })
        });

        if (res.ok) {
            alert("Yorumunuz kaydedildi!");
            document.getElementById('reviewComment').value = '';
            toggleReviewForm(); // Formu gizle
            loadCaretakerReviews(currentCaretakerId); // Listeyi yenile
        } else {
            const err = await res.json();
            alert(err.message || "Hata oluştu.");
        }
    } catch (e) { console.error(e); }
}