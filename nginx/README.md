# Nginx SSL Certificate Setup

This directory should contain your SSL certificates for HTTPS.

## Option 1: Let's Encrypt (Recommended for Production)

Install certbot on your Portainer VM and generate certificates:

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d cloudstack-mcp.irqstudio.com

# Certificates will be in: /etc/letsencrypt/live/cloudstack-mcp.irqstudio.com/
# Copy to this directory:
sudo cp /etc/letsencrypt/live/cloudstack-mcp.irqstudio.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/cloudstack-mcp.irqstudio.com/privkey.pem nginx/ssl/
sudo chmod 644 nginx/ssl/fullchain.pem
sudo chmod 600 nginx/ssl/privkey.pem
```

## Option 2: Use Existing CloudStack Certificate

If you have a wildcard certificate (*.irqstudio.com):

```bash
# Copy from CloudStack management server
scp root@cloudstack-mgmt:/path/to/cert/fullchain.pem nginx/ssl/
scp root@cloudstack-mgmt:/path/to/cert/privkey.pem nginx/ssl/
chmod 644 nginx/ssl/fullchain.pem
chmod 600 nginx/ssl/privkey.pem
```

## Option 3: Self-Signed Certificate (Development Only)

For testing purposes only:

```bash
cd nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -subj "/CN=cloudstack-mcp.irqstudio.com"
chmod 644 fullchain.pem
chmod 600 privkey.pem
```

**Note:** Self-signed certificates will show security warnings in browsers and may cause issues with some clients.

## File Structure

After setup, this directory should contain:

```
nginx/
├── nginx.conf          (Nginx configuration - already included)
├── README.md          (This file)
└── ssl/
    ├── fullchain.pem  (SSL certificate + chain)
    └── privkey.pem    (Private key)
```

## Certificate Renewal

Let's Encrypt certificates expire every 90 days. Set up auto-renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Auto-renewal (runs twice daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# After renewal, copy new certs and restart container
sudo cp /etc/letsencrypt/live/cloudstack-mcp.irqstudio.com/*.pem nginx/ssl/
docker-compose restart nginx
```
