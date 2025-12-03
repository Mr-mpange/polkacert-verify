# Westend Wallet Connection Guide

## What I Fixed

Added the **Connect Wallet** button to your application! It now appears in:
- ✅ Homepage header (Index page)
- ✅ Admin Dashboard header
- ✅ Fixed typo in PolkadotWallet component

## How to Test Wallet Connection

### Step 1: Install Polkadot.js Extension

**Chrome/Brave:**
https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd

**Firefox:**
https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/

### Step 2: Create Westend Test Account

1. Click the Polkadot.js extension icon in your browser
2. Click the "+" button
3. Select "Create new account"
4. Save your 12-word seed phrase (IMPORTANT!)
5. Give it a name like "Westend Test"
6. Set a password
7. Click "Add the account with the generated seed"

### Step 3: Get Free WND Tokens

1. Copy your Westend address from the extension
2. Visit: https://faucet.polkadot.io/westend
3. Paste your address
4. Click "Submit"
5. Wait ~30 seconds for tokens to arrive

You can check your balance on:
https://westend.subscan.io/

### Step 4: Connect Wallet in App

1. Open your app: http://localhost:8082/
2. Look for the **"Connect Wallet"** button in the header
3. Click it
4. Click "Connect Polkadot.js Extension"
5. Approve the connection in the popup
6. Select your Westend account
7. You should see your balance displayed!

### Step 5: Test Certificate Issuance

1. Login to admin dashboard
2. Go to "Issue Certificate" tab
3. Fill in certificate details
4. Click "Issue Certificate"
5. The wallet will prompt you to sign the transaction
6. Approve it (costs ~0.01 WND)
7. Wait for confirmation
8. Check transaction on: https://westend.subscan.io/

## Troubleshooting

### "No Polkadot.js extension found"
- Make sure the extension is installed
- Refresh the page after installing
- Check that the extension is enabled

### "No accounts found"
- Create an account in the extension first
- Make sure you're on the Westend network

### "Insufficient balance"
- Get free WND tokens from the faucet
- Wait 30 seconds for tokens to arrive
- Check balance on Subscan

### Wallet not connecting
- Try refreshing the page
- Check browser console for errors (F12)
- Make sure extension has permission for localhost

## Network Configuration

Your app is configured for Westend testnet:
```
VITE_POLKADOT_ENDPOINT=wss://westend-rpc.polkadot.io
```

This is perfect for testing without spending real money!

## What You Can Test Now

✅ Wallet connection to Westend
✅ Account selection
✅ Balance display
✅ Certificate issuance on blockchain
✅ Transaction signing
✅ Block explorer verification

## Next Steps

After testing the wallet connection, you can:
1. Issue test certificates on Westend
2. Verify certificates on blockchain
3. Check transactions on Subscan
4. Test the full certificate lifecycle
