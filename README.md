# M-Pesa STK Push & QR Code API

This Node.js project enables **M-Pesa QR code generation**, **STK Push requests**, **STK query validation**, and **callback logging** using Safaricom’s sandbox API. Perfect for devs integrating mobile payments or QR-based checkout solutions.

---

## 🚀 Getting Started

### Clone the Repo

#### Option 1: GitHub Desktop
1. Open GitHub Desktop.
2. Click `File > Clone repository`.
3. Paste the repo URL:  
   ```
   https://github.com/EKR4/M-Pesa-STK-Push-QR-Code.git
   ```
4. Choose a local directory and clone.

#### Option 2: Manual (Terminal)
```bash
git clone https://github.com/EKR4/M-Pesa-STK-Push-QR-Code.git
cd M-Pesa-STK-Push-QR-Code
```

---

### Install Dependencies

#### 📦 Recommended (Easy)
```bash
npm install
```

#### 🛠️ Optional (Manual Initialization)
If you'd like a clean setup:

1. Delete `package.json` and `package-lock.json`.
2. Initialize a new project:
   ```bash
   npm init -y
   ```
3. Then install required packages:
   ```bash
   npm i vercel nodemon swagger-ui-express swagger-jsdoc express dotenv cors axios
   ```

---

## 🔑 .env Setup

Create a `.env` file in the root and configure:

```
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://yourdomain.com/stk-callback
MPESA_ACCOUNT_NO=123456
```

---

## 📡 API Routes Overview (`routes.js`)

All routes are under `/` in the main server.

### 1. `/generate-qr`
- **Method**: POST
- **Body**: `{ MerchantName, RefNo, Amount, TrxCode, CPI, Size }`
- **Description**:  
  Authenticates with Safaricom, then sends QR details to generate a dynamic M-Pesa QR code. Returns a base64 image string.

---

### 2. `/stkpush`
- **Method**: POST  
- **Body**: `{ phone, amount, description }`
- **Function**:
  - Gets OAuth token
  - Generates STK password (encoded passkey)
  - Initiates `CustomerPayBillOnline`
- **Returns**: JSON response with checkout request ID.

---

### 3. `/stkquery`
- **Method**: POST  
- **Body**: `{ checkoutRequestID }`
- **Function**:
  - Re-authenticates
  - Confirms status of pending payment
- **Use case**: To poll after STK Push to confirm status (e.g., timeout, success)

---

### 4. `/stk-callback`
- **Method**: POST (Safaricom hits this endpoint)  
- **Function**:
  - Logs response to `logs/stk-callbacks.txt`
  - Detects failed and successful transactions
  - Extracts amount, phone, receipt, and logs with timestamp

---

## 🧪 Development

To start locally with auto-reload:
```bash
npm start 
```

---

## 🚀 Deploying to Vercel

If you'd like to deploy this project to the cloud using [Vercel](https://vercel.com):

### 🧩 One-Time Setup

1. Make sure you're logged into Vercel in your terminal:
   ```bash
   npx vercel login
   ```

2. In the project directory, run the deployment command:
   ```bash
   npx vercel
   ```

3. Follow the prompts:
   - Select your account or organization.
   - Link to an existing Vercel project or create a new one.
   - Choose the root directory (usually `.`).
   - Confirm your settings and Vercel will generate a live URL.

4. Vercel will auto-deploy your API at something like:
   ```
   https://your-project-name.vercel.app
   ```

Make sure your production `.env` variables are set in the Vercel dashboard under **Project Settings > Environment Variables** before deploying.

---


## 🌐 Live Deployment & API Docs

### ✅ Hosted on Vercel

The API is live and publicly accessible at:  
**🔗 [https://mpesastkqr.vercel.app](https://mpesastkqr.vercel.app)**

Make sure your `.env` variables are properly configured in the **Vercel dashboard → Project Settings → Environment Variables** for full functionality.

---

### 📘 Interactive Swagger Docs

Explore and test all available endpoints at the live Swagger UI:  
**🔗 [https://mpesastkqr.vercel.app/api-docs](https://mpesastkqr.vercel.app/api-docs)**

Includes routes for:

- `/generate-qr`: Generate M-Pesa QR Codes  
- `/stkpush`: Initiate payment via STK Push  
- `/stkquery`: Query STK transaction status  
- `/stk-callback`: Receive and log callback data

The Swagger UI supports toggling between:

- **https://mpesastkqr.vercel.app/** – Vercel production server  
- **http://localhost:83/** – Local development server  

If you ever need to Change the Vercel Production Server go to  `swagger.js` and edit this segment
   ```bash
    servers: [{
                url: "http://localhost:83/",
                description: "Local development server",
            },
            {
                url: "https://mpesastkqr.vercel.app/",
                description: "Vercel deployed API",
            },
        ],

   ```
---

---
