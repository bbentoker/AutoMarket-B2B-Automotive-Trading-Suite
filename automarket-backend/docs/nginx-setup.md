# SECURITY-SANITIZED: Production brand and infrastructure details were redacted for public showcase.

sudo nano /etc/nginx/sites-available/api.automarket.example.com

# Paste this configuration:

server {
listen 80;
server_name api.automarket.example.com;

    # Allow large file uploads (200MB)
    client_max_body_size 200M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

}

sudo ln -s /etc/nginx/sites-available/api.automarket.example.com /etc/nginx/sites-enabled/

sudo certbot --nginx -d api.automarket.example.com

sudo nginx -t

sudo systemctl reload nginx
