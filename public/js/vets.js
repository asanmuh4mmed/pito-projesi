// --- js/vets.js (SUPABASE UYUMLU) ---

const API_URL = 'http://localhost:3001';
let allVets = [];

document.addEventListener('DOMContentLoaded', async () => {
    await fetchVets();
    
    // Filtreleme Dinleyicisi
    const cityFilter = document.getElementById('cityFilter');
    if (cityFilter) {
        cityFilter.addEventListener('change', filterVets);
    }
});

async function fetchVets() {
    const container = document.getElementById('vetsContainer');
    // Yükleniyor ikonu
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

function renderVets(vets) {
    const container = document.getElementById('vetsContainer');
    
    if (vets.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-5"><h5>Aradığınız kriterde klinik bulunamadı.</h5></div>';
        return;
    }

    let fullHtml = '';

    vets.forEach(vet => {
        // --- SUPABASE VERİ DÜZELTMELERİ ---
        // PostgreSQL sütun isimlerini küçük harfe çevirebilir.
        
        // 1. Resim Kontrolü
        const rawImg = vet.imageurl || vet.imageUrl;
        let imgUrl = 'https://images.pexels.com/photos/6235231/pexels-photo-6235231.jpeg?auto=compress&cs=tinysrgb&w=400';
        
        if (rawImg) {
            imgUrl = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;
        }
        
        // 2. Metin Alanları Kontrolü (camelCase vs lowercase)
        const cName = vet.clinicname || vet.clinicName || "Klinik İsmi Yok";
        const vName = vet.vetname || vet.vetName || "Hekim İsmi Yok";
        const vCity = vet.city || "Şehir Yok";
        const vAddress = vet.address || "Adres Girilmemiş";
        const vPhone = vet.phone || "";

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
                    
                    <p class="small text-muted text-truncate mb-4">
                        <i class="fa-regular fa-map me-1"></i> ${vAddress}
                    </p>

                    <button class="btn w-100 rounded-pill py-2 fw-bold text-white shadow-sm contact-btn" 
                            style="background-color: #A64D32;"
                            data-phone="${vPhone}"
                            data-clinic="${cName}"
                            data-vet="${vName}">
                        <i class="fa-solid fa-phone me-2"></i> İletişime Geç
                    </button>
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = fullHtml;
    setupContactButtons();
}

function setupContactButtons() {
    const buttons = document.querySelectorAll('.contact-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const token = localStorage.getItem('token');
            
            // --- GÜVENLİK KONTROLÜ ---
            if (!token) {
                if(typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Giriş Yapmalısınız',
                        text: "Klinik iletişim bilgilerini görmek için lütfen giriş yapın.",
                        icon: 'warning',
                        confirmButtonColor: '#A64D32',
                        confirmButtonText: 'Tamam'
                    });
                } else {
                    alert("Klinik iletişim bilgilerini görmek için giriş yapmalısınız.");
                }
                return;
            }

            // --- BİLGİLERİ AL VE MODAL'A YAZ ---
            const phone = this.getAttribute('data-phone');
            const clinic = this.getAttribute('data-clinic');
            const vetName = this.getAttribute('data-vet');

            // Modal elemanlarını doldur
            const cNameEl = document.getElementById('modalClinicName');
            if(cNameEl) cNameEl.innerText = clinic;

            const vNameEl = document.getElementById('modalVetName');
            if(vNameEl) vNameEl.innerText = vetName;
            
            const callBtn = document.getElementById('modalPhoneBtn');
            if(callBtn) {
                callBtn.href = `tel:${phone}`;
                callBtn.innerHTML = `<i class="fa-solid fa-phone me-2"></i> ${phone} - Hemen Ara`;
            }

            // Modalı Aç
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
    if (selectedCity === 'all') {
        renderVets(allVets);
    } else {
        const filtered = allVets.filter(v => v.city === selectedCity);
        renderVets(filtered);
    }
}