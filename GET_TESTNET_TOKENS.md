# How to Get Westend Testnet Tokens (WND)

## The Problem
You're seeing this error:
```
1010: Invalid Transaction: Inability to pay some fees, e.g. account balance too low
```

This means your Polkadot wallet doesn't have enough WND tokens to pay for blockchain transaction fees.

## The Solution

### Step 1: Get Your Wallet Address
Your current wallet address is:
```
5CtF3XTXJw2kRe6b5fYxtCPWv4SKVfaHnFPzWSizQtVfmTra
```

### Step 2: Visit the Westend Faucet
Go to: **https://faucet.polkadot.io/westend**

### Step 3: Request Tokens
1. Paste your wallet address in the input field
2. Complete any verification (if required)
3. Click "Request Tokens"
4. Wait 1-2 minutes for tokens to arrive

### Step 4: Verify Balance
- Your app now shows your balance in the upload form
- You should see something like "1.0000 WND" after receiving tokens
- Transaction fees are typically around 0.0018 WND

## What Changed in Your Code

I've added:

1. **Balance checking before transactions** - The app now checks if you have enough tokens before attempting to submit
2. **Better error messages** - Clear instructions with faucet link when balance is insufficient
3. **Balance display in UI** - Shows your current WND balance with a warning if it's too low
4. **Improved error handling** - Catches the 1010 error and provides helpful guidance

## Alternative: Use a Different Account

If you have another Polkadot wallet with tokens:
1. Open Polkadot.js extension
2. Switch to an account with balance
3. Refresh the app
4. The new account will be auto-selected

## Need More Help?

- Westend is a testnet - tokens are FREE
- You can request tokens multiple times if needed
- Each transaction costs approximately 0.0018 WND
- Keep at least 0.1 WND for multiple transactions
