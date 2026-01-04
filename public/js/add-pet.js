document.getElementById('addPetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Giriş kontrolü
    const token = localStorage.getItem('token');
    if(!token) { 
        alert("İlan vermek için giriş yapmalısınız."); 
        window.location.href='login.html'; 
        return; 
    }

    // 2. Dosya kontrolü
    const fileInput = document.getElementById('petImage');
    if (fileInput.files.length === 0) {
        alert("Lütfen bir fotoğraf seçin.");
        return;
    }

    // 3. Verileri Paketle (FormData Kullanımı ŞARTTIR)
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('species', document.getElementById('species').value);
    formData.append('age', document.getElementById('age').value);
    formData.append('gender', document.getElementById('gender').value);
    formData.append('story', document.getElementById('story').value);
    
    // 'petImage' ismi server.js'deki upload.single('petImage') ile AYNI OLMALIDIR
    formData.append('petImage', fileInput.files[0]);

    try {
        const res = await fetch('http://localhost:3001/api/pets', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}` 
                // DİKKAT: 'Content-Type': 'application/json' BURADA KULLANILMAZ!
                // FormData otomatik olarak doğru başlığı ayarlar.
            },
            body: formData
        });

        if(res.ok) {
            alert("İlan başarıyla yayınlandı! 🐾");
            window.location.href = 'pets.html';
        } else {
            const error = await res.json();
            alert("Hata: " + error.message);
        }
    } catch(err) { 
        console.error("Bağlantı hatası:", err);
        alert("Sunucuyla bağlantı kurulamadı.");
    }
});