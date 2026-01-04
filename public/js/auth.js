document.addEventListener('DOMContentLoaded', () => {
    const navbarLinks = document.getElementById('navbar-links');
    const token = localStorage.getItem('token');

    // JWT çözümleme fonksiyonu
    function parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    if (navbarLinks) {
        if (token) {
            // --- KULLANICI GİRİŞ YAPMIŞSA ---
            const user = parseJwt(token);
            const userName = user ? user.name : 'Kullanıcı';

            // DİKKAT: Aşağıdaki satırda href="profile.html" yazdığından emin ol!
            navbarLinks.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="index.html">Ana Sayfa</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="pets.html">Sahiplen</a>
                </li>
                 <li class="nav-item">
                    <a class="nav-link" href="caretakers.html">Bakıcılar</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link fw-bold text-warning" href="profile.html">Hoş Geldin, ${userName}</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" id="logout-btn">Çıkış Yap</a>
                </li>
            `;

            // Çıkış Yap butonu işlemleri
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    localStorage.removeItem('token'); 
                    alert('Başarıyla çıkış yaptınız.');
                    window.location.href = 'index.html';
                });
            }

        } else {
            // --- KULLANICI GİRİŞ YAPMAMIŞSA ---
            navbarLinks.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="index.html">Ana Sayfa</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="pets.html">Sahiplen</a>
                </li>
                 <li class="nav-item">
                    <a class="nav-link" href="caretakers.html">Bakıcılar</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="login.html">Giriş Yap</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="register.html">Kayıt Ol</a>
                </li>
            `;
        }
    }
});