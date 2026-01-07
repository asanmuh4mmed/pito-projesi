// user-profile.js (Temiz ve Stabil)
const API_URL = 'https://pitopets.com'; 
let profileUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (urlParams.get('id')) {
        profileUserId = urlParams.get('id');
    } else if (storedUser) {
        profileUserId = storedUser.id;
    } else {
        window.location.href = 'login.html'; 
        return;
    }

    await loadUserProfile();
});

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_URL}/api/users/profile/${profileUserId}`, { headers });
        if (!res.ok) throw new Error("Profil yüklenemedi");

        const data = await res.json();
        renderProfile(data);
        renderTabs(data.listings);

    } catch (err) {
        console.error(err);
        document.querySelector('.container.mt-5').innerHTML = `<div class="alert alert-danger text-center">Kullanıcı bulunamadı.</div>`;
    }
}

function renderProfile(data) {
    const user = data.user;
    const stats = data.stats;
    const isMe = isCurrentUser(user.id);

    document.getElementById('profileName').innerText = user.name;
    document.getElementById('profileAbout').innerText = user.about_me || "Henüz biyografi yok.";
    
    const imgUrl = user.profileimageurl 
        ? (user.profileimageurl.startsWith('http') ? user.profileimageurl : `${API_URL}${user.profileimageurl}`)
        : 'https://via.placeholder.com/150';
    document.getElementById('profileImage').src = imgUrl;

    document.getElementById('followerCount').querySelector('h4').innerText = stats.followers;
    document.getElementById('followingCount').querySelector('h4').innerText = stats.following;

    const btnContainer = document.getElementById('profileActionBtn');
    if (isMe) {
        btnContainer.innerHTML = `<a href="profile.html" class="btn btn-outline-secondary rounded-pill px-4">Kendi Profilim</a>`;
    } else {
        updateFollowButton(stats.isFollowing);
    }
}

function updateFollowButton(isFollowing) {
    const btnContainer = document.getElementById('profileActionBtn');
    let followBtn = isFollowing 
        ? `<button onclick="toggleFollow()" class="btn btn-secondary rounded-pill px-4 me-2">Takip Ediliyor</button>`
        : `<button onclick="toggleFollow()" class="btn btn-primary rounded-pill px-4 me-2" style="background-color: #A64D32; border:none;">Takip Et</button>`;

    const msgBtn = `<button onclick="openMessageModal()" class="btn btn-outline-dark rounded-pill px-4"><i class="fa-regular fa-paper-plane me-2"></i>Mesaj</button>`;
    btnContainer.innerHTML = followBtn + msgBtn;
}

// Diğer fonksiyonlar (toggleFollow, renderTabs vb.) olduğu gibi kalabilir. 
// Bu kısım mesajlaşma sayfasını etkilemez.