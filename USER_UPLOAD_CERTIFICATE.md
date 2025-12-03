# Upload Certificate - User Dashboard

## ✅ Feature Added!

Regular users can now upload certificates from their dashboard!

## How to Upload Certificate (User)

### Step 1: Login as User

1. Go to: http://localhost:8082/auth
2. Login with user credentials (not admin)
3. You'll be redirected to `/dashboard`

### Step 2: Go to Upload Tab

1. In your dashboard, you'll see two tabs:
   - **Overview** - Your stats and verification history
   - **Upload Certificate** ← Click this

2. Click on **"Upload Certificate"** tab

### Step 3: Connect Wallet

1. Click **"Connect Wallet"** button in top right
2. Connect your Polkadot.js wallet
3. Make sure you have WND tokens (Westend testnet)
4. Get free tokens: https://faucet.polkadot.io/westend

### Step 4: Fill Certificate Details

Fill in the form:
- **Certificate ID**: Unique ID (e.g., CERT-2024-001)
- **Holder Name**: Student/recipient name
- **Course Name**: Name of course/program
- **Institution**: Institution name
- **Issue Date**: Date certificate was issued
- **Additional Info**: Optional extra details

### Step 5: Upload

1. Click **"Upload Certificate"** button
2. Your wallet will popup asking to sign transaction
3. Approve the transaction
4. Wait for blockchain confirmation
5. ✅ Certificate uploaded!

---

## Features

### What Happens:
1. ✅ Certificate stored on Polkadot blockchain
2. ✅ Certificate saved in database
3. ✅ QR code generated automatically
4. ✅ Blockchain hash recorded
5. ✅ Linked to your user account

### Who Can Upload:
- ✅ Regular users (with 'user' role)
- ✅ Admin users (with 'admin' role)
- ❌ Not logged in users

### Requirements:
- Must be logged in
- Must have Polkadot wallet connected
- Must have WND tokens for transaction fees
- All required fields must be filled

---

## User Dashboard Features

### Overview Tab:
- Total verifications count
- Recent activity (last 30 days)
- Unique certificates verified
- Verification history with details

### Upload Certificate Tab:
- Upload new certificates
- Store on blockchain
- Generate QR codes
- Track your uploads

---

## Navigation

### Header:
- **Logo**: Stays on dashboard
- **Wallet**: Connect/disconnect Polkadot wallet
- **Gallery**: Browse all certificates
- **Verify**: Verify a certificate
- **Sign Out**: Logout

### No "Home" Link:
- Users stay in dashboard until logout
- Wallet connection persists
- Better UX for certificate management

---

## Troubleshooting

### "Please connect your Polkadot wallet first"
- Click "Connect Wallet" in top right
- Install Polkadot.js extension if needed
- Create Westend testnet account

### "Insufficient balance"
- Get free WND tokens: https://faucet.polkadot.io/westend
- Wait 30 seconds for tokens to arrive

### Certificate not saving
- Check all required fields are filled
- Make sure wallet is connected
- Check browser console for errors

### Can't see Upload tab
- Make sure you're logged in
- Refresh the page
- Check you're on /dashboard not /admin

---

## Differences: User vs Admin

### User Dashboard (/dashboard):
- ✅ Upload certificates
- ✅ View verification history
- ✅ Personal stats
- ❌ Can't manage other users
- ❌ Can't view all certificates
- ❌ Can't access analytics

### Admin Dashboard (/admin):
- ✅ Issue certificates
- ✅ View all certificates
- ✅ Manage users
- ✅ View analytics
- ✅ Revoke certificates
- ✅ Full system access

---

## Quick Links

- **User Dashboard**: http://localhost:8082/dashboard
- **Upload Certificate**: http://localhost:8082/dashboard (Upload tab)
- **Admin Dashboard**: http://localhost:8082/admin
- **Westend Faucet**: https://faucet.polkadot.io/westend
- **Blockchain Explorer**: https://westend.subscan.io/
