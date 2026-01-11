document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // --- 1. ŞİFRE KONTROLÜ ---
    if (password !== confirmPassword) {
        Swal.fire({ title: 'Şifreler Uyuşmuyor!', icon: 'warning', confirmButtonColor: '#A64D32' });
        return;
    }
    if (password.length < 6) {
        Swal.fire({ title: 'Şifre Çok Kısa', text: 'En az 6 karakter olmalı.', icon: 'warning', confirmButtonColor: '#A64D32' });
        return;
    }

    // --- 2. KAYIT İSTEĞİ ---
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = "İşleniyor...";

    try {
        const response = await fetch('https://pitopets.com/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();

        if (response.ok && data.requireVerification) {
            // --- 3. E-POSTA DOĞRULAMA POPUP'I ---
            submitBtn.innerText = "Kayıt Ol"; // Butonu düzelt
            submitBtn.disabled = false;

            const { value: code } = await Swal.fire({
                title: 'E-posta Doğrulama',
                input: 'text',
                inputLabel: `${data.email} adresine gönderilen 6 haneli kodu girin`,
                inputPlaceholder: 'Örn: 123456',
                confirmButtonText: 'Doğrula',
                confirmButtonColor: '#A64D32',
                showCancelButton: true,
                cancelButtonText: 'İptal',
                inputAttributes: {
                    maxlength: 6,
                    autocapitalize: 'off',
                    autocorrect: 'off'
                },
                inputValidator: (value) => {
                    if (!value) {
                        return 'Kodu girmelisiniz!'
                    }
                }
            });

            if (code) {
                // Kodu sunucuya gönder
                verifyEmailCode(data.email, code);
            }

        } else if (!response.ok) {
            throw new Error(data.message || "Hata oluştu");
        }

    } catch (err) {
        Swal.fire({ title: 'Hata', text: err.message, icon: 'error', confirmButtonColor: '#d33' });
        submitBtn.disabled = false;
        submitBtn.innerText = "Kayıt Ol";
    }
});

// --- DOĞRULAMA FONKSİYONU ---
async function verifyEmailCode(email, code) {
    try {
        Swal.showLoading(); // Yükleniyor ikonu göster
        
        const response = await fetch('https://pitopets.com/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                title: 'Tebrikler! 🎉',
                text: 'Hesabın doğrulandı. Giriş yapabilirsin.',
                icon: 'success',
                confirmButtonColor: '#A64D32'
            }).then(() => {
                window.location.href = 'login.html';
            });
        } else {
            Swal.fire({ title: 'Hata', text: data.message, icon: 'error', confirmButtonColor: '#d33' });
        }
    } catch (err) {
        Swal.fire({ title: 'Bağlantı Hatası', text: 'Sunucuya ulaşılamadı.', icon: 'error' });
    }
}