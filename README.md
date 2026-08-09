# rootadmin.uz

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-7iindtg3)
1.Kerakli paketlarni o'rnatish:Node.js, Nginx va Git vositalari.Server tizimini yangilab, loyiha uchun zarur bo'lgan dasturlarni o'rnatamiz.Bash# Tizimni yangilash
sudo apt update && sudo apt upgrade -y

# Node.js (20.x LTS), Nginx va Git'ni o'rnatish
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
2.Loyihani yuklab olish:GitHub repozitoriyasini serverga klonlash.Standart papkaga o'tib, ko'rsatilgan repozitoriyadan fayllarni tortib olamiz va konfiguratsiyaga rasmiy pochta manzilini biriktiramiz.Bashsudo mkdir -p /var/www/
cd /var/www/

# Repozitoriyani yuklab olish
sudo git clone https://github.com/xushnudbekraximov777-debug/rootadmin.uz.git
cd rootadmin.uz

# Git konfiguratsiyasini sozlash
git config user.email "raximovxushnudbekn1@gmail.com"
3.Muhit o'zgaruvchilarini (.env) sozlash:Supabase ma'lumotlar bazasiga ulanish.Loyiha to'g'ri ishlashi uchun Supabase API kalitlari kiritilishi kerak.Bashnano .env
Ochilgan fayl ichiga quyidagi ma'lumotlarni kiriting va saqlang (Ctrl+O, Enter, Ctrl+X):envVITE_SUPABASE_URL=https://wmdfdcnpzzikbbqkfzso.supabase.co
VITE_SUPABASE_ANON_KEY=sizning_anon_kalitingiz_shu_yerga_yoziladi
4.Loyihani yig'ish (Build):React/Vite loyihasini statik fayllarga aylantirish.Barcha kutubxonalarni o'rnatib, ishlab chiqarishga (production) mo'ljallangan statik fayllarni generatsiya qilamiz.Bash# Kutubxonalarni o'rnatish
sudo npm install

# Build jarayonini ishga tushirish (dist papkasi yaratiladi)
sudo npm run build
5.Nginx virtual xostini sozlash:Faqat HTTP (80-port) orqali ishga tushirish.Loyihani domenga ulash uchun Nginx konfiguratsiyasini yaratamiz.Bashsudo nano /etc/nginx/sites-available/rootadmin.uz
Fayl ichiga quyidagi xavfsiz konfiguratsiyani joylashtiring:Nginxserver {
    listen 80;
    server_name rootadmin.uz www.rootadmin.uz;

    # Build qilingan fayllar manzili
    root /var/www/rootadmin.uz/dist;
    index index.html;

    # Xavfsizlik sarlavhalari
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # React Router uchun marshrutlash
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Statik fayllarni keshga olish
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
6.Serverni faollashtirish:Konfiguratsiyani tekshirish va Nginx'ni qayta ishga tushirish.Yozilgan Nginx konfiguratsiyasini faollashtiramiz va xizmatni yangilaymiz.Bash# Konfiguratsiyani faollashtirish
sudo ln -s /etc/nginx/sites-available/rootadmin.uz /etc/nginx/sites-enabled/

# Default Nginx sahifasini o'chirish (ixtiyoriy)
sudo rm /etc/nginx/sites-enabled/default

# Xatoliklar yo'qligini tekshirish
sudo nginx -t

# Nginx xizmatini qayta ishga tushirish
sudo systemctl restart nginx
