
# EchoTrack 🎶

**Kendi kişisel radyo evreninizi yaratın. EchoTrack, favori çevrimiçi radyo istasyonlarınızı tek bir yerden izlemenizi, keşfetmenizi ve yönetmenizi sağlayan modern bir müzik keşif uygulamasıdır.**

<!-- Buraya uygulamanızın ekran görüntüsünü ekleyin! -->
<!-- ![EchoTrack Ekran Görüntüsü](https://example.com/screenshot.png) -->

---

## 🚀 Hakkında

Hiç aynı anda birden fazla online radyoda ne çaldığını merak ettiniz mi? Veya bir radyoda duyduğunuz harika bir şarkıyı daha sonra hatırlamak için not almayı unuttunuz mu? EchoTrack, bu sorunları çözmek için tasarlandı.

Bu uygulama ile, kendi radyo istasyonu koleksiyonunuzu oluşturabilir, onları renkli kategorilere ayırabilir ve tüm istasyonlardan çalan şarkıları canlı olarak takip edebilirsiniz. Çalan her şarkı otomatik olarak geçmişinize kaydedilir, böylece hiçbir keşfi kaçırmazsınız.

## ✨ Temel Özellikler

*   **Sınırsız İstasyon:** Dilediğiniz kadar çevrimiçi radyo istasyonu (SHOUTcast/Icecast) ekleyin.
*   **Canlı Takip:** Tüm istasyonlarınızda o an çalan şarkı ve sanatçı bilgilerini anlık olarak görün.
*   **Özelleştirilebilir Kategoriler:** İstasyonlarınızı "Rock", "Chill", "Türkçe Pop" gibi kendi oluşturduğunuz, renk kodlu kategorilere ayırarak düzenleyin.
*   **Dinamik Renk Paleti:** Her istasyon kartı, atadığınız kategorinin rengine bürünerek görsel olarak zengin ve ayırt edici bir arayüz sunar.
*   **Otomatik Şarkı Geçmişi:** Çalan her şarkı, istasyon adı ve zaman bilgisiyle birlikte otomatik olarak geçmişinize kaydedilir.
*   **Favoriler:** Beğendiğiniz şarkıları tek tıkla favorilerinize ekleyin.
*   **Dışa Aktarma:** Tüm şarkı geçmişinizi, favorilerinizi veya belirli bir istasyonun geçmişini `.txt` dosyası olarak indirin.
*   **Ses Çalar & Görselleştirici:** İstasyonları doğrudan uygulama içinden dinleyin ve minimalist ses dalgası görselleştirmesinin keyfini çıkarın.
*   **Manuel Yenileme:** Bilgileri anında tazelemek için hem her kartta hem de genel olarak yenileme butonları.

## 🛠️ Kullanılan Teknolojiler

*   **Framework:** [Next.js](https://nextjs.org/) - React Çerçevesi
*   **UI Kütüphanesi:** [React](https://react.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Bileşenler:** [shadcn/ui](https://ui.shadcn.com/)
*   **İkonlar:** [Lucide React](https://lucide.dev/)

---

## 💿 Kurulum

Projeyi kendi sunucunuzda veya yerel makinenizde çalıştırmak için aşağıdaki adımları izleyebilirsiniz.

### 1. VDS/VPS (Üretim) Ortamı İçin Kurulum

Bu rehber, Ubuntu 22.04 veya benzeri bir Debian tabanlı Linux dağıtımı çalıştıran bir sanal sunucu için hazırlanmıştır.

#### Adım 1: Sunucuya Bağlanın
```bash
ssh kullanici_adiniz@sunucu_ip_adresiniz
```

#### Adım 2: Gerekli Paketleri Kurun
Node.js (versiyon 20.x veya üstü), npm ve `nginx` web sunucusunu kurun.

```bash
# Node.js 20.x'i kurmak için Nodesource reposunu ekleyin
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Gerekli paketleri kurun
sudo apt-get update
sudo apt-get install -y nodejs nginx
```

#### Adım 3: Proje Dosyalarını Sunucuya Yükleyin
Proje dosyalarınızı yerel makinenizden sunucuya kopyalayın. `scp` veya `rsync` kullanabilirsiniz. Alternatif olarak, projeyi GitHub'dan klonlayın.

```bash
git clone https://github.com/kullanici-adiniz/echotrack.git
cd echotrack
```

#### Adım 4: Proje Bağımlılıklarını Kurun ve Projeyi Build Edin
Projenin çalışması için gerekli olan `node_modules` klasörünü oluşturun ve Next.js projesini üretim için derleyin (`build`).

```bash
npm install
npm run build
```

#### Adım 5: Uygulamayı Çalıştırmak İçin Servis Oluşturun
Uygulamanın sunucu yeniden başlasa bile otomatik olarak çalışmasını sağlamak için bir `systemd` servisi oluşturun.

```bash
sudo nano /etc/systemd/system/echotrack.service
```

Açılan editörün içine aşağıdaki içeriği yapıştırın. `User` ve `WorkingDirectory` yollarını kendi sisteminize göre güncellediğinizden emin olun.

```ini
[Unit]
Description=EchoTrack Next.js Application
After=network.target

[Service]
User=kullanici_adiniz  # Sunucudaki kullanıcı adınız
Group=www-data
WorkingDirectory=/home/kullanici_adiniz/echotrack # Projenizin tam yolu
Environment="NODE_ENV=production"
ExecStart=npm start # package.json dosyasındaki "start" komutunu çalıştırır

Restart=always

[Install]
WantedBy=multi-user.target
```

Servisi etkinleştirin ve başlatın:

```bash
sudo systemctl daemon-reload
sudo systemctl enable echotrack
sudo systemctl start echotrack
```

Servisin durumunu kontrol edin: `sudo systemctl status echotrack`

#### Adım 6: Nginx'i Reverse Proxy Olarak Yapılandırın
Gelen istekleri (port 80) uygulamanızın çalıştığı porta (port 3000) yönlendirmek için `nginx`'i yapılandırın.

```bash
sudo nano /etc/nginx/sites-available/echotrack
```

Aşağıdaki yapılandırmayı dosyaya yapıştırın. `server_name` kısmını kendi alan adınızla veya sunucu IP adresinizle değiştirin.

```nginx
server {
    listen 80;
    server_name alanadiniz.com www.alanadiniz.com; # veya sunucu_ip_adresiniz

    location / {
        proxy_pass http://localhost:3000; # Next.js uygulamasının çalıştığı port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Bu yapılandırmayı etkinleştirin ve `nginx`'i yeniden başlatın:
```bash
sudo ln -s /etc/nginx/sites-available/echotrack /etc/nginx/sites-enabled/
sudo nginx -t # Yapılandırma hatası olup olmadığını kontrol eder
sudo systemctl restart nginx
```

Artık `http://alanadiniz.com` veya sunucunuzun IP adresi üzerinden uygulamanıza erişebilirsiniz.

---

### 2. Yerel Geliştirme Ortamı İçin Kurulum

Projeyi kendi bilgisayarınızda geliştirmek veya denemek için:

#### Adım 1: Projeyi Klonlayın
```bash
git clone https://github.com/kullanici-adiniz/echotrack.git
cd echotrack
```

#### Adım 2: Bağımlılıkları Kurun
```bash
npm install
```

#### Adım 3: Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

Uygulama varsayılan olarak [http://localhost:9002](http://localhost:9002) adresinde çalışmaya başlayacaktır. Tarayıcınızda bu adresi açarak uygulamayı görebilirsiniz.
