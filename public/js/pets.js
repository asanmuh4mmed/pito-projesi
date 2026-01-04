const API_URL = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', async () => {
    // HTML'deki ID ile buradaki ID aynı olmalı.
    const list = document.getElementById('petsList'); 
    const filterSpecies = document.getElementById('filterSpecies');
    const filterGender = document.getElementById('filterGender');
    const btnReset = document.getElementById('btnReset');

    // Eğer list elementi bulunamazsa konsola hata bas ve dur
    if (!list) {
        console.error("HATA: HTML dosyasında 'petsList' id'li bir div bulunamadı!");
        return;
    }

    let allPetsData = []; 

    async function loadPets() {
        try {
            console.log("Veriler çekiliyor...");
            const res = await fetch(`${API_URL}/api/pets`);
            
            if (!res.ok) throw new Error(`Sunucu Hatası: ${res.status}`);
            
            const data = await res.json();
            console.log("Gelen Veri:", data);

            // --- FİLTRELEME ---
            // Sadece 'Sahiplendirme' olanları veya türü belirtilmemiş (eski) kayıtları al
            allPetsData = data.filter(pet => pet.tur === 'Sahiplendirme' || !pet.tur);

            renderPets(allPetsData);

        } catch (error) {
            console.error("Hata Detayı:", error);
            list.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger d-inline-block">
                        Veriler yüklenemedi. Sunucunun çalıştığından emin olun.<br>
                        <small>${error.message}</small>
                    </div>
                </div>`;
        }
    }

    function renderPets(pets) {
        list.innerHTML = ''; // Önce temizle (Spinner gider)

        if (pets.length === 0) {
            list.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-light border">Kriterlere uygun ilan bulunamadı.</div>
                </div>`;
            return;
        }

        pets.forEach(pet => {
            // --- SUPABASE İÇİN DEĞİŞKEN DÜZELTMELERİ ---
            // PostgreSQL sütunları küçük harfe çevirdiği için her iki ihtimali de kontrol ediyoruz.
            
            // 1. Resim Yolu Kontrolü
            const rawImg = pet.imageurl || pet.imageUrl;
            let finalImage = 'https://via.placeholder.com/400x300?text=Resim+Yok';
            
            if (rawImg) {
                // Eğer http ile başlıyorsa olduğu gibi al, değilse sunucu adresini ekle
                finalImage = rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`;
            }

            // 2. Sahiplendirme Durumu Kontrolü (adoptionStatus vs adoptionstatus)
            const status = pet.adoptionstatus || pet.adoptionStatus;
            const isAdopted = status === 'Sahiplendirildi';

            // HTML Kart Yapısı
            const card = `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0 ${isAdopted ? 'opacity-75' : ''}">
                        <div class="position-relative overflow-hidden rounded-top">
                             ${isAdopted ? '<span class="position-absolute top-0 end-0 m-3 badge bg-secondary">Yuva Buldu</span>' : ''}
                            <img src="${finalImage}" class="card-img-top" style="height: 250px; object-fit: cover;" alt="${pet.name}" onerror="this.src='https://via.placeholder.com/400x300?text=Hata'">
                        </div>
                        <div class="card-body p-4">
                            <h5 class="card-title fw-bold">${pet.name}</h5>
                            <div class="d-flex gap-2 mb-3">
                                <span class="badge bg-light text-dark border">${pet.species || '?'}</span>
                                <span class="badge bg-light text-dark border">${pet.gender || '-'}</span>
                            </div>
                            
                            ${isAdopted ? 
                                `<button class="btn btn-secondary w-100 disabled">Sahiplendirildi</button>` : 
                                `<a href="pet-detail.html?id=${pet.id}&type=adoption" class="btn btn-outline-primary w-100 rounded-pill">Detayları Gör</a>`
                            }
                        </div>
                    </div>
                </div>
            `;
            list.innerHTML += card;
        });
    }

    // Filtreleme Fonksiyonu
    function applyFilters() {
        const speciesVal = filterSpecies ? filterSpecies.value : 'all';
        const genderVal = filterGender ? filterGender.value : 'all';

        const filtered = allPetsData.filter(pet => {
            const matchSpecies = (speciesVal === 'all') || (pet.species === speciesVal);
            const matchGender = (genderVal === 'all') || (pet.gender === genderVal);
            return matchSpecies && matchGender;
        });

        renderPets(filtered);
    }

    // Event Listeners
    if(filterSpecies) filterSpecies.addEventListener('change', applyFilters);
    if(filterGender) filterGender.addEventListener('change', applyFilters);
    
    if(btnReset) {
        btnReset.addEventListener('click', () => {
            filterSpecies.value = 'all';
            filterGender.value = 'all';
            renderPets(allPetsData);
        });
    }

    // Başlat
    loadPets();
});