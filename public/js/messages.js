const API_URL = 'https://pito-projesi.onrender.com';

let myId = null;
let currentChatPartner = null;
let currentPetId = null;
let chatModalInstance = null; 
let chatRefreshInterval = null; // Canlı sohbet yenilemesi için

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Token'dan ID'yi al
    const payload = parseJwt(token);
    if(payload) {
        myId = payload.id;
        fetchMessages();
        checkUnreadStatus(); // Sayfa yüklendiğinde bildirim kontrolü
    } else {
        window.location.href = 'login.html';
    }
    
    // Modal nesnesini hazırla
    chatModalInstance = new bootstrap.Modal(document.getElementById('chatModal'));

    // Modal kapandığında yenilemeyi durdur (Performans için)
    document.getElementById('chatModal').addEventListener('hidden.bs.modal', () => {
        clearInterval(chatRefreshInterval);
    });

    // Enter tuşu ile gönderme
    const replyInput = document.getElementById('replyInput');
    if(replyInput) {
        replyInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') sendReply();
        });
    }
});

// --- 1. MESAJ LİSTESİNİ GETİR ---
async function fetchMessages() {
    const container = document.getElementById('messagesList');
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/api/my-messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const messages = await response.json();
        
        if (!Array.isArray(messages) || messages.length === 0) {
            container.innerHTML = '<div class="text-center py-5 opacity-50"><h3>Henüz mesajınız yok.</h3></div>';
            return;
        }

        // Kırmızı Nokta Kontrolü
        const unreadExists = messages.some(m => m.receiver_id === myId && m.is_read === false);
        toggleNotification(unreadExists);

        // Mesajları Grupla
        const threads = {};
        // Tarihe göre sırala (En yeni en üstte)
        messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        messages.forEach(msg => {
            const otherParticipantId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id;
            const pId = msg.pet_id || 0; 
            const threadKey = `${otherParticipantId}-${pId}`;
            
            // Sadece en son mesajı tutuyoruz
            if (!threads[threadKey]) {
                threads[threadKey] = msg;
            }
        });

        const uniqueThreads = Object.values(threads);
        
        if(document.getElementById('totalMsg')) {
            document.getElementById('totalMsg').innerText = uniqueThreads.length;
        }

        container.innerHTML = uniqueThreads.map(msg => {
            // İsimlendirme Mantığı
            let otherName = msg.sender_id === myId ? (msg.receiver_name || "İlan Sahibi") : msg.sender_name;
            if (!otherName) otherName = "Kullanıcı";

            const pId = msg.pet_id || 0;
            const chatPartnerId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id;

            // Okunmamış mesaj vurgusu (Sol kenar kırmızı çizgi)
            const unreadClass = (msg.receiver_id === myId && msg.is_read === false) ? "border-start border-5 border-danger" : "";

            return `
                <div class="card message-card shadow-sm mb-3 ${unreadClass}" onclick="openChat(${chatPartnerId}, ${pId}, '${otherName}')">
                    <div class="card-body p-3 d-flex align-items-center">
                        <div class="sender-icon me-3">
                            <i class="fa-solid ${pId === 0 ? 'fa-user-nurse' : 'fa-paw'}"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between">
                                <h6 class="fw-bold mb-1">${otherName}</h6>
                                <small class="text-muted" style="font-size:0.7rem">${new Date(msg.createdAt).toLocaleDateString('tr-TR')}</small>
                            </div>
                            <div class="mb-1">
                                <span class="badge bg-light text-clay p-0 fw-bold" style="color:#A64D32">${msg.pet_name || 'Genel'}</span>
                            </div>
                            <p class="text-muted small mb-0 text-truncate" style="max-width:300px;">
                                ${msg.sender_id === myId ? '<i class="fa-solid fa-reply fa-xs"></i> ' : ''} ${msg.message}
                            </p>
                        </div>
                    </div>
                </div>`;
        }).join('');

    } catch (error) { console.error("Mesaj listesi hatası:", error); }
}

// --- 2. SOHBET DETAYINI AÇ ---
async function openChat(otherId, petId, otherName) {
    currentChatPartner = otherId;
    currentPetId = petId;
    
    document.getElementById('chatPartnerName').innerText = otherName;
    document.getElementById('chatSubjectName').innerText = petId === 0 ? "Genel Sohbet" : `İlan #${petId}`;
    
    chatModalInstance.show();
    
    // İlk yükleme
    await loadChatHistory();

    // Otomatik Yenileme (Polling) Başlat - 3 saniyede bir
    clearInterval(chatRefreshInterval);
    chatRefreshInterval = setInterval(loadChatHistory, 3000);
}

// --- GEÇMİŞİ YÜKLE (Yardımcı Fonksiyon) ---
async function loadChatHistory() {
    const token = localStorage.getItem('token');
    const chatBody = document.getElementById('chatBody');
    
    // İlk açılışta boşsa spinner koy (Sadece ilk seferde)
    if(chatBody.innerHTML === '') {
        chatBody.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-secondary"></div></div>';
    }

    try {
        const response = await fetch(`${API_URL}/api/messages/thread/${currentChatPartner}/${currentPetId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const history = await response.json();

        // Scroll konumunu korumak için kontrol (Yeni mesaj geldi mi?)
        const isAtBottom = chatBody.scrollHeight - chatBody.scrollTop === chatBody.clientHeight;
        const oldHeight = chatBody.scrollHeight;

        chatBody.innerHTML = history.map(m => `
            <div class="chat-bubble ${m.sender_id === myId ? 'bubble-me' : 'bubble-other'}">
                ${m.message}
                <div class="text-end" style="font-size: 0.6rem; opacity: 0.7; margin-top: 4px;">
                    ${new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        `).join('');

        // Eğer kullanıcı en alttaysa veya yeni açıldıysa aşağı kaydır
        if(isAtBottom || oldHeight < 100) { // 100px spinner payı
            chatBody.scrollTop = chatBody.scrollHeight;
        }

    } catch (e) { console.error("Sohbet yüklenemedi", e); }
}

// --- 3. YANIT GÖNDER ---
async function sendReply() {
    const input = document.getElementById('replyInput');
    const token = localStorage.getItem('token');
    const msgText = input.value.trim();
    
    if (!msgText) return;

    // Arayüze "Fake" mesaj ekle (Hız hissi için)
    const chatBody = document.getElementById('chatBody');
    chatBody.innerHTML += `
        <div class="chat-bubble bubble-me">
            ${msgText}
            <div class="text-end" style="font-size: 0.6rem; opacity: 0.7; margin-top: 4px;">Şimdi</div>
        </div>`;
    chatBody.scrollTop = chatBody.scrollHeight;
    input.value = ''; 

    try {
        const response = await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                receiver_id: currentChatPartner,
                pet_id: currentPetId,
                message: msgText
            })
        });

        if (!response.ok) {
            // Hata olursa inputa geri yaz
            input.value = msgText;
            alert("Mesaj gönderilemedi!");
        } else {
            // Başarılı olursa listeyi arka planda yenile (son mesaj güncellensin)
            fetchMessages(); 
        }
    } catch (e) { console.error("Gönderim hatası:", e); }
}

// --- BİLDİRİM NOKTASI FONKSİYONU ---
function toggleNotification(show) {
    // HTML'deki .notification-dot sınıfını hedefliyoruz
    const badge = document.querySelector('.notification-dot');
    if(badge) {
        badge.style.display = show ? 'block' : 'none';
    }
}

// --- YARDIMCI: JWT ÇÖZÜCÜ ---
function parseJwt(token) { 
    try { 
        return JSON.parse(atob(token.split('.')[1])); 
    } catch (e) { 
        return null; 
    } 
}

// --- YARDIMCI: SADECE BİLDİRİM KONTROLÜ ---
async function checkUnreadStatus() {
    const token = localStorage.getItem('token');
    if(!token) return;

    try {
        const response = await fetch(`${API_URL}/api/my-messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const messages = await response.json();
        const hasUnread = messages.some(m => m.receiver_id === myId && m.is_read === false);
        toggleNotification(hasUnread);
    } catch(e) { console.log("Bildirim kontrol hatası", e); }
}