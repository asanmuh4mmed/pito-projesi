// --- js/lang.js ---

const translations = {
    tr: {
        // --- NAVBAR & FOOTER ---
        navbar_home: "Ana Sayfa",
        navbar_about: "Hakkımızda",
        navbar_vets: "Veteriner",
        navbar_breeding: "Eş Bul",
        navbar_adopt: "Sahiplen",
        navbar_caretaker: "Bakıcılar",
        navbar_messages: "Mesajlar",
        navbar_my_messages: "Mesajlarım",
        navbar_profile: "Profilim",
        navbar_login: "Giriş Yap",
        navbar_register: "Kayıt Ol",
        navbar_logout: "Çıkış Yap",
        footer_text: "🕊️ PİTO - Hayvan Haklarını Korur © 2025",

        // --- ORTAK BUTONLAR & GENEL ---
        btn_cancel: "İptal",
        btn_send: "Gönder",
        btn_save: "Kaydet",
        btn_delete: "Sil",
        btn_back: "Geri Dön",
        btn_back_list: "Listeye Dön",
        btn_back_to_ads: "İlanlara Dön",
        btn_call_now: "Hemen Ara",
        btn_save_publish: "KAYDET VE YAYINLA",
        btn_save_changes: "Değişiklikleri Kaydet",
        loading: "Yükleniyor...",
        time_now: "Şimdi",
        
        // --- ANA SAYFA (INDEX) ---
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
        sec_breed_title: "Eş Arayanlar",
        sec_breed_sub: "Kendi türünden bir arkadaş arayanlar.",
        sec_care_title: "🧑‍🍼 Bakıcılar",
        sec_care_sub: "Patili dostunuza gözü gibi bakacak uzmanlar",
        sec_vet_title: "🏥 Veteriner Klinikleri",
        sec_vet_sub: "En yakın sağlık noktaları",

        // --- GİRİŞ & KAYIT ---
        page_login_title: "Giriş Yap",
        lbl_email: "E-posta",
        ph_email: "ornek@mail.com",
        ph_email_example: "ahmet@ornek.com",
        lbl_password: "Şifre",
        ph_password: "••••••",
        btn_login: "Giriş Yap",
        lbl_no_account: "Hesabınız yok mu?",
        link_register: "Kayıt Ol",
        register_subtitle: "Dostlarımıza yuva olmak için katılın.",
        lbl_fullname: "Ad Soyad",
        ph_fullname: "Örn: Ahmet Yılmaz",
        lbl_phone: "Telefon Numarası",
        ph_phone: "05XX XXX XX XX",
        btn_register: "Kayıt Ol",
        lbl_have_account: "Hesabın var mı?",
        link_login: "Giriş Yap",

        // --- SAHİPLENME (PETS) ---
        btn_add_pet: "İlan Ver",
        badge_looking_home: "Yuva Arayanlar",
        hero_adopt_title: "Yeni Dostun Seni Bekliyor",
        hero_adopt_subtitle: "Sıcak bir yuva bekleyen küçük kalplerle tanışın. Onların hikayesine ortak olun.",
        lbl_filter_species: "TÜR",
        opt_all: "Tümü",
        opt_cat: "Kedi",
        opt_dog: "Köpek",
        opt_bird: "Kuş",
        opt_other: "Diğer",
        lbl_filter_gender: "CİNSİYET",
        opt_any: "Farketmez",
        opt_female: "Dişi",
        opt_male: "Erkek",
        lbl_filter_city: "ŞEHİR",
        ph_search_city: "Şehir Ara...",
        lbl_filter_district: "İLÇE",
        opt_select_district: "İlçe Seç",
        btn_clear_filter: "Filtreleri Temizle",
        loading_pets: "Sevimli dostlarımız taranıyor...",

        // --- EŞ BULMA (BREEDING) ---
        btn_add_breeding: "İlan Ver",
        header_badge_love: "Aşk Kapıda",
        hero_breeding_title: "Yalnız Kalmasın",
        hero_breeding_subtitle: "Minik dostunuz için en uygun oyun arkadaşını bulun.",
        opt_all_species: "Tüm Türler",
        loading_candidates: "Adaylar aranıyor...",

        // --- BAKICILAR (CARETAKERS) ---
        hero_caretaker_title: "Güvenilir Bakıcılar",
        hero_caretaker_subtitle: "Dostlarınızı emanet edebileceğiniz sevgi dolu yuvalar.",
        lbl_filter_location: "Konuma Göre Filtrele",
        loading_caretakers: "Bakıcılar yükleniyor...",
        btn_become_caretaker: "Bakıcı Ol",
        modal_contact_title: "İletişim Bilgileri",
        badge_available: "Müsait",

        // --- VETERİNERLER (VETS) ---
        hero_vets_title: "Veteriner Hekim Bul",
        hero_vets_subtitle: "Size en yakın, güvenilir klinikleri keşfedin.",
        lbl_filter_city_vets: "Şehre Göre Filtrele",
        opt_all_cities: "Tüm Şehirler",
        loading_clinics: "Klinikler yükleniyor...",
        btn_add_clinic: "Klinik Ekle",
        modal_clinic_contact_title: "Klinik İletişim",

        // --- DETAY SAYFALARI (PET & EŞ) ---
        loading_pet_detail: "Dostumuzun bilgileri getiriliyor...",
        loading_info: "Bilgiler getiriliyor...",
        err_pet_not_found: "İlan Bulunamadı",
        err_pet_removed: "Aradığınız ilan yayından kaldırılmış veya silinmiş olabilir.",
        err_not_found: "İlan Bulunamadı",
        err_desc: "Bu ilan kaldırılmış veya silinmiş olabilir.",
        lbl_waiting_family: "Yeni ailesini bekliyor",
        badge_looking_mate: "Eş Arıyor",
        lbl_breed: "Irk",
        lbl_age_suffix: "Yaşında",
        lbl_story_caps: "HİKAYESİ",
        lbl_about: "Hakkında",
        lbl_owner: "İlan Sahibi",
        lbl_owner_caps: "İLAN SAHİBİ",
        btn_msg_adopt: "Sahiplenmek İçin Mesaj Gönder",
        btn_send_msg: "Mesaj Gönder",
        modal_msg_title: "Mesaj Gönder",
        lbl_msg_context: "için ilan sahibine mesajınız:",
        ph_adopt_msg: "Merhaba, bu dostumuzu sahiplenmek istiyorum...",
        ph_msg_text: "Merhaba...",

        // --- PROFİLİM ---
        btn_edit_profile: "Profili Düzenle",
        lbl_active_ads_count: "Aktif İlan Sayısı",
        header_my_adoption: "🐶 Sahiplendirme İlanlarım",
        btn_add_new: "Yeni Ekle",
        header_my_breeding: "❤️ Eş Arayan İlanlarım",
        btn_add_ad: "İlan Ekle",
        loading_breeding: "Eş arayan ilanlar yükleniyor...",
        header_my_caretaker: "🧑‍🍼 Bakıcılık İlanlarım",
        btn_add_service: "Hizmet Ekle",
        loading_caretaker: "Bakıcı ilanları yükleniyor...",
        header_my_vets: "Veteriner Klinik İlanlarım",
        loading_vets: "Veteriner ilanları yükleniyor...",
        modal_edit_profile_title: "Profili Güncelle",
        lbl_profile_pic: "Profil Resmi",
        msg_new_pic_selected: "Yeni Resim Seçildi",
        modal_delete_title: "Silmek istediğine emin misin?",
        modal_delete_desc: "Bu işlem geri alınamaz.",

        // --- MESAJLAR ---
        sidebar_inbox: "Gelen Kutusu",
        sidebar_active_chats: "Aktif Sohbet",
        msg_no_messages: "Henüz mesajınız yok.",
        role_owner: "İlan Sahibi",
        chat_general: "Genel Sohbet",
        msg_connection_error: "Bağlantı hatası!",
        ph_type_message: "Mesajınızı yazın...",

        // --- FORM İŞLEMLERİ (EKLEME/DÜZENLEME) ---
        page_breeding_add_title: "Eş Arayan İlanı Oluştur",
        page_add_pet_title: "Yeni İlan Oluştur",
        page_add_pet_subtitle: "Bir cana yuva bulmaya yardım et.",
        lbl_upload_photo: "Fotoğraf Yükle",
        msg_photo_hint: "Lütfen net bir fotoğraf seçin.",
        lbl_pet_name: "Dostunun Adı",
        ph_pet_name: "Örn: Boncuk",
        lbl_species: "Türü",
        opt_select: "Seçiniz",
        opt_select_city: "Şehir Seçiniz",
        opt_select_city_first: "Önce şehir seçiniz",
        lbl_breed: "Irkı (Cinsi)",
        ph_breed: "Örn: Golden, Tekir...",
        lbl_age: "Yaşı",
        lbl_gender: "Cinsiyeti",
        lbl_desc: "Hakkında & Beklentiler",
        ph_desc: "Dostunun karakterinden ve aradığın eş özelliklerinden bahset...",
        lbl_story: "Hikayesi / Durumu",
        ph_story: "Onun hakkında bilgi verin...",
        btn_publish: "İlanı Yayınla",
        
        // Klinik Ekleme Formu
        page_add_vet_title: "🏥 Klinik Ekle",
        lbl_clinic_name: "Klinik Adı",
        ph_clinic_name: "Örn: Can Dostlar Veteriner Kliniği",
        lbl_vet_name: "Hekim Adı Soyadı",
        ph_vet_name: "Örn: Vet. Hekim Ahmet Yılmaz",
        lbl_address: "Açık Adres",
        ph_address: "Mahalle, Cadde, No...",
        lbl_clinic_photo: "Klinik Fotoğrafı",

        // Bakıcı Ol Formu
        page_become_caretaker_title: "Bakıcı Başvurusu",
        page_become_caretaker_subtitle: "Minik dostlara yuva olun.",
        lbl_ad_title: "İlan Başlığı",
        ph_ad_title: "Örn: Tecrübeli Kedi Sever",
        lbl_experience: "Deneyim (Yıl)",
        ph_experience: "2",
        lbl_price: "Ücret (₺)",
        ph_price: "500",
        lbl_cover_photo: "Kapak Fotoğrafı",
        lbl_about_me: "Hakkında",
        ph_about_me: "Kendini tanıt...",
        btn_complete_application: "BAŞVURUYU TAMAMLA",

        // İlan Düzenleme
        page_edit_pet_title: "✏️ İlanı Düzenle",
        lbl_name_generic: "İsim",
        lbl_story_simple: "Hikaye",
        lbl_image_url: "Resim URL",
        lbl_preview: "Önizleme:",
        lbl_phone_simple: "Telefon"
    },
    en: {
        // --- NAVBAR & FOOTER ---
        navbar_home: "Home",
        navbar_about: "About Us",
        navbar_vets: "Veterinarian",
        navbar_breeding: "Find Mate",
        navbar_adopt: "Adopt",
        navbar_caretaker: "Pet Sitters",
        navbar_messages: "Messages",
        navbar_my_messages: "My Messages",
        navbar_profile: "My Profile",
        navbar_login: "Login",
        navbar_register: "Register",
        navbar_logout: "Logout",
        footer_text: "Designed with Love © 2025",

        // --- COMMON BUTTONS & PHRASES ---
        btn_cancel: "Cancel",
        btn_send: "Send",
        btn_save: "Save",
        btn_delete: "Delete",
        btn_back: "Go Back",
        btn_back_list: "Back to List",
        btn_back_to_ads: "Back to Ads",
        btn_call_now: "Call Now",
        btn_save_publish: "SAVE & PUBLISH",
        btn_save_changes: "Save Changes",
        loading: "Loading...",
        time_now: "Now",

        // --- INDEX PAGE ---
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
        sec_breed_title: "Looking for Mate",
        sec_breed_sub: "Those looking for a friend of their own kind.",
        sec_care_title: "🧑‍🍼 Pet Sitters",
        sec_care_sub: "Experts who will look after your pawed friend like their own",
        sec_vet_title: "🏥 Veterinary Clinics",
        sec_vet_sub: "Nearest health points",

        // --- LOGIN & REGISTER ---
        page_login_title: "Login",
        lbl_email: "Email",
        ph_email: "example@mail.com",
        ph_email_example: "john@example.com",
        lbl_password: "Password",
        ph_password: "••••••",
        btn_login: "Login",
        lbl_no_account: "No account?",
        link_register: "Register",
        register_subtitle: "Join us to be a home for our friends.",
        lbl_fullname: "Full Name",
        ph_fullname: "Ex: John Doe",
        lbl_phone: "Phone Number",
        ph_phone: "05XX XXX XX XX",
        btn_register: "Register",
        lbl_have_account: "Have an account?",
        link_login: "Login",

        // --- PETS PAGE ---
        btn_add_pet: "Post Ad",
        badge_looking_home: "Looking for Home",
        hero_adopt_title: "Your New Friend Awaits",
        hero_adopt_subtitle: "Meet the little hearts waiting for a warm home. Be a part of their story.",
        lbl_filter_species: "SPECIES",
        opt_all: "All",
        opt_cat: "Cat",
        opt_dog: "Dog",
        opt_bird: "Bird",
        opt_other: "Other",
        lbl_filter_gender: "GENDER",
        opt_any: "Any",
        opt_female: "Female",
        opt_male: "Male",
        lbl_filter_city: "CITY",
        ph_search_city: "Search City...",
        lbl_filter_district: "DISTRICT",
        opt_select_district: "Select District",
        btn_clear_filter: "Clear Filters",
        loading_pets: "Scanning for lovely friends...",

        // --- BREEDING PAGE ---
        btn_add_breeding: "Post Ad",
        header_badge_love: "Love is at the Door",
        hero_breeding_title: "Don't Let Them Be Alone",
        hero_breeding_subtitle: "Find the best playmate for your little friend.",
        opt_all_species: "All Species",
        loading_candidates: "Searching for candidates...",

        // --- CARETAKERS PAGE ---
        hero_caretaker_title: "Trusted Pet Sitters",
        hero_caretaker_subtitle: "Loving homes where you can entrust your friends.",
        lbl_filter_location: "Filter by Location",
        loading_caretakers: "Loading sitters...",
        btn_become_caretaker: "Become Sitter",
        modal_contact_title: "Contact Info",
        badge_available: "Available",

        // --- VETS PAGE ---
        hero_vets_title: "Find Veterinarian",
        hero_vets_subtitle: "Discover reliable clinics nearest to you.",
        lbl_filter_city_vets: "Filter by City",
        opt_all_cities: "All Cities",
        loading_clinics: "Loading clinics...",
        btn_add_clinic: "Add Clinic",
        modal_clinic_contact_title: "Clinic Contact",

        // --- DETAIL PAGES ---
        loading_pet_detail: "Getting friend's info...",
        loading_info: "Getting info...",
        err_pet_not_found: "Ad Not Found",
        err_pet_removed: "The ad you are looking for might have been removed or deleted.",
        err_not_found: "Ad Not Found",
        err_desc: "This ad might have been removed.",
        lbl_waiting_family: "Waiting for new family",
        badge_looking_mate: "Looking for Mate",
        lbl_breed: "Breed",
        lbl_age_suffix: "Years Old",
        lbl_story_caps: "STORY",
        lbl_about: "About",
        lbl_owner: "Owner",
        lbl_owner_caps: "OWNER",
        btn_msg_adopt: "Send Message to Adopt",
        btn_send_msg: "Send Message",
        modal_msg_title: "Send Message",
        lbl_msg_context: "message to the owner for:",
        ph_adopt_msg: "Hello, I want to adopt this friend...",
        ph_msg_text: "Hello...",

        // --- PROFILE PAGE ---
        btn_edit_profile: "Edit Profile",
        lbl_active_ads_count: "Active Ads Count",
        header_my_adoption: "🐶 My Adoption Ads",
        btn_add_new: "Add New",
        header_my_breeding: "❤️ My Mating Ads",
        btn_add_ad: "Add Ad",
        loading_breeding: "Loading mating ads...",
        header_my_caretaker: "🧑‍🍼 My Sitter Ads",
        btn_add_service: "Add Service",
        loading_caretaker: "Loading sitter ads...",
        header_my_vets: "My Vet Clinic Ads",
        loading_vets: "Loading vet ads...",
        modal_edit_profile_title: "Update Profile",
        lbl_profile_pic: "Profile Picture",
        msg_new_pic_selected: "New Image Selected",
        modal_delete_title: "Are you sure you want to delete?",
        modal_delete_desc: "This action cannot be undone.",

        // --- MESSAGES ---
        sidebar_inbox: "Inbox",
        sidebar_active_chats: "Active Chats",
        msg_no_messages: "You have no messages yet.",
        role_owner: "Owner",
        chat_general: "General Chat",
        msg_connection_error: "Connection error!",
        ph_type_message: "Type your message...",

        // --- FORMS ---
        page_breeding_add_title: "Create Mating Profile",
        page_add_pet_title: "Create New Ad",
        page_add_pet_subtitle: "Help find a home for a soul.",
        lbl_upload_photo: "Upload Photo",
        msg_photo_hint: "Please choose a clear photo.",
        lbl_pet_name: "Pet's Name",
        ph_pet_name: "Ex: Fluffy",
        lbl_species: "Species",
        opt_select: "Select",
        opt_select_city: "Select City",
        opt_select_city_first: "Select city first",
        lbl_breed: "Breed",
        ph_breed: "Ex: Golden, Tabby...",
        lbl_age: "Age",
        lbl_gender: "Gender",
        lbl_desc: "About & Expectations",
        ph_desc: "Describe your pet's character and what you are looking for...",
        lbl_story: "Story / Status",
        ph_story: "Give information about him/her...",
        btn_publish: "Publish Ad",
        
        // Add Vet Form
        page_add_vet_title: "🏥 Add Clinic",
        lbl_clinic_name: "Clinic Name",
        ph_clinic_name: "Ex: Best Friends Vet Clinic",
        lbl_vet_name: "Vet Name Surname",
        ph_vet_name: "Ex: Vet. John Doe",
        lbl_address: "Full Address",
        ph_address: "Street, No...",
        lbl_clinic_photo: "Clinic Photo",

        // Become Caretaker Form
        page_become_caretaker_title: "Caretaker Application",
        page_become_caretaker_subtitle: "Be a home for little friends.",
        lbl_ad_title: "Ad Title",
        ph_ad_title: "Ex: Experienced Cat Lover",
        lbl_experience: "Experience (Years)",
        ph_experience: "2",
        lbl_price: "Price (₺)",
        ph_price: "500",
        lbl_cover_photo: "Cover Photo",
        lbl_about_me: "About Me",
        ph_about_me: "Introduce yourself...",
        btn_complete_application: "COMPLETE APPLICATION",

        // Edit Pet
        page_edit_pet_title: "✏️ Edit Ad",
        lbl_name_generic: "Name",
        lbl_story_simple: "Story",
        lbl_image_url: "Image URL",
        lbl_preview: "Preview:",
        lbl_phone_simple: "Phone"
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
                // İkon varsa koru
                if(el.children.length > 0 && el.tagName !== 'SELECT') { 
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

document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Form verilerini al
    const name = document.getElementById('contactName').value;
    
    // Şimdilik sadece görsel geri bildirim verelim
    Swal.fire({
        title: 'Mesajın Alındı! 📩',
        text: `Teşekkürler ${name}, ekibimiz en kısa sürede seninle iletişime geçecek.`,
        icon: 'success',
        confirmButtonColor: '#A64D32',
        background: '#F9F6F0'
    });
    
    // Formu temizle
    this.reset();
});