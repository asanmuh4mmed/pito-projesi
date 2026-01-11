document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GİRİŞ YAPMA İŞLEMİ (MEVCUT KODLARIN) ---
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // API URL'ini senin sistemine göre yazdım
                const res = await fetch('https://pitopets.com/api/login', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        
                        // BAŞARILI GİRİŞ
                        Swal.fire({
                            title: 'Hoş Geldiniz! 🐾',
                            text: 'Giriş başarılı, ana sayfaya yönlendiriliyorsunuz...',
                            icon: 'success',
                            timer: 2000, 
                            showConfirmButton: false,
                            confirmButtonColor: '#A64D32'
                        }).then(() => {
                            window.location.href = 'index.html';
                        });

                    } else {
                        // Token Gelmediyse
                        Swal.fire({
                            icon: 'error',
                            title: 'Hata',
                            text: 'Sunucu kimlik bilgisi göndermedi!',
                            confirmButtonColor: '#A64D32'
                        });
                    }
                    
                } else {
                    // Şifre veya Email Yanlış
                    Swal.fire({
                        icon: 'warning',
                        title: 'Giriş Başarısız',
                        text: data.message || "E-posta veya şifre hatalı.",
                        confirmButtonColor: '#A64D32',
                        confirmButtonText: 'Tekrar Dene'
                    });
                }

            } catch (err) {
                console.error("Login Hatası:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Sunucu Hatası',
                    text: 'Lütfen internet bağlantınızı kontrol edin.',
                    confirmButtonColor: '#A64D32'
                });
            }
        });
    }

    // --- 2. ŞİFREMİ UNUTTUM İŞLEMİ (YENİ) ---
    const resetBtn = document.getElementById('sendResetLinkBtn');
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const resetEmail = document.getElementById('resetEmail').value;
            
            // Modal penceresini bul ve kapat
            const modalEl = document.getElementById('forgotPasswordModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            
            if (resetEmail) {
                modalInstance.hide(); // Pencereyi kapat
                
                // Şimdilik sadece görsel uyarı veriyoruz (Backend hazır olunca buraya fetch eklenir)
                Swal.fire({
                    title: 'Talep Alındı',
                    text: `${resetEmail} adresine sıfırlama bağlantısı gönderildi varsayılıyor.`,
                    icon: 'success',
                    confirmButtonColor: '#A64D32'
                });
            } else {
                Swal.fire({
                    title: 'Eksik Bilgi',
                    text: 'Lütfen e-posta adresinizi yazın.',
                    icon: 'warning',
                    confirmButtonColor: '#A64D32'
                });
            }
        });
    }
});