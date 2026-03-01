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
// --- 2. ŞİFREMİ UNUTTUM İŞLEMİ (BACKEND ENTEGRASYONU) ---
    const resetBtn = document.getElementById('sendResetLinkBtn');
    
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            const resetEmail = document.getElementById('resetEmail').value;
            const btn = document.getElementById('sendResetLinkBtn');
            
            if (!resetEmail) {
                Swal.fire({
                    title: 'Eksik Bilgi',
                    text: 'Lütfen e-posta adresinizi yazın.',
                    icon: 'warning',
                    confirmButtonColor: '#A64D32'
                });
                return;
            }

            // Butonu kilitle
            btn.disabled = true;
            btn.innerText = "Gönderiliyor...";

            try {
                // Backend'e istek at
                const res = await fetch('https://pitopets.com/api/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: resetEmail })
                });

                const data = await res.json();
                
                // Modal'ı kapat
                const modalEl = document.getElementById('forgotPasswordModal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                modalInstance.hide();

                if (res.ok) {
                    // Adım 2: Kullanıcıdan Kodu ve Yeni Şifreyi İste
                    const { value: formValues } = await Swal.fire({
                        title: 'Kod Gönderildi!',
                        html:
                            '<p style="font-size:14px">Mailinize gelen 6 haneli kodu ve yeni şifrenizi girin.</p>' +
                            '<input id="swal-code" class="swal2-input" placeholder="6 Haneli Kod">' +
                            '<input id="swal-pass" type="password" class="swal2-input" placeholder="Yeni Şifre">',
                        focusConfirm: false,
                        confirmButtonText: 'Şifreyi Değiştir',
                        confirmButtonColor: '#A64D32',
                        preConfirm: () => {
                            return [
                                document.getElementById('swal-code').value,
                                document.getElementById('swal-pass').value
                            ]
                        }
                    });

                    if (formValues) {
                        const [code, newPassword] = formValues;
                        // Şifre Değiştirme İsteği
                        const resetRes = await fetch('https://pitopets.com/api/reset-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: resetEmail, code, newPassword })
                        });
                        const resetData = await resetRes.json();

                        if (resetRes.ok) {
                            Swal.fire('Başarılı!', 'Şifreniz güncellendi. Giriş yapabilirsiniz.', 'success');
                        } else {
                            Swal.fire('Hata', resetData.message, 'error');
                        }
                    }

                } else {
                    Swal.fire('Hata', data.message, 'error');
                }

            } catch (error) {
                console.error(error);
                Swal.fire('Hata', 'Sunucuya bağlanılamadı.', 'error');
            } finally {
                btn.disabled = false;
                btn.innerText = "Gönder";
            }
        });
    }
});