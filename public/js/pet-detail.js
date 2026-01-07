// --- js/pet-detail.js (GÜNCEL - FOTOĞRAF VE MAVİ TİK EKLENDİ) ---

// Global Değişkenler
let currentPetOwnerId = null;
let currentPetId = null;
const API_BASE_URL = 'https://pitopets.com'; // Backend adresin

document.addEventListener('DOMContentLoaded', async () => {
    // URL'den ID'yi al
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('id');

    // HTML Elemanları
    const loadingSpinner = document.getElementById('loadingSpinner');
    const content = document.getElementById('petDetailContent');
    const contactBtnArea = document.getElementById('contactBtn');
    const errorAlert = document.getElementById('errorAlert');

    // ID yoksa direkt hata göster
    if (!petId) {
        showError();
        return;
    }

    try {
        // Veriyi çek
        const response = await fetch(`${API_BASE_URL}/api/pets/${petId}`);
        
        if (!response.ok) throw new Error("İlan bulunamadı");

        const pet = await response.json();

        currentPetOwnerId = pet.user_id;
        currentPetId = pet.id;

        // --- RESİM DOLDURMA ---
        const rawImg = pet.imageurl || pet.imageUrl;
        let finalImage = 'https://via.placeholder.com/600x500?text=Resim+Yok';
        
        if (rawImg) {
            finalImage = rawImg.startsWith('http') 
                ? rawImg 
                : `${API_BASE_URL}${rawImg}`;
        }
        
        const imgElem = document.getElementById('petImage');
        if(imgElem) {
            imgElem.src = finalImage;
            imgElem.onerror = function() {
                this.src = 'https://via.placeholder.com/600x500?text=Resim+Yuklenemedi';
            };
        }

        // --- METİN BİLGİLERİ DOLDURMA ---
        setText('petName', pet.name);
        setText('petSpecies', pet.species);
        setText('petGender', pet.gender);
        setText('petAge', pet.age);
        setText('petStory', pet.story || pet.description || "Hikayesi henüz eklenmemiş.");
        setText('modalPetName', pet.name);

        // --- DURUM ROZETİ ---
        const status = pet.adoptionstatus || pet.adoptionStatus; 
        const statusBadge = document.getElementById('petStatus');
        if (statusBadge && status === 'Sahiplendirildi') {
            statusBadge.innerText = "Yuva Buldu 🏠";
            statusBadge.className = "badge bg-secondary px-4 py-2 shadow-sm";
            if(contactBtnArea) contactBtnArea.style.display = 'none';
        }

        // --- GÜVENLİK VE SAHİP BİLGİSİ ---
        const token = localStorage.getItem('token');
        const ownerBox = document.querySelector('.owner-box-otantik'); 

        if (token) {
            // -- GİRİŞ YAPILMIŞSA --
            const oName = pet.ownername || pet.ownerName || "İsimsiz Kullanıcı";
            const oEmail = pet.owneremail || pet.ownerEmail || "E-posta gizli";
            
            // Profil Resmi Ayarlama
            const oImageRaw = pet.ownerimage || pet.ownerImage;
            let ownerImgUrl = 'https://via.placeholder.com/150?text=User';
            if (oImageRaw) {
                ownerImgUrl = oImageRaw.startsWith('http') ? oImageRaw : `${API_BASE_URL}${oImageRaw}`;
            }

            // Mavi Tik Kontrolü (Backend'den gelen ownerVerified verisi)
            const isVerified = (pet.ownerverified === true || pet.ownerVerified === true || pet.ownerverified === "true");
            const verifiedBadge = isVerified ? 
                `<svg class="verified-tick" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: #1da1f2; margin-left: 4px; vertical-align: text-bottom;">
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.416-.166-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 2.049 1.43 3.81 3.35 4.327a4.56 4.56 0 00-.238 1.402c0 2.21 1.71 4 3.818 4 .47 0 .92-.084 1.336-.25.62 1.333 1.926 2.25 3.437 2.25s2.816-.917 3.437-2.25c.416.166.866.25 1.336.25 2.11 0 3.818-1.79 3.818-4 0-.495-.084-.965-.238-1.402 1.92-.517 3.35-2.278 3.35-4.327zM12 17.5l-4.5-4.5 1.414-1.414L12 14.672l7.086-7.086 1.414 1.414L12 17.5z"/>
                </svg>` : '';

            // >> HTML GÜNCELLEMESİ (RESİM + İSİM + TİK) <<
            const ownerContainer = document.querySelector('.owner-info-container') || document.getElementById('ownerName').parentNode; 
            
            // Eğer özel bir kapsayıcı yoksa manuel olarak içeriği basıyoruz
            if (ownerBox) {
                ownerBox.innerHTML = `
                    <div class="d-flex align-items-center gap-3 p-3">
                        <img src="${ownerImgUrl}" class="rounded-circle shadow-sm border" style="width: 60px; height: 60px; object-fit: cover;">
                        <div>
                            <small class="text-muted fw-bold" style="font-size: 0.75rem; letter-spacing: 1px;">İLAN SAHİBİ</small>
                            <h6 class="fw-bold mb-0 mt-1" style="color: #3E2723;">
                                <a href="user-profile.html?id=${pet.user_id}" class="text-decoration-none text-dark hover-link">
                                    ${oName} ${verifiedBadge}
                                </a>
                            </h6>
                            <small class="text-muted">${oEmail}</small>
                        </div>
                    </div>
                `;
            }

            // Mesaj butonu kontrolü
            if (status !== 'Sahiplendirildi' && contactBtnArea) {
                contactBtnArea.style.display = 'block';
            }

        } else {
            // -- GİRİŞ YAPILMAMIŞSA --
            if (ownerBox) {
                ownerBox.innerHTML = `
                    <div class="text-center w-100 py-3">
                        <i class="fa-solid fa-lock fa-2x mb-2" style="color: #A64D32;"></i>
                        <h5 class="fw-bold" style="color: #3E2723;">İletişim Bilgileri Gizli</h5>
                        <p class="text-muted small mb-3">İlan sahibiyle görüşmek için giriş yapmalısınız.</p>
                        <a href="login.html" class="btn btn-sm text-white rounded-pill px-4" style="background-color: #A64D32;">
                            <i class="fa-solid fa-right-to-bracket me-1"></i> Giriş Yap
                        </a>
                    </div>
                `;
            }
            if(contactBtnArea) contactBtnArea.style.display = 'none';
        }

        if(loadingSpinner) loadingSpinner.classList.add('d-none');
        if(content) content.classList.remove('d-none');

    } catch (error) {
        console.error("Detay hatası:", error);
        showError();
    }
});

function setText(id, text) {
    const el = document.getElementById(id);
    if(el) el.innerText = text || '-';
}

function showError() {
    const spinner = document.getElementById('loadingSpinner');
    const alertBox = document.getElementById('errorAlert');
    if(spinner) spinner.classList.add('d-none');
    if(alertBox) alertBox.classList.remove('d-none');
}

function openMessageModal() {
    const token = localStorage.getItem('token');
    if (!token) {
        if(typeof Swal !== 'undefined') Swal.fire({icon:'warning', title:'Giriş Yapmalısın'});
        else window.location.href = 'login.html';
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
    const msgText = msgInput.value;
    const token = localStorage.getItem('token');

    if (!msgText.trim()) {
        alert("Lütfen bir mesaj yazın.");
        return;
    }

    const sendBtn = document.querySelector('#messageModal .btn-primary');
    if(sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerText = "Gönderiliyor...";
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                receiver_id: currentPetOwnerId, 
                pet_id: currentPetId,
                post_type: 'adoption', 
                message: msgText
            })
        });

        if (response.ok) {
            if(typeof Swal !== 'undefined') Swal.fire({icon:'success', title:'Mesaj İletildi!'});
            else alert("Mesajınız iletildi!");
            
            const modalEl = document.getElementById('messageModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if(modalInstance) modalInstance.hide();
            msgInput.value = ""; 
        } else {
            const err = await response.json();
            alert("Hata: " + (err.message || "Mesaj gönderilemedi."));
        }
    } catch (error) {
        console.error("Mesaj hatası:", error);
        alert("Sunucu hatası.");
    } finally {
        if(sendBtn) {
            sendBtn.disabled = false;
            sendBtn.innerText = "Gönder";
        }
    }
}