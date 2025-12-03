# 🧪 Testing Guide - Westend Testnet

## Quick Start Testing (15 minutes)

### Step 1: Setup Environment

**1. Create `.env` file:**
```bash
copy .env.example .env
```

**2. Edit `.env` with Westend testnet:**
```env
# Supabase (use your credentials)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Westend Testnet (FREE - No real money!)
VITE_POLKADOT_ENDPOINT=wss://westend-rpc.polkadot.io

# Subscan (optional for testing)
VITE_SUBSCAN_API_KEY=
```

### Step 2: Get Test Tokens (WND)

**1. Install Polkadot.js Extension**
- Chrome: https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/

**2. Create Test Account**
```
1. Click Polkadot.js extension icon
2. Click "+" button
3. Select "Create new account"
4. Save your seed phrase (IMPORTANT!)
5. Enter account name: "Test Account"
6. Enter password
7. Click "Add the account with the generated seed"
```

**3. Get Free Test Tokens**
```
1. Copy your account address (click on account in extension)
2. Go to: https://faucet.polkadot.io/westend
3. Paste your address
4. Click "Submit"
5. Wait 1-2 minutes
6. Check balance in extension (should show WND tokens)
```

### Step 3: Start Application

```bash
START_ALL.bat
```

**Access**: http://localhost:5173

---

## Testing Checklist

### ✅ Basic Setup
- [ ] Application starts without errors
- [ ] Can access http://localhost:5173
- [ ] No console errors in browser
- [ ] Polkadot.js extension installed
- [ ] Test account created
- [ ] WND tokens received

### ✅ Authentication
- [ ] Can register new account
- [ ] Can login
- [ ] Can logout
- [ ] Session persists on refresh

### ✅ Blockchain Connection
- [ ] Polkadot wallet connects
- [ ] Shows correct network (Westend)
- [ ] Shows account balance
- [ ] Network stats display

### ✅ Certificate Issuance (Admin)
- [ ] Login as admin
- [ ] Navigate to Admin Dashboard
- [ ] Click "Issue Certificate"
- [ ] Fill certificate form:
  - Certificate ID: TEST-2024-001
  - Holder Name: John Doe
  - Course Name: Blockchain Testing
  - Institution: Test University
  - Issue Date: Today's date
- [ ] Connect Polkadot wallet
- [ ] Sign transaction
- [ ] Transaction confirmed
- [ ] Certificate appears in database
- [ ] Transaction visible on Subscan

### ✅ Certificate Verification
- [ ] Navigate to Verify page
- [ ] Enter certificate ID: TEST-2024-001
- [ ] Certificate details display
- [ ] Blockchain verification shows ✅
- [ ] Transaction hash visible
- [ ] Can view on Subscan explorer

### ✅ QR Code Scanning
- [ ] Generate QR code for certificate
- [ ] Navigate to Scan page
- [ ] Scan QR code
- [ ] Certificate verifies successfully

### ✅ AI Verification
- [ ] Upload certificate image
- [ ] Rule-based AI runs
- [ ] Shows confidence score
- [ ] Shows detailed checks
- [ ] If ML model trained: ML prediction shows

### ✅ Certificate Gallery
- [ ] Navigate to Gallery
- [ ] All certificates display
- [ ] Can search certificates
- [ ] Can filter by status
- [ ] Pagination works

### ✅ User Dashboard
- [ ] View verification history
- [ ] View statistics
- [ ] View recent activity

### ✅ Admin Features
- [ ] Issue certificates
- [ ] Revoke certificates
- [ ] View all certificates
- [ ] Manage users
- [ ] View analytics

---

## Detailed Testing Scenarios

### Scenario 1: Issue Certificate on Blockchain

**Steps:**
```
1. Login as admin
2. Go to Admin Dashboard
3. Click "Issue Certificate"
4. Fill form:
   - ID: CERT-TEST-001
   - Name: Alice Smith
   - Course: Web3 Development
   - Institution: Blockchain Academy
   - Date: 2024-12-02
5. Click "Issue Certificate"
6. Connect Polkadot wallet (if not connected)
7. Review transaction details
8. Click "Sign and Submit"
9. Wait for confirmation (10-30 seconds)
10. Success message appears
```

**Expected Results:**
- ✅ Transaction hash generated
- ✅ Certificate saved to database
- ✅ Blockchain transaction confirmed
- ✅ Can view on Subscan: https://westend.subscan.io/
- ✅ Certificate appears in gallery

**Verify on Subscan:**
```
1. Copy transaction hash
2. Go to: https://westend.subscan.io/
3. Paste hash in search
4. View transaction details
5. Check extrinsic: system.remark
6. Verify data contains certificate hash
```

---

### Scenario 2: Verify Certificate

**Steps:**
```
1. Go to Verify page
2. Enter certificate ID: CERT-TEST-001
3. Click "Verify"
4. Wait for verification (2-5 seconds)
```

**Expected Results:**
- ✅ Certificate details display
- ✅ Status: Valid ✓
- ✅ Blockchain verification: ✓
- ✅ Transaction hash shown
- ✅ Issue date correct
- ✅ Holder name correct
- ✅ Institution correct

**Blockchain Verification Shows:**
- Transaction Hash: 0x...
- Block Number: #...
- Timestamp: ...
- Status: Finalized ✓

---

### Scenario 3: AI Visual Verification

**Steps:**
```
1. Verify certificate (Scenario 2)
2. Scroll to "AI Visual Verification"
3. Click "Upload Certificate Image"
4. Select certificate image file
5. Click "Verify Certificate Image"
6. Wait for analysis (5-10 seconds)
```

**Expected Results:**
- ✅ Image uploaded successfully
- ✅ Rule-based AI runs
- ✅ Shows 4 checks:
  - Image Integrity: ✓
  - OCR Extraction: ✓
  - Data Matching: ✓
  - Tampering Detection: ✓
- ✅ Overall confidence score shown
- ✅ If ML model trained: ML prediction shown

---

### Scenario 4: Revoke Certificate

**Steps:**
```
1. Login as admin
2. Go to Admin Dashboard
3. Find certificate: CERT-TEST-001
4. Click "Revoke"
5. Enter revocation reason: "Testing revocation"
6. Confirm revocation
```

**Expected Results:**
- ✅ Certificate status changed to "Revoked"
- ✅ Revocation reason saved
- ✅ Revocation date recorded
- ✅ Future verifications show "Revoked"
- ✅ Blockchain record remains (immutable)

**Verify Revocation:**
```
1. Go to Verify page
2. Enter certificate ID: CERT-TEST-001
3. Status shows: ❌ Revoked
4. Revocation reason displayed
5. Revocation date shown
```

---

### Scenario 5: QR Code Verification

**Steps:**
```
1. Issue certificate (Scenario 1)
2. Generate QR code for certificate
3. Save QR code image
4. Go to Scan page
5. Click "Scan QR Code"
6. Allow camera access
7. Show QR code to camera
   OR
   Upload QR code image
```

**Expected Results:**
- ✅ QR code scanned successfully
- ✅ Certificate ID extracted
- ✅ Automatic verification
- ✅ Certificate details display
- ✅ Blockchain verification shown

---

## Testing Blockchain Features

### Test 1: Transaction Confirmation

**What to test:**
- Transaction submission
- Transaction confirmation
- Block finalization
- Transaction hash generation

**How to verify:**
```
1. Issue certificate
2. Copy transaction hash
3. Go to Subscan: https://westend.subscan.io/
4. Search transaction hash
5. Check status: Success ✓
6. Check block: Finalized ✓
7. Check extrinsic: system.remark
```

### Test 2: Network Stats

**What to test:**
- Current block number
- Network status
- Account balance
- Transaction history

**How to verify:**
```
1. Check Network Stats component
2. Verify block number updates
3. Check account balance (WND)
4. View transaction history
5. All data should be real-time
```

### Test 3: Multiple Transactions

**What to test:**
- Issue 5 certificates
- Verify all transactions
- Check transaction order
- Verify all on blockchain

**Steps:**
```
1. Issue CERT-TEST-001
2. Issue CERT-TEST-002
3. Issue CERT-TEST-003
4. Issue CERT-TEST-004
5. Issue CERT-TEST-005
6. Verify all on Subscan
7. Check all in gallery
```

---

## Testing AI/ML Features

### Test 1: Rule-Based Verification

**Test Cases:**

**A. Valid Certificate Image**
```
Upload: High-quality certificate image
Expected: All checks pass, confidence > 80%
```

**B. Low Quality Image**
```
Upload: Blurry or low-res image
Expected: Image integrity fails, confidence < 50%
```

**C. Screenshot**
```
Upload: Screenshot of certificate
Expected: Tampering detection fails, confidence < 60%
```

**D. Edited Certificate**
```
Upload: Photoshopped certificate
Expected: Data matching fails, confidence < 50%
```

### Test 2: ML Model (If Trained)

**Test Cases:**

**A. Authentic Certificate**
```
Upload: Real certificate
Expected: Prediction = Authentic (>90%)
```

**B. Forged Certificate**
```
Upload: Fake certificate
Expected: Prediction = Forged (>80%)
```

**C. Tampered Certificate**
```
Upload: Edited certificate
Expected: Prediction = Tampered (>80%)
```

**D. Screenshot**
```
Upload: Screenshot
Expected: Prediction = Screenshot (>80%)
```

---

## Performance Testing

### Load Testing

**Test 1: Multiple Verifications**
```
1. Verify 10 certificates in a row
2. Measure time for each
3. Check for memory leaks
4. Verify all results correct
```

**Test 2: Concurrent Users**
```
1. Open 5 browser tabs
2. Verify different certificates
3. Check all work correctly
4. No conflicts or errors
```

### Speed Testing

**Metrics to measure:**
- Page load time: < 3 seconds
- Certificate verification: < 2 seconds
- AI verification: < 10 seconds
- Blockchain query: < 2 seconds
- Transaction confirmation: 10-30 seconds

---

## Error Testing

### Test Error Handling

**Test 1: Invalid Certificate ID**
```
Enter: INVALID-ID-999
Expected: "Certificate not found" message
```

**Test 2: Network Disconnection**
```
1. Disconnect internet
2. Try to verify certificate
Expected: "Network error" message
```

**Test 3: Wallet Not Connected**
```
1. Try to issue certificate without wallet
Expected: "Please connect wallet" message
```

**Test 4: Insufficient Balance**
```
1. Use account with 0 WND
2. Try to issue certificate
Expected: "Insufficient balance" error
```

**Test 5: Invalid Image Upload**
```
1. Upload non-image file
Expected: "Invalid file type" error
```

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Security Testing

### Test 1: Authentication
- [ ] Cannot access admin without login
- [ ] Session expires after timeout
- [ ] Cannot access other users' data
- [ ] Password requirements enforced

### Test 2: Authorization
- [ ] Regular users cannot issue certificates
- [ ] Regular users cannot revoke certificates
- [ ] Regular users cannot access admin panel
- [ ] Admin can perform all actions

### Test 3: Input Validation
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] File upload restrictions work
- [ ] Form validation works

---

## Troubleshooting

### Issue: "Cannot connect to Polkadot"
**Solution:**
```
1. Check internet connection
2. Verify endpoint: wss://westend-rpc.polkadot.io
3. Try alternative: wss://westend.api.onfinality.io/public-ws
4. Check firewall settings
```

### Issue: "Transaction failed"
**Solution:**
```
1. Check WND balance (need > 0.01 WND)
2. Wait for previous transaction to confirm
3. Try again after 30 seconds
4. Check Subscan for transaction status
```

### Issue: "Wallet not detected"
**Solution:**
```
1. Install Polkadot.js extension
2. Refresh page
3. Click "Connect Wallet"
4. Approve connection in extension
```

### Issue: "AI verification fails"
**Solution:**
```
1. Check image file size (< 10MB)
2. Use JPG or PNG format
3. Ensure image is clear and readable
4. Try different image
```

---

## Test Report Template

```
Test Date: ___________
Tester: ___________
Environment: Westend Testnet

✅ PASSED TESTS:
- [ ] Authentication
- [ ] Certificate Issuance
- [ ] Certificate Verification
- [ ] Blockchain Integration
- [ ] AI Verification
- [ ] QR Code Scanning
- [ ] Admin Features

❌ FAILED TESTS:
- Issue: ___________
  Steps to reproduce: ___________
  Expected: ___________
  Actual: ___________

📊 PERFORMANCE:
- Page Load: ___ seconds
- Verification: ___ seconds
- AI Analysis: ___ seconds
- Transaction: ___ seconds

💡 NOTES:
___________
___________
```

---

## Next Steps After Testing

1. ✅ All tests pass → Ready for production
2. ⚠️  Some tests fail → Fix issues and retest
3. 📝 Document any bugs found
4. 🚀 Deploy to production when ready

---

**Ready to test? Start with Step 1!** 🧪
