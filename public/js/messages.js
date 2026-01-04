// --- js/messages.js (RENDER UYUMLU) ---

const API_URL = 'https://pito-projesi.onrender.com'; // Render Adresi
let myId = null;
let currentChatPartner = null;
let currentPetId = null;
let chatModalInstance = null; 

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        myId = parseJwt(token).id;
        fetchMessages();
        
        // Enter tuşu ile gönder
        document.getElementById('replyInput').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') sendReply();
        });
    } else {
        window.location.href = 'login.html';
    }
});

// ANA LİSTE: Mesajları Getir
async function fetchMessages() {
    const container = document.getElementById('messagesList');
    const token = localStorage.getItem('token');

    try {
        // GÜNCELLENDİ: API_URL kullanıldı
        const response = await fetch(`${API_URL}/api/my-messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const messages = await response.json();
        
        if (messages.length === 0) {
            container.innerHTML = '<div class="text-center py-5 opacity-50"><h3>Henüz mesajınız yok.</h3></div>';
            return;
        }

        // GRUPLAMA: Aynı kişi ve aynı ilan için olan mesajları tek başlıkta topla
        const threads = {};
        messages.forEach(msg => {
            const otherParticipantId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id;
            const pId = msg.pet_id || 0; 
            const threadKey = `${otherParticipantId}-${pId}`;
            
            // Eğer daha önce eklenmemişse ekle
            if (!threads[threadKey]) {
                threads[threadKey] = msg;
            }
        });

        const uniqueThreads = Object.values(threads);
        document.getElementById('totalMsg').innerText = uniqueThreads.length;
        container.innerHTML = '';

        uniqueThreads.forEach(msg => {
            // Backend 'senderName' gönderiyor. Eğer ben gönderdiysem 'Ben', değilse gelen isim.
            let otherName = msg.senderName; 
            if(msg.sender_id === myId) {
                otherName = "Giden Mesaj"; 
            } else if (!otherName) {
                otherName = "Kullanıcı";
            }

            const pId = msg.pet_id || 0;
            const petDisplay = pId === 0 ? "Genel Sohbet" : `İlan No: #${pId}`;
            
            // Sohbeti açmak için karşı tarafın ID'sini belirliyoruz
            const chatPartnerId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id;

            container.innerHTML += `
                <div class="card message-card shadow-sm mb-3" onclick="openChat(${chatPartnerId}, ${pId}, '${otherName}')">
                    <div class="card-body p-4 d-flex align-items-center">
                        <div class="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style="width:50px; height:50px; color:#A64D32">
                            <i class="fa-solid fa-comments fa-lg"></i>
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="fw-bold mb-0">${otherName}</h6>
                            <small class="text-muted fw-bold">${petDisplay}</small>
                            <p class="text-muted small mb-0 text-truncate" style="max-width:300px;">${msg.message}</p>
                        </div>
                        <div class="text-end">
                            <small class="text-muted d-block">${new Date(msg.createdAt).toLocaleDateString('tr-TR')}</small>
                            <span class="badge bg-light text-dark border rounded-pill mt-1">Sohbeti Aç</span>
                        </div>
                    </div>
                </div>`;
        });
    } catch (error) { console.error("Hata:", error); }
}

// SOHBET PENCERESİ: Geçmişi Yükle
async function openChat(otherId, petId, otherName) {
    currentChatPartner = otherId;
    currentPetId = petId;
    
    document.getElementById('chatPartnerName').innerText = otherName;
    document.getElementById('chatSubjectName').innerText = petId === 0 ? "Genel" : `İlan #${petId}`;
    
    const token = localStorage.getItem('token');
    const chatBody = document.getElementById('chatBody');
    chatBody.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-secondary"></div></div>';
    
    // Modalı Aç
    if (!chatModalInstance) {
        chatModalInstance = new bootstrap.Modal(document.getElementById('chatModal'));
    }
    chatModalInstance.show();

    try {
        // GÜNCELLENDİ: API_URL kullanıldı
        const response = await fetch(`${API_URL}/api/messages/thread/${otherId}/${petId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const history = await response.json();

        chatBody.innerHTML = history.map(m => `
            <div class="d-flex ${m.sender_id === myId ? 'justify-content-end' : 'justify-content-start'} mb-3">
                <div class="p-3 shadow-sm ${m.sender_id === myId ? 'text-white' : 'bg-white text-dark border'}" 
                     style="max-width: 75%; border-radius: 15px; background-color: ${m.sender_id === myId ? '#A64D32' : '#fff'};">
                    <p class="mb-1">${m.message}</p>
                    <div class="text-end" style="font-size: 0.65rem; opacity: 0.8;">
                        ${new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
            </div>
        `).join('');
        
        // En aşağı kaydır
        chatBody.scrollTop = chatBody.scrollHeight;

    } catch (e) { chatBody.innerHTML = "<p class='text-danger text-center'>Sohbet yüklenemedi.</p>"; }
}

// YANIT GÖNDER
async function sendReply() {
    const input = document.getElementById('replyInput');
    const token = localStorage.getItem('token');
    const msgText = input.value.trim();
    
    if (!msgText) return;

    // Arayüzde hemen göster (Hız hissi için)
    const chatBody = document.getElementById('chatBody');
    chatBody.innerHTML += `
        <div class="d-flex justify-content-end mb-3">
            <div class="p-3 shadow-sm text-white" style="max-width: 75%; border-radius: 15px; background-color: #A64D32;">
                <p class="mb-1">${msgText}</p>
                <div class="text-end" style="font-size: 0.65rem;">Şimdi</div>
            </div>
        </div>`;
    chatBody.scrollTop = chatBody.scrollHeight;
    input.value = ''; // Inputu temizle

    // Arka planda gönder
    try {
        // GÜNCELLENDİ: API_URL kullanıldı
        const response = await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                receiverId: currentChatPartner, 
                petId: currentPetId,           
                message: msgText
            })
        });

        if (!response.ok) {
            alert("Mesaj gönderilemedi!");
        }
    } catch (e) { console.error("Gönderim hatası:", e); }
}

function parseJwt(token) { try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; } }