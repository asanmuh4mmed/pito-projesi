// --- js/vets.js ---

const API_URL = 'https://pitopets.com'; // GÜNCELLENDİ
let allVets = [];
let currentVetId = null; 
let currentRating = 0;

// Türkiye'nin 81 İli
const cities = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
    "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
    "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
    "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
    "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
    "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon",
    "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale",
    "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

document.addEventListener('DOMContentLoaded', async () => {
    loadCityOptions();
    await fetchVets();
    
    const cityFilter = document.getElementById('cityFilter');
    if (cityFilter) {
        cityFilter.addEventListener('change', filterVets);
    }

    setupStarRatingInput();
});

// Şehir Listesi Yükleme
function loadCityOptions() {
    const citySelect = document.getElementById('cityFilter');
    if (!citySelect) return;
    const firstOption = citySelect.options[0];
    citySelect.innerHTML = ''; 
    citySelect.appendChild(firstOption);

    cities.sort((a, b) => a.localeCompare(b, 'tr')).forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
}

// Veterinerleri Çekme
async function fetchVets() {
    const container = document.getElementById('vetsContainer');
    container.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-danger"></div></div>';

    try {
        const res = await fetch(`${API_URL}/api/vets`);
        if (!res.ok) throw new Error("Veri alınamadı");
        
        allVets = await res.json();
        renderVets(allVets);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="col-12 text-center text-danger py-5"><h5>Veriler yüklenirken bir sorun oluştu.</h5></div>';
    }
}

// Kartları Ekrana Basma
function renderVets(vets) {
    const container = document.getElementById('vetsContainer');
    
    if (vets.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-5"><h5>Aradığınız kriterde klinik bulunamadı.</h5></div>';
        return;
    }

    let fullHtml = '';

    vets.forEach(vet => {
        const rawImg = vet.imageurl || vet.imageUrl;
        let imgUrl = 'https://images.pexels.com/photos/6235231/pexels-photo-6235231.jpeg?auto=compress&cs=tinysrgb&w=400';
        if (rawImg) imgUrl = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;
        
        const cName = vet.clinicname || vet.clinicName || "Klinik İsmi Yok";
        const vName = vet.vetname || vet.vetName || "Hekim İsmi Yok";
        const vCity = vet.city || "Şehir Yok";
        const vAddress = vet.address || "Adres Girilmemiş";
        const vPhone = vet.phone || "";
        const vetId = vet.id; // Supabase ID'si

        fullHtml += `
        <div class="col-md-6 col-lg-4">
            <div class="card vet-card h-100 shadow-sm border-0">
                <div class="position-relative">
                    <img src="${imgUrl}" class="card-img-top" alt="${cName}" onerror="this.src='https://via.placeholder.com/400x300?text=Klinik'">
                    <span class="badge bg-white text-dark position-absolute top-0 end-0 m-3 shadow-sm fw-bold">
                        <i class="fa-solid fa-location-dot text-danger me-1"></i> ${vCity}
                    </span>
                </div>
                
                <div class="card-body text-center p-4">
                    <h5 class="fw-bold mb-1" style="color: #3E2723; font-family: 'Playfair Display', serif;">${cName}</h5>
                    <p class="text-muted small mb-3"><i class="fa-solid fa-user-doctor me-1"></i> ${vName}</p>
                    
                    <p class="small text-muted mb-4">
                        <i class="fa-regular fa-map me-1"></i> ${vAddress}
                    </p>

                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-secondary w-50 rounded-pill py-2 small fw-bold"
                                onclick="openReviewsModal('${vetId}', '${cName}')">
                            <i class="fa-regular fa-comments me-1"></i> Yorumlar
                        </button>

                        // js/vets.js içinde renderVets fonksiyonundaki ilgili kısmı şununla DEĞİŞTİR:

                        <button class="btn w-50 rounded-pill py-2 small fw-bold text-white contact-btn d-flex align-items-center justify-content-center" 
                                style="background-color: #A64D32;"
                                data-phone="${vPhone}"
                                data-clinic="${cName}"
                                data-vet="${vName}">
                            <i class="fa-solid fa-phone me-2"></i> Ara
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = fullHtml;
    setupContactButtons();
}

// --- YORUM SİSTEMİ (GERÇEK API BAĞLANTISI) ---

// 1. Modalı Aç ve Yorumları Çek
async function openReviewsModal(vetId, clinicName) {
    currentVetId = vetId;
    
    // Modal Başlığı
    const titleEl = document.getElementById('reviewModalTitle');
    if(titleEl) titleEl.innerText = clinicName + " Yorumları";

    // Yükleniyor...
    const listEl = document.getElementById('reviewsList');
    listEl.innerHTML = '<div class="text-center py-4"><div class="spinner-border spinner-border-sm text-secondary"></div> Yükleniyor...</div>';
    
    // Modalı Göster
    const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
    modal.show();

    // GERÇEK VERİ ÇEKME
    try {
        const res = await fetch(`${API_URL}/api/reviews/${vetId}`);
        if (!res.ok) throw new Error("Yorumlar alınamadı");

        const reviews = await res.json();
        renderReviews(reviews);

    } catch (err) {
        console.error(err);
        listEl.innerHTML = '<div class="text-center text-muted py-3">Yorumlar yüklenirken hata oluştu veya henüz yorum yok.</div>';
    }
}

// 2. Yorumları Ekrana Bas
function renderReviews(reviews) {
    const listEl = document.getElementById('reviewsList');
    
    if (!reviews || reviews.length === 0) {
        listEl.innerHTML = '<div class="text-center text-muted py-3">Henüz yorum yapılmamış. İlk yorumu sen yap! 👇</div>';
        return;
    }

    let html = '';
    reviews.forEach(r => {
        const date = new Date(r.created_at).toLocaleDateString('tr-TR');
        const userName = r.users ? r.users.name : (r.user_name || "Kullanıcı");
        
        let stars = '';
        for(let i=1; i<=5; i++) {
            stars += i <= r.rating ? '<i class="fa-solid fa-star text-warning small"></i>' : '<i class="fa-regular fa-star text-muted small"></i>';
        }

        html += `
        <div class="card mb-3 border-0 shadow-sm bg-white">
            <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="fw-bold mb-0 text-earth small">${userName}</h6>
                    <span class="text-muted small" style="font-size: 11px;">${date}</span>
                </div>
                <div class="mb-2">${stars}</div>
                <p class="text-muted small mb-0">${r.comment}</p>
            </div>
        </div>`;
    });

    listEl.innerHTML = html;
}

// 3. Yeni Yorum Gönder
async function submitReview() {
    const comment = document.getElementById('reviewComment').value;
    const token = localStorage.getItem('token'); 

    if (!token) {
        if(typeof Swal !== 'undefined') Swal.fire({icon: 'warning', title: 'Giriş Yapmalısınız', confirmButtonColor: '#A64D32'});
        else alert("Yorum yapmak için giriş yapmalısınız.");
        return;
    }

    if (currentRating === 0) {
        alert("Lütfen puan veriniz!");
        return;
    }
    if (!comment.trim()) {
        alert("Lütfen bir yorum yazınız!");
        return;
    }

    const btn = document.querySelector('button[onclick="submitReview()"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Gönderiliyor...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/api/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                vet_id: currentVetId,
                rating: currentRating,
                comment: comment
            })
        });

        if (!res.ok) throw new Error("Yorum gönderilemedi");

        if(typeof Swal !== 'undefined') Swal.fire({icon: 'success', title: 'Teşekkürler!', text: 'Yorumunuz kaydedildi.', confirmButtonColor: '#A64D32'});
        else alert("Yorumunuz kaydedildi!");

        document.getElementById('reviewComment').value = '';
        currentRating = 0;
        document.getElementById('ratingText').innerText = 'Puanınız: 0';
        document.querySelectorAll('.star-rating-input i').forEach(s => {
            s.classList.remove('fa-solid');
            s.classList.add('fa-regular');
        });

        // Yorumları tekrar yükle
        openReviewsModal(currentVetId, document.getElementById('reviewModalTitle').innerText.replace(" Yorumları",""));

    } catch (err) {
        console.error(err);
        alert("Bir hata oluştu: " + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Yıldız Seçimi
function setupStarRatingInput() {
    const stars = document.querySelectorAll('.star-rating-input i');
    const text = document.getElementById('ratingText');

    stars.forEach(star => {
        star.addEventListener('click', function() {
            const val = parseInt(this.getAttribute('data-value'));
            currentRating = val;
            text.innerText = `Puanınız: ${val}`;

            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-value'));
                if (sVal <= val) {
                    s.classList.remove('fa-regular');
                    s.classList.add('fa-solid');
                } else {
                    s.classList.remove('fa-solid');
                    s.classList.add('fa-regular');
                }
            });
        });
    });
}

// İletişim Butonları
function setupContactButtons() {
    const buttons = document.querySelectorAll('.contact-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const token = localStorage.getItem('token');
            if (!token) {
                if(typeof Swal !== 'undefined') {
                    Swal.fire({ title: 'Giriş Yapmalısınız', text: "Klinik iletişim bilgilerini görmek için lütfen giriş yapın.", icon: 'warning', confirmButtonColor: '#A64D32', confirmButtonText: 'Tamam' });
                } else {
                    alert("Giriş yapınız.");
                }
                return;
            }

            const phone = this.getAttribute('data-phone');
            const clinic = this.getAttribute('data-clinic');
            const vetName = this.getAttribute('data-vet');

            const cNameEl = document.getElementById('modalClinicName');
            if(cNameEl) cNameEl.innerText = clinic;
            const vNameEl = document.getElementById('modalVetName');
            if(vNameEl) vNameEl.innerText = vetName;
            
            const callBtn = document.getElementById('modalPhoneBtn');
            if(callBtn) {
                callBtn.href = `tel:${phone}`;
                callBtn.innerHTML = `<i class="fa-solid fa-phone me-2"></i> ${phone} - Hemen Ara`;
            }

            const modalElement = document.getElementById('contactModal');
            if(modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        });
    });
}

function filterVets() {
    const selectedCity = document.getElementById('cityFilter').value;
    if (selectedCity === 'all' || selectedCity === 'Tüm Şehirler' || selectedCity === '') {
        renderVets(allVets);
        return;
    }
    const filtered = allVets.filter(v => {
        const vetCity = (v.city || v.City || "").toLocaleLowerCase('tr');
        const searchCity = selectedCity.toLocaleLowerCase('tr');
        return vetCity.includes(searchCity);
    });
    renderVets(filtered);
}