// --- js/register.js ---

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();

        if (response.ok) {
            // --- MODERN BAŞARI MESAJI (SweetAlert2) ---
            Swal.fire({
                title: 'Aramıza Hoş Geldin! 🎉',
                text: 'Kayıt işlemin başarıyla tamamlandı. Giriş sayfasına yönlendiriliyorsun.',
                icon: 'success',
                confirmButtonColor: '#A64D32', // Senin Kiremit Rengin
                confirmButtonText: 'Harika, Giriş Yap!',
                background: '#F9F6F0',         // Krem Arkaplan
                color: '#3E2723',              // Koyu Kahve Yazı
                timer: 3000,                   // 3 saniye sonra otomatik yönlensin (opsiyonel)
                timerProgressBar: true
            }).then((result) => {
                // Kullanıcı butona basarsa veya süre dolarsa yönlendir
                window.location.href = 'login.html';
            });

        } else {
            // --- MODERN HATA MESAJI ---
            Swal.fire({
                title: 'Kayıt Oluşturulamadı',
                text: data.message || "Bilinmeyen bir hata oluştu.",
                icon: 'error',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Tekrar Dene',
                background: '#F9F6F0',
                color: '#3E2723'
            });
        }
    } catch (err) {
        console.error("Kayıt hatası:", err);
        
        // --- BAĞLANTI HATASI MESAJI ---
        Swal.fire({
            title: 'Bağlantı Hatası',
            text: 'Sunucuyla iletişim kurulamadı. Lütfen internet bağlantınızı kontrol edin.',
            icon: 'warning',
            confirmButtonColor: '#A64D32',
            background: '#F9F6F0'
        });
    }
});