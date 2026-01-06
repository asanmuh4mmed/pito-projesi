// --- js/pet-detail.js ---

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
        
        // Eğer ilan veritabanında yoksa (404 hatası)
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
            // Sahiplendirildiyse mesaj butonunu gizle
            if(contactBtnArea) contactBtnArea.style.display = 'none';
        }

        // --- GÜVENLİK VE SAHİP BİLGİSİ ---
        const token = localStorage.getItem('token');
        const ownerBox = document.querySelector('.owner-box-otantik'); 

        if (token) {
            // -- GİRİŞ YAPILMIŞSA --
            const oName = pet.ownername || pet.ownerName || "İsimsiz Kullanıcı";
            const oEmail = pet.owneremail || pet.ownerEmail || "E-posta gizli";
            
            // >> İSMİ LİNKE ÇEVİRME KISMI <<
            const ownerNameEl = document.getElementById('ownerName');
            if(ownerNameEl) {
                ownerNameEl.innerHTML = `
                    <a href="user-profile.html?id=${pet.user_id}" class="text-decoration-none hover-link" style="color: #3E2723;">
                        ${oName} <i class="fa-solid fa-arrow-up-right-from-square small ms-1 text-muted"></i>
                    </a>
                `;
            }

            setText('ownerEmail', oEmail);
            
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

        // Yükleme ekranını kapat, içeriği göster
        if(loadingSpinner) loadingSpinner.classList.add('d-none');
        if(content) content.classList.remove('d-none');

    } catch (error) {
        console.error("Detay hatası:", error);
        showError();
    }
});

// Yardımcı Fonksiyon: ID kontrolü yaparak text atama
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

// --- MESAJLAŞMA FONKSİYONLARI ---
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