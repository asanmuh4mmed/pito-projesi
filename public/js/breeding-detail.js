// --- js/breeding-detail.js (SUPABASE UYUMLU) ---

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
        
        // Hata kontrolü
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
        // Giriş yapılmışsa bilgileri göster
        const oName = pet.ownername || pet.ownerName || pet.users_name || "Kullanıcı";
        // TELEFON BİLGİSİ SİLİNDİ
        const oEmail = pet.owneremail || pet.ownerEmail || pet.users_email;

        setText('ownerName', oName);
        // TELEFON SET EDİLMİYOR
        setLink('displayEmail', oEmail, 'mailto');

        if(messageBtn) messageBtn.style.display = 'block';
    } else {
        // Giriş yapılmamışsa gizle
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

// Yardımcı Fonksiyon: Link oluştur (mailto:)
function setLink(id, value, prefix) {
    const el = document.getElementById(id);
    if (!el) return;
    
    if (value) {
        el.innerText = value;
        el.href = `${prefix}:${value}`;
    } else {
        el.innerText = "Belirtilmemiş";
        el.removeAttribute('href');
    }
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
            alert("Mesajınız iletildi! ❤️");
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