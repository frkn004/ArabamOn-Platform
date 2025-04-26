#!/bin/bash

cat > arabamon.conf << 'CONFEND'
server {
    listen 443 ssl;
    server_name arac.duftech.com.tr;

    ssl_certificate /etc/letsencrypt/live/arac.duftech.com.tr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/arac.duftech.com.tr/privkey.pem;

    location / {
        root /var/www/arabamon/client/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name arac.duftech.com.tr;
    return 301 https://$server_name$request_uri;
}
CONFEND

sudo mv arabamon.conf /etc/nginx/conf.d/
sudo systemctl restart nginx 