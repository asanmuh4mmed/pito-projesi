document.addEventListener('DOMContentLoaded', async () => {
    // 1. URL'den ID'yi ve Token'ı al
    const params = new URLSearchParams(window.location.search);
    const petId = params.get('id');
    const token = localStorage.getItem('token');

    // Güvenlik Kontrolü
    if (!token) {
        alert("Bu işlemi yapmak için giriş yapmalısınız.");
        window.location.href = 'login.html';
        return;
    }

    if (!petId) {
        alert("Hata: Düzenlenecek ilan bulunamadı.");
        window.location.href = 'pets.html';
        return;
    }

    // --- MEVCUT BİLGİLERİ GETİR ---
    try {
        const response = await fetch(`http://localhost:3001/api/pets/${petId}`);
        const pet = await response.json();

        if (response.ok) {
            // Formu doldur
            document.getElementById('name').value = pet.name;
            document.getElementById('species').value = pet.species;
            document.getElementById('gender').value = pet.gender;
            document.getElementById('age').value = pet.age;
            document.getElementById('story').value = pet.story;
            
            // Resim alanını doldur ve göster
            const imgInput = document.getElementById('imageUrl');
            const imgPreview = document.getElementById('previewImage');
            
            imgInput.value = pet.imageUrl;
            imgPreview.src = pet.imageUrl;
            imgPreview.classList.remove('d-none');
        } else {
            alert('İlan bilgileri yüklenemedi: ' + pet.message);
        }
    } catch (error) {
        console.error("Veri çekme hatası:", error);
        alert('Sunucuyla bağlantı kurulamadı.');
    }

    // --- EKSTRA: RESİM LİNKİ DEĞİŞİNCE ÖNİZLEMEYİ GÜNCELLE ---
    document.getElementById('imageUrl').addEventListener('input', function() {
        const url = this.value;
        const imgPreview = document.getElementById('previewImage');
        if (url) {
            imgPreview.src = url;
            imgPreview.classList.remove('d-none');
        }
    });

    // --- GÜNCELLEME İŞLEMİ (KAYDET) ---
    document.getElementById('editPetForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Butonu pasif yap (Çift tıklamayı önlemek için)
        const btn = document.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "Güncelleniyor...";

        const updatedData = {
            name: document.getElementById('name').value,
            species: document.getElementById('species').value,
            gender: document.getElementById('gender').value,
            age: document.getElementById('age').value,
            story: document.getElementById('story').value,
            imageUrl: document.getElementById('imageUrl').value
        };

        try {
            const response = await fetch(`http://localhost:3001/api/pets/${petId}`, {
                method: 'PUT', // Güncelleme isteği
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // İzin bileti
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert('✅ İlan başarıyla güncellendi!');
                window.location.href = `pet-detail.html?id=${petId}`; // Detay sayfasına geri dön
            } else {
                const errData = await response.json();
                alert('Hata: ' + (errData.message || 'Güncelleme başarısız.'));
                btn.disabled = false;
                btn.innerText = originalText;
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Sunucu hatası.');
            btn.disabled = false;
            btn.innerText = originalText;
        }
    });
});