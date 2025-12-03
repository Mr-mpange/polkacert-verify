# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] Copy `.env.production` to `.env`
- [ ] Set production Supabase credentials
- [ ] Use Polkadot mainnet endpoint
- [ ] Add Subscan production API key
- [ ] Configure CORS allowed origins
- [ ] Set production domain URLs

### 2. Database Setup

- [ ] Run all migrations on production database
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Configure authentication policies
- [ ] Set up automated backups
- [ ] Test database connections

### 3. Security Hardening

- [ ] Enable HTTPS/SSL
- [ ] Configure Content Security Policy (CSP)
- [ ] Set up rate limiting
- [ ] Enable CORS restrictions
- [ ] Configure session timeouts
- [ ] Review and update API keys

### 4. Performance Optimization

- [ ] Build production bundle
- [ ] Enable code splitting
- [ ] Optimize images
- [ ] Configure CDN (optional)
- [ ] Enable caching
- [ ] Minify assets

### 5. Monitoring & Logging

- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics)
- [ ] Enable performance monitoring
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation

---

## Deployment Steps

### Option 1: Vercel (Recommended)

**Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2: Login**
```bash
vercel login
```

**Step 3: Configure Project**
```bash
# In project root
vercel
```

**Step 4: Set Environment Variables**
```bash
# Add each variable
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_POLKADOT_ENDPOINT production
vercel env add VITE_SUBSCAN_API_KEY production
```

**Step 5: Deploy**
```bash
vercel --prod
```

**Configuration File** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

### Option 2: Netlify

**Step 1: Install Netlify CLI**
```bash
npm install -g netlify-cli
```

**Step 2: Login**
```bash
netlify login
```

**Step 3: Initialize**
```bash
netlify init
```

**Step 4: Configure Build**

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

**Step 5: Deploy**
```bash
netlify deploy --prod
```

---

### Option 3: Docker

**Step 1: Create Dockerfile**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Step 2: Create nginx.conf**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Step 3: Build and Run**
```bash
# Build image
docker build -t polkacert-verify .

# Run container
docker run -d -p 80:80 --name polkacert polkacert-verify
```

**Step 4: Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - polkacert-network

networks:
  polkacert-network:
    driver: bridge
```

---

### Option 4: AWS S3 + CloudFront

**Step 1: Build**
```bash
npm run build
```

**Step 2: Create S3 Bucket**
```bash
aws s3 mb s3://your-bucket-name
```

**Step 3: Configure Bucket**
```bash
# Enable static website hosting
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html

# Set bucket policy
aws s3api put-bucket-policy --bucket your-bucket-name --policy file://bucket-policy.json
```

**bucket-policy.json**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

**Step 4: Upload**
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

**Step 5: Create CloudFront Distribution**
```bash
aws cloudfront create-distribution --origin-domain-name your-bucket-name.s3.amazonaws.com
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check application
curl https://yourdomain.com

# Check API endpoints
curl https://yourdomain.com/api/health

# Test certificate verification
# Navigate to: https://yourdomain.com/verify
```

### 2. Configure DNS

**Add DNS Records:**
```
Type: A
Name: @
Value: [Your server IP or CDN IP]

Type: CNAME
Name: www
Value: yourdomain.com
```

### 3. SSL/TLS Certificate

**Using Let's Encrypt (Free):**
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 4. Set Up Monitoring

**Uptime Monitoring:**
- UptimeRobot: https://uptimerobot.com/
- Pingdom: https://www.pingdom.com/

**Error Tracking:**
```bash
# Install Sentry
npm install @sentry/react @sentry/tracing

# Configure in src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

**Analytics:**
```bash
# Google Analytics
# Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### 5. Performance Optimization

**Enable CDN:**
- Cloudflare: https://www.cloudflare.com/
- AWS CloudFront
- Fastly

**Image Optimization:**
```bash
# Install image optimizer
npm install -D vite-plugin-imagemin

# Configure in vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

export default {
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9] },
      svgo: { plugins: [{ name: 'removeViewBox' }] },
    }),
  ],
};
```

---

## Security Best Practices

### 1. Environment Variables

```bash
# Never commit .env files
# Use secrets management:
# - Vercel: Environment Variables
# - Netlify: Environment Variables
# - AWS: Secrets Manager
# - Docker: Docker Secrets
```

### 2. API Security

```typescript
// Add rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. CORS Configuration

```typescript
// Configure CORS
const allowedOrigins = process.env.VITE_ALLOWED_ORIGINS?.split(',') || [];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
```

### 4. Content Security Policy

```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               font-src 'self' data:; 
               connect-src 'self' https://*.supabase.co wss://*.polkadot.io https://*.subscan.io;">
```

---

## Maintenance

### Regular Tasks

**Daily:**
- [ ] Monitor error logs
- [ ] Check uptime status
- [ ] Review security alerts

**Weekly:**
- [ ] Review performance metrics
- [ ] Check database backups
- [ ] Update dependencies (if needed)

**Monthly:**
- [ ] Security audit
- [ ] Performance optimization
- [ ] Cost analysis
- [ ] User feedback review

### Backup Strategy

```bash
# Database backups (Supabase)
# - Automatic daily backups (enabled by default)
# - Manual backups before major changes

# Code backups
# - Git repository (GitHub/GitLab)
# - Tagged releases

# Environment backups
# - Secure storage of .env files
# - Secrets management system
```

---

## Rollback Plan

### Quick Rollback

**Vercel:**
```bash
vercel rollback
```

**Netlify:**
```bash
netlify rollback
```

**Docker:**
```bash
docker pull polkacert-verify:previous-tag
docker-compose up -d
```

### Database Rollback

```bash
# Restore from backup
# In Supabase dashboard:
# Settings > Database > Backups > Restore
```

---

## Support & Troubleshooting

### Common Issues

**Issue: Build fails**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

**Issue: Environment variables not loading**
```bash
# Check .env file exists
# Verify variable names start with VITE_
# Restart development server
```

**Issue: Database connection fails**
```bash
# Check Supabase project status
# Verify credentials in .env
# Check network/firewall settings
```

---

## Performance Benchmarks

### Target Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Monitoring Tools

- Lighthouse CI
- WebPageTest
- GTmetrix
- Google PageSpeed Insights

---

## Cost Estimation

### Monthly Costs (Approximate)

**Free Tier:**
- Vercel/Netlify: Free (hobby projects)
- Supabase: Free (up to 500MB database)
- Polkadot: Free (transaction fees only)
- Total: ~$0-10/month

**Production:**
- Hosting: $20-50/month
- Supabase Pro: $25/month
- CDN: $10-30/month
- Monitoring: $10-20/month
- Total: ~$65-125/month

**Enterprise:**
- Hosting: $100-500/month
- Database: $100-300/month
- CDN: $50-200/month
- Monitoring: $50-100/month
- Total: ~$300-1100/month

---

## Compliance & Legal

- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] GDPR Compliance (if EU users)
- [ ] Data Protection
- [ ] Accessibility (WCAG 2.1)

---

**Ready for production? Follow this guide step by step!** 🚀
