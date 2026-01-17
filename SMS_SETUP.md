# SMS OTP Setup Guide

## Current Status
✅ **OTP system is fully implemented and working**
- OTP generated on registration
- OTP sent via SMS (or logged to console if Twilio not configured)
- OTP verification working
- OTP resend working

## Option 1: Enable Real SMS (Recommended for Production)

### Step 1: Sign up for Twilio
1. Go to https://www.twilio.com
2. Create a free account (you'll get $15 trial credit)
3. Verify your phone number to enable SMS sending

### Step 2: Get Your Credentials
1. Log in to Twilio Console: https://console.twilio.com
2. Find your:
   - **Account SID** (looks like: ACxxxxxxxxxxxxxxxxxxxxxx)
   - **Auth Token** (looks like: your_auth_token_here)
   - **Phone Number** (assigned to your account, looks like: +1234567890)

### Step 3: Update .env file
Edit `civic-backend/.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Restart Backend
```bash
cd civic-backend
npm start
```

Backend will now send real SMS to phone numbers!

---

## Option 2: Testing Mode (Current Setup)
SMS messages are logged to the backend console instead of being sent.

When a user registers, the OTP will appear in the backend terminal:
```
📱 [SMS TO +15551234567]
Your Civic verification code is: 392682

This code expires in 10 minutes.
```

**Frontend receives:** OTP is returned in the response (for testing)
**Real SMS:** Not sent (Twilio not configured)

---

## How OTP Flow Works

### User Registration Flow
```
1. User enters: Name, Email, Phone, Age, Location
   ↓
2. Backend generates 6-digit OTP
   ↓
3. Backend stores OTP temporarily (10 min expiry)
   ↓
4. Backend sends SMS (real or console log)
   ↓
5. Response: { otp: "123456" } (for testing)
```

### User Verification Flow
```
1. User enters OTP they received
   ↓
2. Backend validates OTP (not expired, correct code)
   ↓
3. Backend creates user in database
   ↓
4. User can now login
```

---

## Testing the SMS System

### In Testing Mode (Console Logging)
```bash
# Backend window will show:
📱 [SMS TO +15551234567]
Your Civic verification code is: 392682

This code expires in 10 minutes.
```

### With Real Twilio
```
✅ SMS sent successfully to +15551234567 (SID: SM...)
```

---

## API Endpoints

### 1. Register User (Generates OTP)
```bash
POST /register
{
  "email": "user@example.com",
  "name": "User Name",
  "contact_number": "+15551234567",
  "age": 28,
  "locality": "City, State"
}

Response:
{
  "success": true,
  "message": "OTP sent to your mobile number",
  "contact_number": "+15551234567",
  "otp": "392682"  // Only in testing mode
}
```

### 2. Verify OTP
```bash
POST /verify-otp
{
  "contact_number": "+15551234567",
  "otp": "392682"
}

Response:
{
  "success": true,
  "user_id": "user123",
  "name": "User Name",
  "email": "user@example.com"
}
```

### 3. Resend OTP
```bash
POST /resend-otp
{
  "contact_number": "+15551234567"
}

Response:
{
  "success": true,
  "message": "OTP resent to your mobile number",
  "otp": "654321"  // Only in testing mode
}
```

### 4. Login
```bash
POST /login
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "user_id": "user123",
  "name": "User Name",
  "token": "token_here",
  "locality": "City, State"
}
```

---

## Troubleshooting

### "OTP not received" in production
- Verify Twilio credentials are correct in `.env`
- Check Twilio account has sufficient balance
- Verify phone number is in correct format (+1 for US, etc.)
- Check Twilio console logs for delivery failures

### "Invalid OTP"
- User entered wrong OTP
- OTP expired (10 minute limit)
- Solution: User should click "Resend OTP" to get a new one

### Testing Phone Numbers
When using Twilio free trial, you can only send SMS to verified numbers:
1. Add test phone number to Twilio Console → Verified Caller IDs
2. Use those numbers for testing

---

## Cost Estimation

**Twilio Pricing:**
- Free trial: $15 (lasts ~150 SMS)
- After trial: ~$0.0075 per SMS in most countries
- 1,000 OTP codes/month ≈ $7.50

For high-volume production, consider WhatsApp/Email as backup channels.
