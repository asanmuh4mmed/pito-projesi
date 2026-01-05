// --- js/lang.js (Dil Sözlüğü) ---

const translations = {
    tr: {
        navbar_home: "Ana Sayfa",
        navbar_about: "Hakkımızda",
        navbar_vets: "Veteriner Bul",
        navbar_breeding: "Eş Bul",
        navbar_adopt: "Sahiplen",
        navbar_caretaker: "Bakıcılar",
        navbar_messages: "Mesajlar",
        navbar_profile: "Profilim",
        navbar_logout: "ÇIKIŞ",
        
        hero_title: "Bir can, bir yuva ♡",
        hero_subtitle: "ONUN EVİ SENSİN",
        
        btn_adopt: "SAHİPLEN",
        btn_breed: "EŞ BUL",
        btn_caretaker: "BAKICI BUL",
        btn_vet: "VETERİNER",
        
        about_title: "Biz Kimiz?",
        about_desc1: "PİTO, patili dostlarımızı sıcak yuvalara kavuşturmak ve yalnız kalplerini sevgiyle doldurmak için yola çıkmış bir iyilik hareketidir.",
        about_desc2: "Amacımız, sahipsiz canlara umut olmak, onlara hak ettikleri değeri vermek ve hayvan severleri güvenli bir platformda buluşturmaktır.",
        
        sec_adopt_title: "Yuva Arayanlar",
        sec_adopt_sub: "Sıcak bir yuva bekleyen dostlarımız.",
        btn_see_all: "TÜMÜNÜ GÖR",
        loading: "Yükleniyor...",
        
        sec_breed_title: "Eş Arayanlar",
        sec_breed_sub: "Kendi türünden bir arkadaş arayanlar.",
        
        sec_care_title: "🧑‍🍼 Bakıcılar",
        sec_care_sub: "Patili dostunuza gözü gibi bakacak uzmanlar",
        
        sec_vet_title: "🏥 Veteriner Klinikleri",
        sec_vet_sub: "En yakın sağlık noktaları",
        
        footer_text: "Sevgiyle Tasarlandı © 2025"
    },
    en: {
        navbar_home: "Home",
        navbar_about: "About Us",
        navbar_vets: "Find Vet",
        navbar_breeding: "Find Mate",
        navbar_adopt: "Adopt",
        navbar_caretaker: "Pet Sitters",
        navbar_messages: "Messages",
        navbar_profile: "My Profile",
        navbar_logout: "LOGOUT",
        
        hero_title: "One soul, one home ♡",
        hero_subtitle: "YOU ARE ITS HOME",
        
        btn_adopt: "ADOPT",
        btn_breed: "FIND MATE",
        btn_caretaker: "FIND SITTER",
        btn_vet: "VETERINARIAN",
        
        about_title: "Who Are We?",
        about_desc1: "PITO is a kindness movement set out to bring our pawed friends to warm homes and fill their lonely hearts with love.",
        about_desc2: "Our aim is to be hope for stray souls, give them the value they deserve and bring animal lovers together on a safe platform.",
        
        sec_adopt_title: "Looking for Home",
        sec_adopt_sub: "Our friends waiting for a warm home.",
        btn_see_all: "SEE ALL",
        loading: "Loading...",
        
        sec_breed_title: "Looking for Mate",
        sec_breed_sub: "Those looking for a friend of their own kind.",
        
        sec_care_title: "🧑‍🍼 Pet Sitters",
        sec_care_sub: "Experts who will look after your pawed friend like their own",
        
        sec_vet_title: "🏥 Veterinary Clinics",
        sec_vet_sub: "Nearest health points",
        
        footer_text: "Designed with Love © 2025"
    }
};

function changeLanguage(lang) {
    localStorage.setItem('pito_lang', lang);
    const elements = document.querySelectorAll('[data-lang]');
    
    elements.forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else {
                // İkon varsa (innerHTML kullanarak ikonu koru)
                if(el.children.length > 0) {
                   // Sadece metin kısmını güncellemek zor olduğu için
                   // Basitçe innerText yapıyoruz, ikonları HTML'de değil CSS ile veya
                   // Span içine alarak yönetmek daha doğru ama şimdilik metni basıyoruz.
                   // İkon kaybolmaması için özel kontrol:
                   const icon = el.querySelector('i');
                   if(icon) {
                       el.innerHTML = '';
                       el.appendChild(icon);
                       el.append(' ' + translations[lang][key]);
                   } else {
                       el.innerText = translations[lang][key];
                   }
                } else {
                    el.innerText = translations[lang][key];
                }
            }
        }
    });

    updateLangButton(lang);
}

function updateLangButton(lang) {
    const btn = document.getElementById('langToggleBtn');
    if(btn) {
        btn.innerText = lang === 'tr' ? '🇺🇸 EN' : '🇹🇷 TR';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('pito_lang') || 'tr';
    changeLanguage(savedLang);

    const btn = document.getElementById('langToggleBtn');
    if(btn) {
        btn.addEventListener('click', () => {
            const currentLang = localStorage.getItem('pito_lang') || 'tr';
            const newLang = currentLang === 'tr' ? 'en' : 'tr';
            changeLanguage(newLang);
        });
    }
});