require("dotenv").config();
// ✅ Import necessary modules
const express = require("express");
const router = express.Router();
const path = require("path");
const axios = require("axios");

// Load consumer credentials from env
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const bufferToBase64 = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

const passkey = process.env.MPESA_PASSKEY; // Add this to your .env
const shortcode = process.env.MPESA_SHORTCODE; // e.g., 174379 TIS CAN BE THE PAYBILL NO AND STORE NO FOR BUY GOODS
const callbackURL = process.env.MPESA_CALLBACK_URL;
const accountNumber = process.env.MPESA_ACCOUNT_NO

//-------TESSSSTT
/**
 * @swagger
 * tags:
 *   - name: QR Code
 *     description: Endpoints for generating M-Pesa QR codes
 *   - name: STK Push
 *     description: Endpoints for initiating and managing STK Push requests
 */

/**
 * @swagger
 * /generate-qr:
 *   post:
 *     summary: Generate a dynamic M-Pesa QR code
 *     tags: [QR Code]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               MerchantName:
 *                 type: string
 *               RefNo:
 *                 type: string
 *               Amount:
 *                 type: string
 *               TrxCode:
 *                 type: string
 *               CPI:
 *                 type: string
 *               Size:
 *                 type: string
 *     responses:
 *       200:
 *         description: QR code successfully generated
 *       500:
 *         description: QR code generation failed
 */
router.post("/generate-qr", async(req, res) => {
    try {
        const { MerchantName, RefNo, Amount, TrxCode, CPI, Size } = req.body;
        console.log("📦 Incoming QR Generation Request:");
        console.log("→ MerchantName:", MerchantName);
        console.log("→ RefNo:", RefNo);
        console.log("→ Amount:", Amount);
        console.log("→ TrxCode:", TrxCode);
        console.log("→ CPI:", CPI);
        console.log("→ Size:", Size);

        // Step 1: Get OAuth token
        const authResponse = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: { Authorization: `Basic ${bufferToBase64}` }
        });
        const authHeader = `Basic ${bufferToBase64}`;
        console.log("🔐 Authorization Header (Basic Auth):", authHeader);
        const accessToken = authResponse.data.access_token;
        console.log("✅ Access Token received:", accessToken);
        // Step 2: Request QR code
        const qrResponse = await axios.post("https://sandbox.safaricom.co.ke/mpesa/qrcode/v1/generate", {
            MerchantName,
            RefNo,
            Amount,
            TrxCode,
            CPI,
            Size
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
        res.json(qrResponse.data); // Send Base64 QRCode back to frontend
    } catch (error) {
        console.error("❌ M-Pesa QR Error:", error.response.data || error.message);
        res.status(500).json({ error: "Failed to generate QR code", details: error.response.data || error.message });
    }
});
/**
 * @swagger
 * /stkpush:
 *   post:
 *     summary: Initiate an M-Pesa STK Push payment
 *     tags: [STK Push]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: string
 *               phone:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: STK Push initiated successfully
 *       500:
 *         description: STK Push failed
 */
router.post("/stkpush", async(req, res) => {
            try {
                const { amount, phone, description } = req.body;

                const date = new Date();
                const timestamp =
                    date.getFullYear() +
                    ("0" + (date.getMonth() + 1)).slice(-2) +
                    ("0" + date.getDate()).slice(-2) +
                    ("0" + date.getHours()).slice(-2) +
                    ("0" + date.getMinutes()).slice(-2) +
                    ("0" + date.getSeconds()).slice(-2);
                //you can use momentjs to generate the same in one line

                const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

                const tokenRes = await axios.get(`https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`, {
                            headers: {
                                Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`,
      },
    });

    const accessToken = tokenRes.data.access_token;
//PAYBILL USE ACCOUNT REFRENCE FOR ACCOUNT NUMBER FOR CUSTOMER PAYBILLONLINE
//BUY GOODS DOESNT USE ACCOUNT REF
    const stkRes = await axios.post(
      `https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,//GLOBAL
        PhoneNumber: phone,
        CallBackURL: callbackURL, //GLOBAL
        AccountReference: accountNumber,//GLOBAL
        TransactionDesc: description,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(stkRes.data);
  } catch (err) {
    console.error("❌ STK Push Error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to initiate STK Push",
      details: err.response?.data || err.message,
    });
  }
});

/**
 * @swagger
 * /stkquery:
 *   post:
 *     summary: Query status of an STK Push transaction
 *     tags: [STK Push]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkoutRequestID:
 *                 type: string
 *     responses:
 *       200:
 *         description: STK Push query response
 *       500:
 *         description: Failed to query STK status
 */
router.post("/stkquery", async (req, res) => {
  try {
    const { checkoutRequestID } = req.body;

       const date = new Date();
                const timestamp =
                    date.getFullYear() +
                    ("0" + (date.getMonth() + 1)).slice(-2) +
                    ("0" + date.getDate()).slice(-2) +
                    ("0" + date.getHours()).slice(-2) +
                    ("0" + date.getMinutes()).slice(-2) +
                    ("0" + date.getSeconds()).slice(-2);

    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    const tokenRes = await axios.get(`https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`,
      },
    });

    const accessToken = tokenRes.data.access_token;

    const queryRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(queryRes.data);
  } catch (err) {
    console.error("❌ STK Query Error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to query STK Push status",
      details: err.response?.data || err.message,
    });
  }
});
/**
 * @swagger
 * /stk-callback:
 *   post:
 *     summary: M-Pesa callback receiver for STK Push
 *     tags: [STK Push]
 *     responses:
 *       200:
 *         description: Callback received and logged
 */
router.post("/stk-callback", (req, res) => {
  const callbackData = req.body;
  console.log("📲 STK Push Callback Received:");
  console.log(JSON.stringify(callbackData, null, 2));

  const logsDir = path.join(__dirname, "../logs");
  const filePath = path.join(logsDir, "stk-callbacks.txt");

  // Ensure logs directory exists
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  // Handle unsuccessful transactions early
  const resultCode = callbackData?.Body?.stkCallback?.ResultCode;
  const resultDesc = callbackData?.Body?.stkCallback?.ResultDesc;

  if (resultCode !== 0) {
    const failEntry = `\n--- ${new Date().toISOString()} ---\nFailed: ${resultDesc} (${resultCode})\n${JSON.stringify(callbackData, null, 2)}\n`;
    fs.appendFile(filePath, failEntry, err => {
      if (err) console.error("❌ Error writing failed STK log:", err);
      else console.log("📁 Logged failed STK attempt.");
    });
    return res.status(200).json({ ResultCode: resultCode, ResultDesc: resultDesc });
  }

  // Extract success metadata
  const metadata = callbackData.Body.stkCallback.CallbackMetadata;
  const amount = metadata?.Item?.find(obj => obj.Name === "Amount")?.Value;
  const mpesaCode = metadata?.Item?.find(obj => obj.Name === "MpesaReceiptNumber")?.Value;
  const phone = metadata?.Item?.find(obj => obj.Name === "PhoneNumber")?.Value;

  console.log(`✅ Transaction Successful: Amount: ${amount}, Code: ${mpesaCode}, Phone: ${phone}`);

  const successEntry = `\n--- ${new Date().toISOString()} ---\nSUCCESS\nAmount: ${amount}\nReceipt: ${mpesaCode}\nPhone: ${phone}\n${JSON.stringify(callbackData, null, 2)}\n`;

  fs.appendFile(filePath, successEntry, err => {
    if (err) console.error("❌ Error writing STK log file:", err);
    else console.log("✅ Callback logged to file.");
  });

  res.status(200).json("success");
});

module.exports = router;