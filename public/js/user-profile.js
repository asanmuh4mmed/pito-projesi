const API_URL = 'https://pitopets.com';
let targetUserId = null;
let isFollowing = false;

document.addEventListener('DOMContentLoaded', async () => {
    // URL'den ID'yi al (user-profile.html?id=5 gibi)
    const params = new URLSearchParams(window.location.search);
    targetUserId = params.get('id');

    if (!targetUserId) {
        if(typeof Swal !== 'undefined') {
            Swal.fire({icon: 'error', title: 'Hata', text: 'Kullanıcı bulunamadı!'})
            .then(() => window.location.href = 'index.html');
        } else {
            alert("Kullanıcı belirtilmedi!");
            window.location.href = 'index.html';
        }
        return;
    }

    await loadUserProfile();
});

async function loadUserProfile() {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    try {
        const res = await fetch(`${API_URL}/api/users/profile/${targetUserId}`, { headers });
        if (!res.ok) throw new Error("Profil alınamadı");

        const data = await res.json();
        const { user, stats, listings } = data;

        // 1. Profil Bilgilerini Doldur
        document.getElementById('userName').innerText = user.name;
        document.getElementById('userAbout').innerText = user.about_me || "Henüz bir biyografi eklenmemiş.";
        
        // Resim Kontrolü
        let img = user.profileimageurl || 'https://via.placeholder.com/150';
        // Eğer resim linki http ile başlamıyorsa başına API_URL ekle (Supabase için)
        if(img && !img.startsWith('http')) img = API_URL + img;
        
        document.getElementById('userImage').src = img;

        // 2. İstatistikler
        document.getElementById('followersCount').innerText = stats.followers;
        document.getElementById('followingCount').innerText = stats.following;

        // 3. Takip Butonu Durumu
        isFollowing = stats.isFollowing;
        updateFollowButton();

        // Kendi profilimse "Takip Et" butonunu gizle
        const myPayload = parseJwt(token);
        if (myPayload && myPayload.id == targetUserId) {
            const btn = document.getElementById('followBtn');
            if(btn) btn.style.display = 'none';
        }

        // 4. İlanları Listele
        renderListings(listings);

    } catch (err) {
        console.error(err);
        document.getElementById('userListings').innerHTML = '<div class="col-12 text-center text-muted">Profil yüklenirken hata oluştu veya kullanıcı bulunamadı.</div>';
    }
}

function renderListings(listings) {
    const container = document.getElementById('userListings');
    if (listings.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-5"><h5>Bu kullanıcının henüz aktif ilanı yok. 🐾</h5></div>';
        return;
    }

    let html = '';
    listings.forEach(pet => {
        // Resim yolu düzeltmesi
        let imgUrl = 'https://via.placeholder.com/300';
        if (pet.imageurl) {
            imgUrl = pet.imageurl.startsWith('http') ? pet.imageurl : API_URL + pet.imageurl;
        }
        
        const badge = pet.type === 'adoption' ? '<span class="badge bg-success">Sahiplendirme</span>' : '<span class="badge bg-danger">Eş Bulma</span>';
        const link = pet.type === 'adoption' ? 'pets.html' : 'breeding.html';

        html += `
        <div class="col-md-6 col-lg-4">
            <div class="card pet-card h-100 bg-white">
                <div class="position-relative">
                    <img src="${imgUrl}" class="card-img-top" alt="${pet.name}" onerror="this.src='https://via.placeholder.com/300'">
                    <div class="position-absolute top-0 start-0 m-3">${badge}</div>
                </div>
                <div class="card-body text-center">
                    <h5 class="fw-bold mb-1">${pet.name}</h5>
                    <p class="text-muted small">${pet.species || ''} • ${pet.age || ''}</p>
                    <a href="${link}" class="btn btn-sm btn-outline-dark rounded-pill px-4">İlana Git</a>
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

// TAKİP ET / BIRAK BUTONU
async function toggleFollow() {
    const token = localStorage.getItem('token');
    if (!token) {
        if(typeof Swal !== 'undefined') {
            Swal.fire({ icon: 'warning', title: 'Giriş Yapmalısın', text: 'Takip etmek için lütfen giriş yap.', confirmButtonColor: '#A64D32' });
        } else {
            alert("Giriş yapmalısın!");
        }
        return;
    }

    const btn = document.getElementById('followBtn');
    btn.disabled = true;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const res = await fetch(`${API_URL}/api/users/follow`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ targetId: targetUserId })
        });

        const result = await res.json();
        
        if (result.status === 'followed') {
            isFollowing = true;
            // Takipçi sayısını artır
            let count = parseInt(document.getElementById('followersCount').innerText);
            document.getElementById('followersCount').innerText = count + 1;
        } else {
            isFollowing = false;
            // Takipçi sayısını azalt
            let count = parseInt(document.getElementById('followersCount').innerText);
            document.getElementById('followersCount').innerText = Math.max(0, count - 1);
        }
        updateFollowButton();

    } catch (err) {
        console.error(err);
        alert("İşlem başarısız.");
    } finally {
        btn.disabled = false;
        if(btn.innerHTML.includes('spinner')) btn.innerHTML = originalContent; // Hata durumunda eski haline dön
    }
}

function updateFollowButton() {
    const btn = document.getElementById('followBtn');
    if (isFollowing) {
        btn.innerHTML = '<i class="fa-solid fa-check me-2"></i> Takip Ediliyor';
        btn.classList.add('following');
    } else {
        btn.innerHTML = '<i class="fa-solid fa-user-plus me-2"></i> Takip Et';
        btn.classList.remove('following');
    }
}

// Basit JWT Token Çözücü
function parseJwt (token) {
    try {
        if(!token) return null;
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}