const API_URL = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    loadPets();
});

function updateNavbar() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const navbarList = document.querySelector('.navbar-nav'); 
    if (!navbarList) return;

    const commonLinks = `
        <li class="nav-item"><a class="nav-link" href="index.html">Ana Sayfa</a></li>
        <li class="nav-item"><a class="nav-link" href="vets.html">Veteriner Bul</a></li>
        <li class="nav-item"><a class="nav-link active fw-bold text-love" href="breeding.html">Eş Bul</a></li>
        <li class="nav-item"><a class="nav-link" href="pets.html">Sahiplen</a></li> 
        <li class="nav-item"><a class="nav-link" href="caretakers.html">Bakıcılar</a></li>
    `;

    if (token && userStr) {
        navbarList.innerHTML = `
            ${commonLinks}
            <li class="nav-item"><a class="nav-link" href="messages.html">Mesajlar</a></li>
            <li class="nav-item"><a class="nav-link" href="profile.html">Profilim</a></li>
            <li class="nav-item ms-2"><a href="add-breeding.html" class="btn btn-love rounded-pill px-3"><i class="fa-solid fa-plus"></i> İlan Ver</a></li>
            <li class="nav-item ms-2"><button onclick="logout()" class="btn btn-sm btn-outline-danger rounded-pill px-3 mt-1">Çıkış</button></li>
        `;
    } else {
        navbarList.innerHTML = `
            ${commonLinks}
            <li class="nav-item ms-2"><a class="btn btn-sm btn-outline-primary rounded-pill px-3" href="login.html">Giriş Yap</a></li>
            <li class="nav-item ms-1"><a class="btn btn-sm btn-primary rounded-pill px-3 mt-1 text-white" href="register.html">Kayıt Ol</a></li>
        `;
    }
}

let allBreedingPets = [];

async function loadPets() {
    const list = document.getElementById('breedingList');
    if (!list) return;

    try {
        // DOĞRUDAN EŞ BULMA TABLOSUNDAN ÇEKİYORUZ
        const res = await fetch(`${API_URL}/api/breeding-pets`);
        if (!res.ok) throw new Error("Veri çekilemedi");
        
        allBreedingPets = await res.json();
        renderPets(allBreedingPets);

    } catch (error) {
        console.error("Hata:", error);
        list.innerHTML = `<div class="col-12 text-center text-danger">Veriler yüklenemedi.</div>`;
    }
}

function renderPets(pets) {
    const list = document.getElementById('breedingList');
    list.innerHTML = '';

    if (pets.length === 0) {
        list.innerHTML = `<div class="col-12 text-center py-5"><p class="text-muted">Şu an eş arayan bir dostumuz yok.</p></div>`;
        return;
    }

pets.forEach(pet => {
    let imgUrl = 'https://via.placeholder.com/400x300?text=Resim+Yok';
    
    // Veritabanı bazen 'imageurl' (küçük harf) bazen 'imageUrl' gönderebilir. İkisini de kontrol edelim:
    const resimVerisi = pet.imageUrl || pet.imageurl; 

    if (resimVerisi) {
        // Eğer resim http ile başlıyorsa (Supabase) olduğu gibi al, yoksa başına localhost ekle
        imgUrl = resimVerisi.startsWith('http') ? resimVerisi : `${API_URL}${resimVerisi}`;
    }

        list.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <div class="position-relative">
                        <img src="${imgUrl}" class="card-img-top" style="height: 250px; object-fit: cover;">
                        <span class="badge bg-danger position-absolute top-0 end-0 m-3 shadow-sm">
                            <i class="fa-solid fa-heart"></i> Eş Arıyor
                        </span>
                    </div>
                    <div class="card-body p-4 text-center">
                        <h5 class="card-title fw-bold" style="color: #d63384;">${pet.name}</h5>
                        <div class="d-flex justify-content-center gap-2 mb-3">
                            <span class="badge bg-light text-dark border">${pet.species}</span>
                            <span class="badge bg-light text-dark border">${pet.gender}</span>
                        </div>
                        
                        <a href="breeding-detail.html?id=${pet.id}" class="btn btn-outline-danger w-100 rounded-pill fw-bold" style="border-color: #d63384; color: #d63384;">
                            Adayı İncele
                        </a>
                    </div>
                </div>
            </div>`;
    });
}

// Filtreleme
const filterSpecies = document.getElementById('filterSpecies');
const filterGender = document.getElementById('filterGender');
const btnReset = document.getElementById('btnReset');

function applyFilters() {
    const sVal = filterSpecies.value;
    const gVal = filterGender.value;
    const filtered = allBreedingPets.filter(p => 
        (sVal === 'all' || p.species === sVal) && 
        (gVal === 'all' || p.gender === gVal)
    );
    renderPets(filtered);
}

if(filterSpecies) filterSpecies.addEventListener('change', applyFilters);
if(filterGender) filterGender.addEventListener('change', applyFilters);
if(btnReset) btnReset.addEventListener('click', () => {
    filterSpecies.value = 'all';
    filterGender.value = 'all';
    renderPets(allBreedingPets);
});

window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}