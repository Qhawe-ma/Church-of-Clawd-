#!/bin/bash
# ============================================================
#  setup-vps.sh  —  Run this ONCE on a fresh VPS
#  ssh root@38.180.21.214
#  bash setup-vps.sh yourdomain.com
# ============================================================

DOMAIN=${1:-"churchofclawd.org"}
APP_DIR="/var/www/$DOMAIN"

echo ""
echo "🕍  Church of Clawd — VPS Setup"
echo "   Domain: $DOMAIN"
echo ""

# ── 1. System packages ────────────────────────────────────────
apt-get update -y
apt-get install -y curl nginx certbot python3-certbot-nginx ufw

# ── 2. Node.js 20 ─────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "✅ Node $(node -v)"

# ── 3. PM2 ────────────────────────────────────────────────────
npm install -g pm2 2>/dev/null
echo "✅ PM2 $(pm2 -v)"

# ── 4. Project Directory ──────────────────────────────────────
echo "Creating directory $APP_DIR..."
mkdir -p "$APP_DIR"
chown -R root:root "$APP_DIR"

# ── 5. Firewall ───────────────────────────────────────────────
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── 6. Nginx reverse proxy ────────────────────────────────────
cat > /etc/nginx/sites-available/churchofclawd << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/churchofclawd /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "✅ Nginx configured for $DOMAIN"

# ── 7. SSL with Let's Encrypt ─────────────────────────────────
echo ""
echo "🔐 Getting SSL certificate for $DOMAIN..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" || \
  echo "⚠️  SSL skipped (make sure DNS points to this server first)"

# ── 8. PM2 startup on reboot ─────────────────────────────────
pm2 startup systemd -u root --hp /root | tail -1 | bash 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════════"
echo "✅  VPS setup complete!"
echo ""
echo "Next step: run deploy.ps1 from your Windows"
echo "machine to upload and start the app."
echo ""
echo "Then visit: https://$DOMAIN"
echo "═══════════════════════════════════════════"
