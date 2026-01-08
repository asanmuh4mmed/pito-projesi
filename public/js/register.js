document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value; // Yeni Alan

    // --- 1. ŞİFRE KONTROLÜ (VALIDATION) ---
    if (password !== confirmPassword) {
        Swal.fire({
            title: 'Şifreler Uyuşmuyor!',
            text: 'Lütfen girdiğiniz şifrelerin aynı olduğundan emin olun.',
            icon: 'warning',
            confirmButtonColor: '#A64D32',
            background: '#F9F6F0',
            color: '#3E2723'
        });
        return; // İşlemi durdur
    }

    if (password.length < 6) {
        Swal.fire({
            title: 'Şifre Çok Kısa',
            text: 'Şifreniz en az 6 karakter olmalıdır.',
            icon: 'warning',
            confirmButtonColor: '#A64D32',
            background: '#F9F6F0'
        });
        return;
    }

    // --- 2. BACKEND İSTEĞİ ---
    try {
        // Butonu pasif yap (Çift tıklamayı önle)
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = "İşleniyor...";

        const response = await fetch('https://pito-projesi.onrender.com/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password }) // confirmPassword gönderilmez
        });

        const data = await response.json();

        if (response.ok) {
            // BAŞARILI
            Swal.fire({
                title: 'Aramıza Hoş Geldin! 🎉',
                text: 'Kayıt işlemin başarıyla tamamlandı. Giriş sayfasına yönlendiriliyorsun.',
                icon: 'success',
                confirmButtonColor: '#A64D32',
                background: '#F9F6F0',
                color: '#3E2723',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            }).then(() => {
                window.location.href = 'login.html';
            });

        } else {
            // SUNUCU HATASI (E-posta kayıtlı vb.)
            Swal.fire({
                title: 'Kayıt Oluşturulamadı',
                text: data.message || "Bilinmeyen bir hata oluştu.",
                icon: 'error',
                confirmButtonColor: '#d33',
                background: '#F9F6F0',
                color: '#3E2723'
            });
            
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }

    } catch (err) {
        console.error("Kayıt hatası:", err);
        
        Swal.fire({
            title: 'Bağlantı Hatası',
            text: 'Sunucuyla iletişim kurulamadı. Lütfen internet bağlantınızı kontrol edin.',
            icon: 'warning',
            confirmButtonColor: '#A64D32',
            background: '#F9F6F0'
        });

        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerText = "Kayıt Ol";
    }
});