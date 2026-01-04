// --- js/login.js ---

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
const res = await fetch('https://pito-projesi.onrender.com/api/login', {                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        
                        // --- GÜNCELLENEN KISIM (BAŞARILI GİRİŞ) ---
                        Swal.fire({
                            title: 'Hoş Geldiniz! 🐾',
                            text: 'Giriş başarılı, ana sayfaya yönlendiriliyorsunuz...',
                            icon: 'success',
                            timer: 2000, // 2 saniye sonra otomatik kapanır
                            showConfirmButton: false,
                            background: '#F9F6F0', // Projenin krem rengi
                            color: '#3E2723'      // Projenin koyu kahve rengi
                        }).then(() => {
                            window.location.href = 'index.html';
                        });
                        // ------------------------------------------

                    } else {
                        // Token Hatası
                        Swal.fire({
                            icon: 'error',
                            title: 'Bir Sorun Oluştu',
                            text: 'Sunucu kimlik bilgisi göndermedi!',
                            confirmButtonColor: '#A64D32' // Kiremit rengi buton
                        });
                    }
                    
                } else {
                    // Şifre veya Email Yanlış Hatası
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
                // Sunucu Bağlantı Hatası
                Swal.fire({
                    icon: 'error',
                    title: 'Sunucuya Ulaşılamadı',
                    text: 'Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.',
                    confirmButtonColor: '#3E2723'
                });
            }
        });
    }
});