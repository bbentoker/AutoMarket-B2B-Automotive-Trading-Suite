sudo nano /etc/nginx/sites-available/automarket.example.com

# Paste this configuration:
server {
    listen 80;
    server_name automarket.example.com buy.automarket.example.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

sudo ln -s /etc/nginx/sites-available/automarket.example.com /etc/nginx/sites-enabled/

sudo certbot --nginx -d automarket.example.com -d buy.automarket.example.com