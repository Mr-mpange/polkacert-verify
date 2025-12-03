# How to Upload/Issue Certificates

## For Admin Users

### Step 1: Login as Admin

1. Go to: http://localhost:8082/auth
2. Login with admin credentials
3. You'll be redirected to `/admin` dashboard

### Step 2: Go to Issue Certificate Tab

1. In the Admin Dashboard, you'll see tabs at the top:
   - Overview
   - **Issue Certificate** ← Click this
   - Certificates
   - Users
   - Analytics

2. Click on **"Issue Certificate"** tab

### Step 3: Fill Certificate Details

Fill in the form:

- **Certificate ID**: Unique ID (e.g., CERT-2024-001)
- **Holder Name**: Student/recipient name
- **Course Name**: Name of course/program
- **Institution**: Your institution name
- **Issue Date**: Date certificate was issued
- **Additional Info** (optional): Extra details

### Step 4: Connect Wallet (Important!)

Before issuing:
1. Make sure you see **"Connect Wallet"** button in top right
2. Click it and connect your Polkadot.js wallet
3. Make sure you have WND tokens (Westend testnet)
4. Your wallet balance will show

### Step 5: Issue Certificate

1. Click **"Issue Certificate"** button
2. Your Polkadot wallet will popup asking to sign transaction
3. Approve the transaction
4. Wait for blockchain confirmation (~6 seconds)
5. ✅ Certificate issued!

### Step 6: View Certificate

After issuing:
- Certificate is stored in database
- Hash is stored on Polkadot blockchain
- QR code is generated automatically
- You can view it in "Certificates" tab

---

## Certificate Features

### What Gets Created:

1. **Database Record**: Full certificate details
2. **Blockchain Hash**: Immutable proof on Polkadot
3. **QR Code**: For easy verification
4. **Transaction Hash**: Blockchain transaction ID
5. **Block Number**: Which block it's stored in

### Verification:

Anyone can verify the certificate by:
- Scanning QR code
- Entering certificate ID at `/verify`
- Checking blockchain explorer

---

## Troubleshooting

### "Connect Wallet" button not showing
- Refresh the page
- Check if PolkadotWallet component is loaded
- Look in browser console for errors

### Wallet won't connect
- Install Polkadot.js extension
- Create Westend testnet account
- Get free WND tokens from faucet

### "Insufficient balance"
- Get WND tokens: https://faucet.polkadot.io/westend
- Wait 30 seconds for tokens to arrive
- Check balance in wallet

### Certificate not saving
- Check you're logged in as admin
- Check database connection
- Look at browser console for errors

---

## Quick Links

- **Admin Dashboard**: http://localhost:8082/admin
- **Issue Certificate**: http://localhost:8082/admin (Issue Certificate tab)
- **View Certificates**: http://localhost:8082/admin (Certificates tab)
- **Westend Faucet**: https://faucet.polkadot.io/westend
- **Blockchain Explorer**: https://westend.subscan.io/

---

## Navigation Changes

✅ **Admin Dashboard**:
- Logo clicks → Stay on dashboard (overview tab)
- No "Home" link
- Wallet stays connected
- Logout only way to leave

✅ **User Dashboard**:
- No "Home" link
- Wallet connection available
- Gallery and Verify links
- Logout to exit

✅ **Wallet Connection**:
- Persists across page navigation
- Shows balance
- Stays connected until logout
- Available on all dashboard pages
