// --- js/caretakers.js (SUPABASE UYUMLU) ---

let currentReceiverId = null;
let contactModalInstance = null;
const API_URL = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ Bakıcılar sayfası yüklendi.");
    loadCaretakers();
    
    const filter = document.getElementById('filterRegion');
    if(filter) filter.addEventListener('change', loadCaretakers);
});

async function loadCaretakers() {
    const list = document.getElementById('caretakerList');
    const filterElem = document.getElementById('filterRegion');
    const region = filterElem ? filterElem.value : '';
    
    try {
        const res = await fetch(`${API_URL}/api/caretakers`);
        if (!res.ok) throw new Error("Veri çekilemedi");
        
        const data = await res.json();
        list.innerHTML = '';

        if (data.length === 0) {
            list.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted fs-5">Bu kriterlere uygun bakıcı bulunamadı.</p>
                </div>`;
            return;
        }

        const filteredData = region ? data.filter(c => c.location === region) : data;

        filteredData.forEach(c => {
            // --- SUPABASE RESİM DÜZELTMESİ ---
            const rawImg = c.imageurl || c.imageUrl;
            let imgUrl = 'https://via.placeholder.com/400x300?text=Pito+Bakici';
            
            if (rawImg) {
                imgUrl = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;
            }

            // --- İSİM DÜZELTMESİ ---
            // server.js'de "u.name" olarak çektiğimiz için c.name'e bakmalıyız
            const displayName = c.name || c.userName || c.title || "Bakıcı";
            const phone = c.phone || "Belirtilmemiş";
            const email = c.email || "Belirtilmemiş";

            list.innerHTML += `
                <div class="col-md-6 col-lg-4">
                    <div class="card caretaker-card h-100 shadow-sm rounded-4 overflow-hidden">
                        <div class="position-relative">
                            <img src="${imgUrl}" class="card-img-top" style="height:250px; object-fit:cover;" onerror="this.src='https://via.placeholder.com/400x300?text=Resim+Yok'">
                            <div class="position-absolute bottom-0 start-0 w-100 p-3" style="background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);">
                                <h5 class="fw-bold text-white mb-0">${displayName}</h5>
                                <small class="text-white-50">${c.title || 'Bakıcı'}</small>
                            </div>
                            <span class="badge bg-white text-dark position-absolute top-0 end-0 m-3 shadow-sm fw-bold">
                                ${c.price} ₺ / Gün
                            </span>
                        </div>
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center justify-content-between mb-3">
                                <span class="badge bg-light text-dark border"><i class="fa-solid fa-location-dot me-1"></i> ${c.location}</span>
                                <span class="badge bg-light text-warning border"><i class="fa-solid fa-star me-1"></i> ${c.experience} Yıl</span>
                            </div>
                            <p class="text-muted small mb-4 text-truncate-3">${c.description || 'Açıklama yok.'}</p>
                            
                            <button class="btn btn-clay w-100 rounded-pill py-2 fw-bold contact-btn"
                                    data-name="${displayName}"
                                    data-phone="${phone}"
                                    data-email="${email}"
                                    data-id="${c.user_id}">
                                <i class="fa-solid fa-comments me-2"></i> İletişime Geç
                            </button>
                        </div>
                    </div>
                </div>`;
        });

        // --- BUTONLARA TIKLAMA OLAYI ---
        document.querySelectorAll('.contact-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // 1. Token Kontrolü
                const token = localStorage.getItem('token');
                
                if (!token) {
                    // --- GİRİŞ YAPILMAMIŞSA ---
                    if(typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: 'Giriş Yapmalısınız',
                            text: "Bakıcı ile iletişime geçmek ve iletişim bilgilerini görmek için lütfen giriş yapın.",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#A64D32',
                            cancelButtonColor: '#8D6E63',
                            confirmButtonText: 'Giriş Yap',
                            cancelButtonText: 'Vazgeç',
                            background: '#F9F6F0',
                            color: '#3E2723'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.href = 'login.html';
                            }
                        });
                    } else {
                        alert("Giriş yapmalısınız.");
                        window.location.href = 'login.html';
                    }
                    return; 
                }

                // 2. Giriş yapılmışsa verileri al ve modalı aç
                const name = this.getAttribute('data-name');
                const phone = this.getAttribute('data-phone');
                const email = this.getAttribute('data-email');
                const id = this.getAttribute('data-id');

                openModal(name, phone, email, id);

                // Başarılı Bildirimi (Toast)
                if(typeof Swal !== 'undefined') {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer)
                            toast.addEventListener('mouseleave', Swal.resumeTimer)
                        }
                    });

                    Toast.fire({
                        icon: 'success',
                        title: 'İletişim bilgileri görüntülendi'
                    });
                }
            });
        });

    } catch (e) { 
        console.error("Yükleme Hatası:", e);
        list.innerHTML = '<p class="text-danger text-center w-100">Sunucu hatası. Lütfen daha sonra tekrar deneyin.</p>';
    }
}

function openModal(name, phone, email, id) {
    const nameEl = document.getElementById('modalName');
    if(nameEl) nameEl.innerText = name;
    
    // Telefon
    const phoneEl = document.getElementById('modalPhone');
    if(phoneEl) phoneEl.innerText = phone;
    
    const phoneLink = document.getElementById('modalPhoneLink');
    if(phoneLink) {
        if(phone !== "Belirtilmemiş") {
            phoneLink.href = `tel:${phone}`;
            phoneLink.classList.remove('disabled', 'text-muted');
        } else {
            phoneLink.removeAttribute('href');
            phoneLink.classList.add('disabled', 'text-muted');
        }
    }

    // Email
    const emailEl = document.getElementById('modalEmail');
    if(emailEl) emailEl.innerText = email;
    
    const emailLink = document.getElementById('modalEmailLink');
    if(emailLink) emailLink.href = `mailto:${email}`;

    currentReceiverId = id;

    // Modalı Göster
    const modalEl = document.getElementById('contactModal');
    if (modalEl) {
        if (!contactModalInstance) {
            contactModalInstance = new bootstrap.Modal(modalEl);
        }
        contactModalInstance.show();
    }
}