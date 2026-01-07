// --- js/breeding-detail.js (GÜNCELLENMİŞ VERSİYON - FOTO VE TİK EKLİ) ---

const API_URL = 'https://pito-projesi.onrender.com';
let currentPetOwnerId = null;
let currentPetId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // URL'den ID'yi al
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('id');

    if (!petId) {
        showError("URL'de İlan ID'si bulunamadı.");
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Veriyi çek
        const response = await fetch(`${API_URL}/api/breeding-pets/${petId}`, {
            method: 'GET',
            headers: headers
        });
        
        const contentType = response.headers.get("content-type");
        if (!response.ok || (contentType && contentType.indexOf("application/json") === -1)) {
            throw new Error("İlan verisi alınamadı veya ilan henüz onaylanmamış.");
        }

        const pet = await response.json();

        // Global değişkenleri ata
        currentPetOwnerId = pet.user_id;
        currentPetId = pet.id;

        // --- SAYFAYI DOLDUR ---
        renderPetDetail(pet, token);

    } catch (error) {
        console.error("Detay Hatası:", error);
        showError(error.message);
    }
});

function renderPetDetail(pet, token) {
    // 1. Resim Ayarı
    const rawImg = pet.imageurl || pet.imageUrl;
    let finalImage = 'https://via.placeholder.com/600x500?text=Resim+Yok';
    
    if (rawImg) {
        finalImage = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;
    }
    
    const imgElem = document.getElementById('petImage');
    if (imgElem) {
        imgElem.src = finalImage;
        imgElem.onerror = function() {
             this.src = 'https://via.placeholder.com/600x500?text=Resim+Yuklenemedi';
        };
    }

    // 2. Metin Bilgileri
    setText('petName', pet.name || 'İsimsiz');
    setText('petSpecies', pet.species || 'Belirsiz');
    setText('petBreed', pet.breed || '-');
    setText('petGender', pet.gender || '-');
    setText('petAge', pet.age || '0');
    setText('petDescription', pet.description || "Açıklama girilmemiş.");

    // 3. İlan Sahibi Bilgileri ve Güvenlik
    const ownerCardBody = document.querySelector('.bg-white.p-4.rounded-4.shadow-sm.border');
    const messageBtn = document.querySelector('button[onclick="openMessageModal()"]');

    if (token) {
        // --- GİRİŞ YAPILMIŞSA BİLGİLERİ GÖSTER ---
        const oName = pet.ownername || pet.ownerName || pet.users_name || "Kullanıcı";
        const oEmail = pet.owneremail || pet.ownerEmail || pet.users_email;

        // Profil Resmi Ayarlama
        const oImageRaw = pet.ownerimage || pet.ownerImage;
        let ownerImgUrl = 'https://via.placeholder.com/150?text=User';
        if (oImageRaw) {
            ownerImgUrl = oImageRaw.startsWith('http') ? oImageRaw : `${API_URL}${oImageRaw}`;
        }

        // Mavi Tik Kontrolü (Backend'den gelen ownerVerified verisi)
        const isVerified = (pet.ownerverified === true || pet.ownerVerified === true || pet.ownerverified === "true");
        const verifiedBadge = isVerified ? 
            `<svg class="verified-tick" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: #1da1f2; margin-left: 4px; vertical-align: text-bottom;">
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.416-.166-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 2.049 1.43 3.81 3.35 4.327a4.56 4.56 0 00-.238 1.402c0 2.21 1.71 4 3.818 4 .47 0 .92-.084 1.336-.25.62 1.333 1.926 2.25 3.437 2.25s2.816-.917 3.437-2.25c.416.166.866.25 1.336.25 2.11 0 3.818-1.79 3.818-4 0-.495-.084-.965-.238-1.402 1.92-.517 3.35-2.278 3.35-4.327zM12 17.5l-4.5-4.5 1.414-1.414L12 14.672l7.086-7.086 1.414 1.414L12 17.5z"/>
            </svg>` : '';

        // +++ GÜNCELLEME: İLAN SAHİBİ KARTI (RESİM + İSİM + TİK) +++
        // Eğer ownerCardBody varsa, içeriğini tamamen değiştiriyoruz
        if(ownerCardBody) {
            ownerCardBody.innerHTML = `
                <div class="d-flex align-items-center gap-3 mb-3">
                    <img src="${ownerImgUrl}" class="rounded-circle shadow-sm border" style="width: 60px; height: 60px; object-fit: cover;">
                    <div>
                        <small class="text-muted fw-bold" style="font-size: 0.75rem; letter-spacing: 1px;">İLAN SAHİBİ</small>
                        <h6 class="fw-bold mb-0 mt-1" style="color: #3E2723;">
                            <a href="user-profile.html?id=${pet.user_id}" class="text-decoration-none text-dark hover-link">
                                ${oName} ${verifiedBadge}
                            </a>
                        </h6>
                        <small class="text-muted" id="displayEmail">
                            <a href="mailto:${oEmail}" class="text-decoration-none text-muted">${oEmail}</a>
                        </small>
                    </div>
                </div>
                
                <hr class="text-muted opacity-25">

                <button onclick="openMessageModal()" class="btn w-100 py-2 rounded-pill fw-bold text-white shadow-sm hover-grow" style="background-color: #A64D32;">
                    <i class="fa-regular fa-paper-plane me-2"></i>Mesaj Gönder
                </button>
            `;
        }
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        if(messageBtn) messageBtn.style.display = 'block';
    } else {
        // --- GİRİŞ YAPILMAMIŞSA GİZLE ---
        if (ownerCardBody) {
            ownerCardBody.innerHTML = getLockedProfileHTML();
        }
        if(messageBtn) messageBtn.style.display = 'none';
    }

    // Yükleme ekranını kapat, içeriği aç
    const spinner = document.getElementById('loadingSpinner');
    const content = document.getElementById('petDetailContent');
    if(spinner) spinner.classList.add('d-none');
    if(content) content.classList.remove('d-none');
}

// Yardımcı Fonksiyon: Element textini güvenli şekilde ayarla
function setText(id, text) {
    const el = document.getElementById(id);
    if(el) el.innerText = text;
}

function showError(msg) {
    const spinner = document.getElementById('loadingSpinner');
    if(spinner) spinner.classList.add('d-none');
    
    const errorAlert = document.getElementById('errorAlert');
    if(errorAlert) errorAlert.classList.remove('d-none');
    
    const errorMsg = document.getElementById('errorMessage');
    if(errorMsg) errorMsg.innerText = msg;
}

function getLockedProfileHTML() {
    return `
        <div class="text-center py-4">
            <i class="fa-solid fa-lock fa-3x mb-3" style="color: #A64D32;"></i>
            <h5 class="fw-bold" style="color: #3E2723;">İletişim Bilgileri Gizli</h5>
            <p class="text-muted small mb-3">İlan sahibiyle görüşmek için giriş yapmalısınız.</p>
            <a href="login.html" class="btn rounded-pill px-4 py-2 fw-bold text-white shadow-sm" style="background-color: #A64D32;">
                <i class="fa-solid fa-right-to-bracket me-2"></i>Giriş Yap
            </a>
        </div>
    `;
}

// --- MESAJ GÖNDERME İŞLEMLERİ ---

function openMessageModal() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        if(typeof Swal !== 'undefined') {
             Swal.fire({
                icon: 'warning',
                title: 'Giriş Yapmalısınız',
                text: 'Mesaj göndermek için lütfen giriş yapın.',
                confirmButtonColor: '#A64D32'
            }).then(() => { window.location.href = 'login.html'; });
        } else {
            alert("Mesaj göndermek için giriş yapmalısınız.");
            window.location.href = 'login.html';
        }
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('user')); 
    
    if (currentUser && String(currentUser.id) === String(currentPetOwnerId)) {
        if(typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'info',
                title: 'Bu İlan Sizin 🐾',
                text: 'Kendi ilanınıza mesaj gönderemezsiniz.',
                confirmButtonColor: '#A64D32',
                background: '#F9F6F0',
                color: '#3E2723'
            });
        } else {
            alert("Bu sizin kendi ilanınız! Kendinize mesaj gönderemezsiniz.");
        }
        return; 
    }

    const modalEl = document.getElementById('messageModal');
    if(modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
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
                receiver_id: currentPetOwnerId, 
                pet_id: currentPetId,
                post_type: 'breeding',  
                message: msgText
            })
        });

        if(res.ok) {
            if(typeof Swal !== 'undefined') Swal.fire({icon: 'success', title: 'İletildi!', confirmButtonColor: '#A64D32'});
            else alert("Mesajınız iletildi!");
            
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