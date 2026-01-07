// --- js/breeding.js (GÜNCELLENDİ: MAVİ TİK EKLENDİ) ---

const API_URL = 'https://pito-projesi.onrender.com';

// 81 İL VE İLÇE VERİTABANI (DOKUNULMADI)
const cityData = {
    "Adana": ["Aladağ", "Ceyhan", "Çukurova", "Feke", "İmamoğlu", "Karaisalı", "Karataş", "Kozan", "Pozantı", "Saimbeyli", "Sarıçam", "Seyhan", "Tufanbeyli", "Yumurtalık", "Yüreğir"],
    "Adıyaman": ["Besni", "Çelikhan", "Gerger", "Gölbaşı", "Kahta", "Merkez", "Samsat", "Sincik", "Tut"],
    "Afyonkarahisar": ["Başmakçı", "Bayat", "Bolvadin", "Çay", "Çobanlar", "Dazkırı", "Dinar", "Emirdağ", "Evciler", "Hocalar", "İhsaniye", "İscehisar", "Kızılören", "Merkez", "Sandıklı", "Sinanpaşa", "Sultandağı", "Şuhut"],
    "Ağrı": ["Diyadin", "Doğubayazıt", "Eleşkirt", "Hamur", "Merkez", "Patnos", "Taşlıçay", "Tutak"],
    "Aksaray": ["Ağaçören", "Eskil", "Gülağaç", "Güzelyurt", "Merkez", "Ortaköy", "Sarıyahşi", "Sultanhanı"],
    "Amasya": ["Göynücek", "Gümüşhacıköy", "Hamamözü", "Merkez", "Merzifon", "Suluova", "Taşova"],
    "Ankara": ["Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk", "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana", "Kahramankazan", "Kalecik", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan", "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"],
    "Antalya": ["Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike", "Gazipaşa", "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı", "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"],
    "Ardahan": ["Çıldır", "Damal", "Göle", "Hanak", "Merkez", "Posof"],
    "Artvin": ["Ardanuç", "Arhavi", "Borçka", "Hopa", "Kemalpaşa", "Merkez", "Murgul", "Şavşat", "Yusufeli"],
    "Aydın": ["Bozdoğan", "Buharkent", "Çine", "Didim", "Efeler", "Germencik", "İncirliova", "Karacasu", "Karpuzlu", "Koçarlı", "Köşk", "Kuşadası", "Kuyucak", "Nazilli", "Söke", "Sultanhisar", "Yenipazar"],
    "Balıkesir": ["Altıeylül", "Ayvalık", "Balya", "Bandırma", "Bigadiç", "Burhaniye", "Dursunbey", "Edremit", "Erdek", "Gömeç", "Gönen", "Havran", "İvrindi", "Karesi", "Kepsut", "Manyas", "Marmara", "Savaştepe", "Sındırgı", "Susurluk"],
    "Bartın": ["Amasra", "Kurucaşile", "Merkez", "Ulus"],
    "Batman": ["Beşiri", "Gercüş", "Hasankeyf", "Kozluk", "Merkez", "Sason"],
    "Bayburt": ["Aydıntepe", "Demirözü", "Merkez"],
    "Bilecik": ["Bozüyük", "Gölpazarı", "İnhisar", "Merkez", "Osmaneli", "Pazaryeri", "Söğüt", "Yenipazar"],
    "Bingöl": ["Adaklı", "Genç", "Karlıova", "Kiğı", "Merkez", "Solhan", "Yayladere", "Yedisu"],
    "Bitlis": ["Adilcevaz", "Ahlat", "Güroymak", "Hizan", "Merkez", "Mutki", "Tatvan"],
    "Bolu": ["Dörtdivan", "Gerede", "Göynük", "Kıbrıscık", "Mengen", "Merkez", "Mudurnu", "Seben", "Yeniçağa"],
    "Burdur": ["Ağlasun", "Altınyayla", "Bucak", "Çavdır", "Çeltikçi", "Gölhisar", "Karamanlı", "Kemer", "Merkez", "Tefenni", "Yeşilova"],
    "Bursa": ["Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey", "Keles", "Kestel", "Mudanya", "Mustafakemalpaşa", "Nilüfer", "Orhaneli", "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım"],
    "Çanakkale": ["Ayvacık", "Bayramiç", "Biga", "Bozcaada", "Çan", "Eceabat", "Ezine", "Gelibolu", "Gökçeada", "Lapseki", "Merkez", "Yenice"],
    "Çankırı": ["Atkaracalar", "Bayramören", "Çerkeş", "Eldivan", "Ilgaz", "Kızılırmak", "Korgun", "Kurşunlu", "Merkez", "Orta", "Şabanözü", "Yapraklı"],
    "Çorum": ["Alaca", "Bayat", "Boğazkale", "Dodurga", "İskilip", "Kargı", "Laçin", "Mecitözü", "Merkez", "Oğuzlar", "Ortaköy", "Osmancık", "Sungurlu", "Uğurludağ"],
    "Denizli": ["Acıpayam", "Babadağ", "Baklan", "Bekilli", "Beyağaç", "Bozkurt", "Buldan", "Çal", "Çameli", "Çardak", "Çivril", "Güney", "Honaz", "Kale", "Merkezefendi", "Pamukkale", "Sarayköy", "Serinhisar", "Tavas"],
    "Diyarbakır": ["Bağlar", "Bismil", "Çermik", "Çınar", "Çüngüş", "Dicle", "Eğil", "Ergani", "Hani", "Hazro", "Kayapınar", "Kocaköy", "Kulp", "Lice", "Silvan", "Sur", "Yenişehir"],
    "Düzce": ["Akçakoca", "Cumayeri", "Çilimli", "Gölyaka", "Gümüşova", "Kaynaşlı", "Merkez", "Yığılca"],
    "Edirne": ["Enez", "Havsa", "İpsala", "Keşan", "Lalapaşa", "Meriç", "Merkez", "Süloğlu", "Uzunköprü"],
    "Elazığ": ["Ağın", "Alacakaya", "Arıcak", "Baskil", "Karakoçan", "Keban", "Kovancılar", "Maden", "Merkez", "Palu", "Sivrice"],
    "Erzincan": ["Çayırlı", "İliç", "Kemah", "Kemaliye", "Merkez", "Otlukbeli", "Refahiye", "Tercan", "Üzümlü"],
    "Erzurum": ["Aşkale", "Aziziye", "Çat", "Hınıs", "Horasan", "İspir", "Karaçoban", "Karayazı", "Köprüköy", "Narman", "Oltu", "Olur", "Palandöken", "Pasinler", "Pazaryolu", "Şenkaya", "Tekman", "Tortum", "Uzundere", "Yakutiye"],
    "Eskişehir": ["Alpu", "Beylikova", "Çifteler", "Günyüzü", "Han", "İnönü", "Mahmudiye", "Mihalgazi", "Mihalıççık", "Odunpazarı", "Sarıcakaya", "Seyitgazi", "Sivrihisar", "Tepebaşı"],
    "Gaziantep": ["Araban", "İslahiye", "Karkamış", "Nizip", "Nurdağı", "Oğuzeli", "Şahinbey", "Şehitkamil", "Yavuzeli"],
    "Giresun": ["Alucra", "Bulancak", "Çamoluk", "Çanakçı", "Dereli", "Doğankent", "Espiye", "Eynesil", "Görele", "Güce", "Keşap", "Merkez", "Piraziz", "Şebinkarahisar", "Tirebolu", "Yağlıdere"],
    "Gümüşhane": ["Kelkit", "Köse", "Kürtün", "Merkez", "Şiran", "Torul"],
    "Hakkari": ["Çukurca", "Derecik", "Merkez", "Şemdinli", "Yüksekova"],
    "Hatay": ["Altınözü", "Antakya", "Arsuz", "Belen", "Defne", "Dörtyol", "Erzin", "Hassa", "İskenderun", "Kırıkhan", "Kumlu", "Payas", "Reyhanlı", "Samandağ", "Yayladağı"],
    "Iğdır": ["Aralık", "Karakoyunlu", "Merkez", "Tuzluca"],
    "Isparta": ["Aksu", "Atabey", "Eğirdir", "Gelendost", "Gönen", "Keçiborlu", "Merkez", "Senirkent", "Sütçüler", "Şarkikaraağaç", "Uluborlu", "Yalvaç", "Yenişarbademli"],
    "İstanbul": ["Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"],
    "İzmir": ["Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova", "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe", "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz", "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar", "Selçuk", "Tire", "Torbalı", "Urla"],
    "Kahramanmaraş": ["Afşin", "Andırın", "Çağlayancerit", "Dulkadiroğlu", "Ekinözü", "Elbistan", "Göksun", "Nurhak", "Onikişubat", "Pazarcık", "Türkoğlu"],
    "Karabük": ["Eflani", "Eskipazar", "Merkez", "Ovacık", "Safranbolu", "Yenice"],
    "Karaman": ["Ayrancı", "Başyayla", "Ermenek", "Kazımkarabekir", "Merkez", "Sarıveliler"],
    "Kars": ["Akyaka", "Arpaçay", "Digor", "Kağızman", "Merkez", "Sarıkamış", "Selim", "Susuz"],
    "Kastamonu": ["Abana", "Ağlı", "Araç", "Azdavay", "Bozkurt", "Cide", "Çatalzeytin", "Daday", "Devrekani", "Doğanyurt", "Hanönü", "İhsangazi", "İnebolu", "Küre", "Merkez", "Pınarbaşı", "Seydiler", "Şenpazar", "Taşköprü", "Tosya"],
    "Kayseri": ["Akkışla", "Bünyan", "Develi", "Felahiye", "Hacılar", "İncesu", "Kocasinan", "Melikgazi", "Özvatan", "Pınarbaşı", "Sarıoğlan", "Sarız", "Talas", "Tomarza", "Yahyalı", "Yeşilhisar"],
    "Kırıkkale": ["Bahşılı", "Balışeyh", "Çelebi", "Delice", "Karakeçili", "Keskin", "Merkez", "Sulakyurt", "Yahşihan"],
    "Kırklareli": ["Babaeski", "Demirköy", "Kofçaz", "Lüleburgaz", "Merkez", "Pehlivanköy", "Pınarhisar", "Vize"],
    "Kırşehir": ["Akçakent", "Akpınar", "Boztepe", "Çiçekdağı", "Kaman", "Merkez", "Mucur"],
    "Kilis": ["Elbeyli", "Merkez", "Musabeyli", "Polateli"],
    "Kocaeli": ["Başiskele", "Çayırova", "Darıca", "Derince", "Dilovası", "Gebze", "Gölcük", "İzmit", "Kandıra", "Karamürsel", "Kartepe", "Körfez"],
    "Konya": ["Ahırlı", "Akören", "Akşehir", "Altınekin", "Beyşehir", "Bozkır", "Cihanbeyli", "Çeltik", "Çumra", "Derbent", "Derebucak", "Doğanhisar", "Emirgazi", "Ereğli", "Güneysınır", "Hadim", "Halkapınar", "Hüyük", "Ilgın", "Kadınhanı", "Karapınar", "Karatay", "Kulu", "Meram", "Sarayönü", "Selçuklu", "Seydişehir", "Taşkent", "Tuzlukçu", "Yalıhüyük", "Yunak"],
    "Kütahya": ["Altıntaş", "Aslanapa", "Chavdarhisar", "Domaniç", "Dumlupınar", "Emet", "Gediz", "Hisarcık", "Merkez", "Pazarlar", "Simav", "Şaphane", "Tavşanlı"],
    "Malatya": ["Akçadağ", "Arapgir", "Arguvan", "Battalgazi", "Darende", "Doğanşehir", "Doğanyol", "Hekimhan", "Kale", "Kuluncak", "Pütürge", "Yazıhan", "Yeşilyurt"],
    "Manisa": ["Ahmetli", "Akhisar", "Alaşehir", "Demirci", "Gölmarmara", "Gördes", "Kırkağaç", "Köprübaşı", "Kula", "Salihli", "Sarıgöl", "Saruhanlı", "Selendi", "Soma", "Şehzadeler", "Turgutlu", "Yunusemre"],
    "Mardin": ["Artuklu", "Dargeçit", "Derik", "Kızıltepe", "Mazıdağı", "Midyat", "Nusaybin", "Ömerli", "Savur", "Yeşilli"],
    "Mersin": ["Akdeniz", "Anamur", "Aydıncık", "Bozyazı", "Çamlıyayla", "Erdemli", "Gülnar", "Mezitli", "Mut", "Silifke", "Tarsus", "Toroslar", "Yenişehir"],
    "Muğla": ["Bodrum", "Dalaman", "Datça", "Fethiye", "Kavaklıdere", "Köyceğiz", "Marmaris", "Menteşe", "Milas", "Ortaca", "Seydikemer", "Ula", "Yatağan"],
    "Muş": ["Bulanık", "Hasköy", "Korkut", "Malazgirt", "Merkez", "Varto"],
    "Nevşehir": ["Acıgöl", "Avanos", "Derinkuyu", "Gülşehir", "Hacıbektaş", "Kozaklı", "Merkez", "Ürgüp"],
    "Niğde": ["Altunhisar", "Bor", "Çamardı", "Çiftlik", "Merkez", "Ulukışla"],
    "Ordu": ["Akkuş", "Altınordu", "Aybastı", "Çamaş", "Çatalpınar", "Çaybaşı", "Fatsa", "Gölköy", "Gülyalı", "Gürgentepe", "İkizce", "Kabadüz", "Kabataş", "Korgan", "Kumru", "Mesudiye", "Perşembe", "Ulubey", "Ünye"],
    "Osmaniye": ["Bahçe", "Düziçi", "Hasanbeyli", "Kadirli", "Merkez", "Sumbas", "Toprakkale"],
    "Rize": ["Ardeşen", "Çamlıhemşin", "Çayeli", "Derepazarı", "Fındıklı", "Güneysu", "Hemşin", "İkizdere", "İyidere", "Kalkandere", "Merkez", "Pazar"],
    "Sakarya": ["Adapazarı", "Akyazı", "Arifiye", "Erenler", "Ferizli", "Geyve", "Hendek", "Karapürçek", "Karasu", "Kaynarca", "Kocaali", "Pamukova", "Sapanca", "Serdivan", "Söğütlü", "Taraklı"],
    "Samsun": ["19 Mayıs", "Alaçam", "Asarcık", "Atakum", "Ayvacık", "Bafra", "Canik", "Çarşamba", "Havza", "İlkadım", "Kavak", "Ladik", "Salıpazarı", "Tekkeköy", "Terme", "Vezirköprü", "Yakakent"],
    "Siirt": ["Baykan", "Eruh", "Kurtalan", "Merkez", "Pervari", "Şirvan", "Tillo"],
    "Sinop": ["Ayancık", "Boyabat", "Dikmen", "Durağan", "Erfelek", "Gerze", "Merkez", "Saraydüzü", "Türkeli"],
    "Sivas": ["Akıncılar", "Altınyayla", "Divriği", "Doğanşar", "Gemerek", "Gölova", "Gürün", "Hafik", "İmranlı", "Kangal", "Koyulhisar", "Merkez", "Suşehri", "Şarkışla", "Ulaş", "Yıldızeli", "Zara"],
    "Şanlıurfa": ["Akçakale", "Birecik", "Bozova", "Ceylanpınar", "Eyyübiye", "Halfeti", "Haliliye", "Harran", "Hilvan", "Karaköprü", "Siverek", "Suruç", "Viranşehir"],
    "Şırnak": ["Beytüşşebap", "Cizre", "Güçlükonak", "İdil", "Merkez", "Silopi", "Uludere"],
    "Tekirdağ": ["Çerkezköy", "Çorlu", "Ergene", "Hayrabolu", "Kapaklı", "Malkara", "Marmaraereğlisi", "Muratlı", "Saray", "Süleymanpaşa", "Şarköy"],
    "Tokat": ["Almus", "Artova", "Başçiftlik", "Erbaa", "Merkez", "Niksar", "Pazar", "Reşadiye", "Sulusaray", "Turhal", "Yeşilyurt", "Zile"],
    "Trabzon": ["Akçaabat", "Araklı", "Arsin", "Beşikdüzü", "Çarşıbaşı", "Çaykara", "Dernekpazarı", "Düzköy", "Hayrat", "Köprübaşı", "Maçka", "Of", "Ortahisar", "Sürmene", "Şalpazarı", "Tonya", "Vakfıkebir", "Yomra"],
    "Tunceli": ["Çemişgezek", "Hozat", "Mazgirt", "Merkez", "Nazımiye", "Ovacık", "Pertek", "Pülümür"],
    "Uşak": ["Banaz", "Eşme", "Karahallı", "Merkez", "Sivaslı", "Ulubey"],
    "Van": ["Bahçesaray", "Başkale", "Çaldıran", "Çatak", "Edremit", "Erciş", "Gevaş", "Gürpınar", "İpekyolu", "Muradiye", "Özalp", "Saray", "Tuşba"],
    "Yalova": ["Altınova", "Armutlu", "Çınarcık", "Çiftlikköy", "Merkez", "Termal"],
    "Yozgat": ["Akdağmadeni", "Aydıncık", "Boğazlıyan", "Çandır", "Çayıralan", "Çekerek", "Kadışehri", "Merkez", "Saraykent", "Sarıkaya", "Sorgun", "Şefaatli", "Yenifakılı", "Yerköy"],
    "Zonguldak": ["Alaplı", "Çaycuma", "Devrek", "Ereğli", "Gökçebey", "Kilimli", "kozlu", "Merkez"]
};

let allBreedingPets = [];

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    loadPets();

    // 1. ŞEHİRLERİ LİSTEYE DOLDUR
    const cityListElement = document.getElementById('cityOptions');
    if(cityListElement) {
        for (const city in cityData) {
            const option = document.createElement('option');
            option.value = city;
            cityListElement.appendChild(option);
        }
    }

    // 2. ŞEHİR SEÇİLİNCE İLÇELERİ GETİR VE FİLTRELE
    const cityInput = document.getElementById('filterCity');
    const districtSelect = document.getElementById('filterDistrict');

    if (cityInput) {
        cityInput.addEventListener('input', function() {
            const selectedCity = this.value;
            
            districtSelect.innerHTML = '<option value="">İlçe Seç</option>';
            districtSelect.disabled = true;

            if (cityData[selectedCity]) {
                districtSelect.disabled = false;
                cityData[selectedCity].forEach(district => {
                    const option = document.createElement('option');
                    option.value = district;
                    option.textContent = district;
                    districtSelect.appendChild(option);
                });
            }
            applyFilters(); // Her tuşta filtrele
        });
    }

    if (districtSelect) {
        districtSelect.addEventListener('change', applyFilters);
    }
});

// NAVBAR GÜNCELLEME
function updateNavbar() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const navbarList = document.querySelector('.navbar-nav'); 
    if (!navbarList) return;

    const commonLinks = `
        <li class="nav-item"><a class="nav-link" href="index.html">Ana Sayfa</a></li>
        <li class="nav-item"><a class="nav-link" href="vets.html">Veteriner Bul</a></li>
        <li class="nav-item"><a class="nav-link active fw-bold text-love" href="breeding.html">Eş Bul</a></li>
        <li class="nav-item"><a class="nav-link" href="pets.html">Sahiplen</a></li> 
        <li class="nav-item"><a class="nav-link" href="caretakers.html">Bakıcılar</a></li>
    `;

    if (token && userStr) {
        navbarList.innerHTML = `
            ${commonLinks}
            <li class="nav-item"><a class="nav-link" href="messages.html">Mesajlar</a></li>
            <li class="nav-item"><a class="nav-link" href="profile.html">Profilim</a></li>
            <li class="nav-item ms-2"><a href="add-breeding.html" class="btn btn-love rounded-pill px-3"><i class="fa-solid fa-plus"></i> İlan Ver</a></li>
            <li class="nav-item ms-2"><button onclick="logout()" class="btn btn-sm btn-outline-danger rounded-pill px-3 mt-1">Çıkış</button></li>
        `;
    } else {
        navbarList.innerHTML = `
            ${commonLinks}
            <li class="nav-item ms-2"><a class="btn btn-sm btn-outline-primary rounded-pill px-3" href="login.html">Giriş Yap</a></li>
            <li class="nav-item ms-1"><a class="btn btn-sm btn-primary rounded-pill px-3 mt-1 text-white" href="register.html">Kayıt Ol</a></li>
        `;
    }
}

// VERİLERİ ÇEK
async function loadPets() {
    const list = document.getElementById('breedingList');
    if (!list) return;

    try {
        const res = await fetch(`${API_URL}/api/breeding-pets`);
        if (!res.ok) throw new Error("Veri çekilemedi");
        
        allBreedingPets = await res.json();
        renderPets(allBreedingPets);

    } catch (error) {
        console.error("Hata:", error);
        list.innerHTML = `<div class="col-12 text-center text-danger">Veriler yüklenemedi.</div>`;
    }
}

// LİSTELEME VE KART OLUŞTURMA (GÜNCELLENEN KISIM)
function renderPets(pets) {
    const list = document.getElementById('breedingList');
    list.innerHTML = '';

    if (pets.length === 0) {
        list.innerHTML = `<div class="col-12 text-center py-5"><p class="text-muted">Bu kriterlere uygun eş adayı bulunamadı.</p></div>`;
        return;
    }

    pets.forEach(pet => {
        let imgUrl = 'https://via.placeholder.com/400x300?text=Resim+Yok';
        const resimVerisi = pet.imageUrl || pet.imageurl; 
        if (resimVerisi) {
            imgUrl = resimVerisi.startsWith('http') ? resimVerisi : `${API_URL}${resimVerisi}`;
        }
        
// --- KONUM AYRIŞTIRMA (GÜNCELLENDİ) ---
        let locationInfo = "Konum Bilgisi Yok";
        
        // 1. Önce veritabanındaki location sütununa bak
        if (pet.location) {
            locationInfo = pet.location;
        } 
        // 2. Yoksa description içindeki [Konum: İstanbul/Kadıköy] formatını ara
        else if (pet.description && pet.description.includes('[Konum:')) {
            const match = pet.description.match(/\[Konum:\s*(.*?)\]/);
            if (match && match[1]) {
                locationInfo = match[1];
            }
        }
        // --- İLAN SAHİBİ VE MAVİ TİK MANTIĞI ---
        const ownerName = pet.ownername || pet.ownerName || "İsimsiz Kullanıcı";
        
        // Backend'den gelen 'ownerVerified' bilgisini kontrol et
        const verifiedData = pet.ownerVerified || pet.ownerverified;
        const isVerified = (verifiedData === true || verifiedData === 1 || verifiedData === "true");

        // Mavi Tik İkonu (SVG)
        const verifiedBadge = isVerified ? 
            `<svg class="verified-tick" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: #1da1f2; margin-left: 3px; vertical-align: middle;">
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.416-.166-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 2.049 1.43 3.81 3.35 4.327a4.56 4.56 0 00-.238 1.402c0 2.21 1.71 4 3.818 4 .47 0 .92-.084 1.336-.25.62 1.333 1.926 2.25 3.437 2.25s2.816-.917 3.437-2.25c.416.166.866.25 1.336.25 2.11 0 3.818-1.79 3.818-4 0-.495-.084-.965-.238-1.402 1.92-.517 3.35-2.278 3.35-4.327zM12 17.5l-4.5-4.5 1.414-1.414L12 14.672l7.086-7.086 1.414 1.414L12 17.5z"/>
            </svg>` 
            : '';

        // Kart HTML (İsim ve Tik eklendi)
        list.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <div class="position-relative">
                        <img src="${imgUrl}" class="card-img-top" style="height: 250px; object-fit: cover;">
                        <span class="badge bg-danger position-absolute top-0 end-0 m-3 shadow-sm">
                            <i class="fa-solid fa-heart"></i> Eş Arıyor
                        </span>
                    </div>
                    <div class="card-body p-4 text-center">
                        <h5 class="card-title fw-bold" style="color: #d63384;">${pet.name}</h5>
                        
                        <div class="d-flex justify-content-center gap-2 mb-2">
                             <span class="badge bg-light text-dark border">${pet.species}</span>
                             <span class="badge bg-light text-dark border">${pet.gender}</span>
                        </div>

                        <div class="mb-2 text-muted small">
                             <i class="fa-solid fa-location-dot me-1"></i> ${locationInfo}
                        </div>

                        <div class="mb-3">
                            <a href="user-profile.html?id=${pet.user_id}" class="text-decoration-none fw-bold text-dark small">
                                <i class="fa-solid fa-user-circle text-muted"></i> ${ownerName} ${verifiedBadge}
                            </a>
                        </div>
                        
                        <a href="breeding-detail.html?id=${pet.id}" class="btn btn-outline-danger w-100 rounded-pill fw-bold" style="border-color: #d63384; color: #d63384;">
                            Adayı İncele
                        </a>
                    </div>
                </div>
            </div>`;
    });
}

// FİLTRELEME FONKSİYONU
function applyFilters() {
    const filterSpecies = document.getElementById('filterSpecies');
    const filterCity = document.getElementById('filterCity');
    const filterDistrict = document.getElementById('filterDistrict');

    const sVal = filterSpecies ? filterSpecies.value : 'all';
    const cityVal = filterCity ? filterCity.value.toLowerCase() : '';
    const distVal = filterDistrict ? filterDistrict.value.toLowerCase() : '';

    const filtered = allBreedingPets.filter(p => {
        const matchSpecies = (sVal === 'all' || p.species === sVal);
        
        const locationText = (p.location || p.description || "").toLowerCase();
        
        let matchLocation = true;
        if (distVal) {
            matchLocation = locationText.includes(distVal);
        } else if (cityVal) {
            matchLocation = locationText.includes(cityVal);
        }

        return matchSpecies && matchLocation;
    });

    renderPets(filtered);
}

// Olay Dinleyicileri
const fSpecies = document.getElementById('filterSpecies');
if(fSpecies) fSpecies.addEventListener('change', applyFilters);

const btnReset = document.getElementById('btnReset');
if(btnReset) btnReset.addEventListener('click', () => {
    if(fSpecies) fSpecies.value = 'all';
    if(document.getElementById('filterCity')) document.getElementById('filterCity').value = '';
    
    const distSelect = document.getElementById('filterDistrict');
    if(distSelect) {
        distSelect.innerHTML = '<option value="">İlçe Seç</option>';
        distSelect.disabled = true;
    }

    renderPets(allBreedingPets);
});

window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}