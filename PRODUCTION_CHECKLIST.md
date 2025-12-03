# ✅ Production Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Copy `.env.production` to `.env`
- [ ] Set `VITE_SUPABASE_URL` (production)
- [ ] Set `VITE_SUPABASE_ANON_KEY` (production)
- [ ] Set `VITE_POLKADOT_ENDPOINT` to mainnet: `wss://rpc.polkadot.io`
- [ ] Set `VITE_SUBSCAN_API_KEY` (production key)
- [ ] Configure `VITE_ALLOWED_ORIGINS` with your domain
- [ ] Set `VITE_APP_URL` to your production URL

### Database
- [ ] Create production Supabase project
- [ ] Run all migrations in order
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Configure authentication policies
- [ ] Set up automated backups
- [ ] Test database connections
- [ ] Create admin user account

### Security
- [ ] Review and update all API keys
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure CORS restrictions
- [ ] Set up rate limiting
- [ ] Enable Content Security Policy
- [ ] Configure session timeouts
- [ ] Review authentication flows
- [ ] Test security headers

### Code Quality
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run build` - successful
- [ ] Test production build locally: `npm run preview`
- [ ] Remove console.logs from production code
- [ ] Remove debug code
- [ ] Update version number in package.json

### Performance
- [ ] Optimize images
- [ ] Enable code splitting
- [ ] Configure caching headers
- [ ] Test bundle size
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test on slow 3G connection

### Testing
- [ ] Test certificate issuance
- [ ] Test certificate verification
- [ ] Test QR code scanning
- [ ] Test AI verification
- [ ] Test ML model (if trained)
- [ ] Test admin dashboard
- [ ] Test user authentication
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Test blockchain transactions

## Deployment

### Choose Platform
- [ ] Vercel (recommended for quick deploy)
- [ ] Netlify (alternative)
- [ ] Docker (for custom hosting)
- [ ] AWS S3 + CloudFront (for AWS users)

### Vercel Deployment
```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Netlify Deployment
```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Docker Deployment
```bash
# Build
docker build -t polkacert-verify .

# Run
docker-compose up -d
```

### Environment Variables (Platform)
- [ ] Add all VITE_* variables to platform
- [ ] Verify variables are loaded correctly
- [ ] Test with production values

## Post-Deployment

### DNS Configuration
- [ ] Point domain to deployment
- [ ] Configure A record
- [ ] Configure CNAME for www
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Test domain access

### SSL/TLS
- [ ] Verify HTTPS is working
- [ ] Test SSL certificate
- [ ] Configure auto-renewal
- [ ] Test HTTP to HTTPS redirect

### Monitoring Setup
- [ ] Set up uptime monitoring (UptimeRobot/Pingdom)
- [ ] Configure error tracking (Sentry)
- [ ] Set up analytics (Google Analytics)
- [ ] Configure performance monitoring
- [ ] Set up log aggregation
- [ ] Create status page

### Testing Production
- [ ] Access via production URL
- [ ] Test all major features
- [ ] Verify blockchain connection
- [ ] Test certificate operations
- [ ] Check error handling
- [ ] Test on multiple devices
- [ ] Verify analytics tracking

### Documentation
- [ ] Update README with production URL
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document rollback procedure
- [ ] Update API documentation

### Compliance
- [ ] Add Privacy Policy
- [ ] Add Terms of Service
- [ ] Add Cookie Policy
- [ ] GDPR compliance (if EU users)
- [ ] Accessibility audit (WCAG 2.1)

## Ongoing Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review security alerts

### Weekly
- [ ] Review performance metrics
- [ ] Check database backups
- [ ] Review user feedback
- [ ] Update dependencies (if needed)

### Monthly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Cost analysis
- [ ] User analytics review
- [ ] Backup verification

## Emergency Procedures

### Rollback Plan
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Docker
docker-compose down
docker pull polkacert-verify:previous-tag
docker-compose up -d
```

### Database Restore
1. Go to Supabase dashboard
2. Settings > Database > Backups
3. Select backup point
4. Click Restore

### Contact Information
- [ ] Document on-call contacts
- [ ] Create incident response plan
- [ ] Set up alert notifications
- [ ] Document escalation procedures

## Success Criteria

- [ ] Application accessible via production URL
- [ ] All features working correctly
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Page load time < 3 seconds
- [ ] Uptime > 99.9%
- [ ] All tests passing
- [ ] Monitoring active
- [ ] Backups configured
- [ ] SSL certificate valid

---

## Quick Commands

```bash
# Build for production
npm run build:prod

# Preview production build
npm run preview

# Deploy to Vercel
npm run deploy:vercel

# Deploy to Netlify
npm run deploy:netlify

# Docker build and run
npm run docker:build
npm run docker:run

# Stop Docker
npm run docker:stop
```

---

**Ready for production? Check all boxes above!** ✅
