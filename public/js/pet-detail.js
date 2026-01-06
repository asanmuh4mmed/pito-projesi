// --- js/pet-detail.js (SUPABASE UYUMLU - PROFİL LİNKLİ) ---

// Global Değişkenler
let currentPetOwnerId = null;
let currentPetId = null;
const API_BASE_URL = 'https://pito-projesi.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('id');

    const loadingSpinner = document.getElementById('loadingSpinner');
    const content = document.getElementById('petDetailContent');
    const contactBtnArea = document.getElementById('contactBtn');
    const errorAlert = document.getElementById('errorAlert');

    if (!petId) {
        showError();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/pets/${petId}`);
        if (!response.ok) throw new Error("İlan bulunamadı");

        const pet = await response.json();

        currentPetOwnerId = pet.user_id;
        currentPetId = pet.id;

        // --- RESİM AYARLARI ---
        const rawImg = pet.imageurl || pet.imageUrl;
        let finalImage = 'https://via.placeholder.com/600x400?text=Resim+Yok';
        
        if (rawImg) {
            finalImage = rawImg.startsWith('http') 
                ? rawImg 
                : `${API_BASE_URL}${rawImg}`;
        }
        
        const imgElem = document.getElementById('petImage');
        imgElem.src = finalImage;
        imgElem.onerror = function() {
            this.src = 'https://via.placeholder.com/600x400?text=Resim+Yuklenemedi';
        };

        // --- METİN İÇERİKLERİ ---
        document.getElementById('petName').innerText = pet.name;
        document.getElementById('petSpecies').innerText = pet.species;
        document.getElementById('petGender').innerText = pet.gender;
        document.getElementById('petAge').innerText = pet.age;
        document.getElementById('petStory').innerText = pet.story || pet.description;
        document.getElementById('modalPetName').innerText = pet.name;

        // --- DURUM ROZETİ ---
        const status = pet.adoptionstatus || pet.adoptionStatus; 
        const statusBadge = document.getElementById('petStatus');
        
        if (status === 'Sahiplendirildi') {
            statusBadge.innerText = "Yuva Buldu ❤️";
            statusBadge.className = "badge bg-secondary mb-3 fs-6";
        }

        // --- GÜVENLİK VE GİZLİLİK KONTROLÜ ---
        const token = localStorage.getItem('token');
        const ownerBox = document.querySelector('.owner-box-otantik'); 

        if (token) {
            // -- GİRİŞ YAPILMIŞSA: Bilgileri Göster --
            const oName = pet.ownername || pet.ownerName || pet.users_name;
            const oEmail = pet.owneremail || pet.ownerEmail || pet.users_email || "";
            
            // +++ GÜNCELLEME: İsim alanını Tıklanabilir Link Yapıyoruz +++
            const ownerNameEl = document.getElementById('ownerName');
            ownerNameEl.innerHTML = `
                <a href="user-profile.html?id=${pet.user_id}" class="text-decoration-none hover-link" style="color: #3E2723;">
                    ${oName} <i class="fa-solid fa-arrow-up-right-from-square small ms-1 text-muted"></i>
                </a>
            `;
            // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

            document.getElementById('ownerEmail').innerText = oEmail;
            
            // Eğer sahiplendirilmişse butonu pasif yap
            if (status === 'Sahiplendirildi') {
                contactBtnArea.innerHTML = `
                    <button class="btn btn-secondary w-100 p-3 rounded-4 disabled">
                        Bu Dostumuz Sahiplendirildi
                    </button>`;
            } else {
                contactBtnArea.style.display = 'block';
            }

        } else {
            // -- GİRİŞ YAPILMAMIŞSA: Bilgileri Gizle --
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

        // Yükleme bitti
        loadingSpinner.classList.add('d-none');
        content.classList.remove('d-none');

    } catch (error) {
        console.error("Detay hatası:", error);
        showError();
    }
});

function showError() {
    document.getElementById('loadingSpinner').classList.add('d-none');
    const errorAlert = document.getElementById('errorAlert');
    if(errorAlert) errorAlert.classList.remove('d-none');
}

// --- MESAJLAŞMA ---
function openMessageModal() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    const modal = new bootstrap.Modal(document.getElementById('messageModal'));
    modal.show();
}

async function sendMessage() {
    const messageInput = document.getElementById('messageText');
    const messageText = messageInput.value;
    const token = localStorage.getItem('token');

    if (!messageText.trim()) {
        alert("Lütfen bir mesaj yazın.");
        return;
    }

    const sendBtn = document.querySelector('#messageModal .btn-primary');
    const sendBtnOriginalText = sendBtn.innerText;
    sendBtn.disabled = true;
    sendBtn.innerText = "Gönderiliyor...";

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
                message: messageText
            })
        });

        if (response.ok) {
            alert("Mesajınız başarıyla iletildi! 🐾");
            const modalElem = document.getElementById('messageModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElem);
            modalInstance.hide();
            messageInput.value = ""; 
        } else {
            const err = await response.json();
            alert("Hata: " + (err.message || "Mesaj gönderilemedi."));
        }
    } catch (error) {
        console.error("Mesaj hatası:", error);
        alert("Sunucu hatası.");
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerText = sendBtnOriginalText || "Gönder";
    }
}