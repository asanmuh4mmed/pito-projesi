// --- js/add-breeding.js ---

const API_URL = 'https://pito-projesi.onrender.com';
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. FOTOĞRAF ÖNİZLEME ---
    const petImageInput = document.getElementById('petImage');
    const previewImg = document.getElementById('previewImg');
    const placeholder = document.getElementById('uploadPlaceholder');
    const previewBox = document.getElementById('imagePreviewBox');

    if (petImageInput) {
        petImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    if (previewImg) {
                        previewImg.src = event.target.result;
                        previewImg.classList.remove('d-none');
                    }
                    if (placeholder) placeholder.classList.add('d-none');
                    if (previewBox) previewBox.style.borderStyle = 'solid'; 
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // --- 2. FORM GÖNDERME ---
    const form = document.getElementById('addBreedingForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // A) Giriş Kontrolü
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user')); 

            if(!token || !user) { 
                alert("İlan vermek için giriş yapmalısınız."); 
                window.location.href='login.html'; 
                return; 
            }

            // B) Buton Animasyonu
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Yayınlanıyor...';

            // C) Verileri Hazırla
            const formData = new FormData();
            formData.append('name', document.getElementById('name').value);
            formData.append('species', document.getElementById('species').value);
            formData.append('breed', document.getElementById('breed').value);
            formData.append('age', document.getElementById('age').value);
            formData.append('gender', document.getElementById('gender').value);
            formData.append('description', document.getElementById('description').value);
            
            // --- KRİTİK 1: Profilde görünmesi için User ID ---
            formData.append('user_id', user.id); 

            // --- KRİTİK 2: Dosya Gönderimi ---
            const fileInput = document.getElementById('petImage');
            if (fileInput.files.length > 0) {
                // Backend 'upload.single("image")' kullanıyorsa burası "image" olmalı.
                // Eğer hata devam ederse burayı "petImage" veya "file" olarak değiştirmeyi dene.
                 formData.append('petImage', fileInput.files[0]);
            } else {
                alert("Lütfen bir fotoğraf yükleyin!");
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                return;
            }

            try {
                // D) Sunucuya Gönder (Doğru Adres: breeding-pets)
                const res = await fetch(`${API_URL}/api/breeding-pets`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                const data = await res.json();

                if(res.ok) {
                    alert("Harika! İlan başarıyla yayınlandı. ❤️");
                    window.location.href = 'profile.html'; 
                } else {
                    console.error("Sunucu Hatası:", data);
                    alert("Hata: " + (data.message || data.error || "İlan yüklenemedi."));
                }
            } catch(err) { 
                console.error("Bağlantı hatası:", err);
                alert("Sunucuyla bağlantı kurulamadı.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
});