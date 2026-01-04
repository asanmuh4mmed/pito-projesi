const jwt = require('jsonwebtoken');

// Bu fonksiyon bizim "bilet kontrol memurumuz" olacak.
const protect = (req, res, next) => {
    let token;

    // İstek başlıklarında (headers) 'Authorization' alanı var mı diye kontrol et
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 'Bearer ' kelimesini atıp sadece token'ı al
            token = req.headers.authorization.split(' ')[1];

            // Token'ı doğrula
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Token'dan gelen kullanıcı bilgilerini isteğin içine ekle
            // Bu sayede sonraki rota, isteği kimin yaptığını bilecek
            req.user = decoded; 

            // Her şey yolundaysa, bir sonraki adıma geç
            next();

        } catch (error) {
            console.error('Token doğrulama hatası:', error);
            res.status(401).json({ message: 'Yetkisiz erişim, token geçersiz.' });
        }
    }

    // Eğer token hiç yoksa...
    if (!token) {
        res.status(401).json({ message: 'Yetkisiz erişim, token bulunamadı.' });
    }
};

module.exports = { protect };