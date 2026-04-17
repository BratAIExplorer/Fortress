/**
 * Cron Job: Scanner Data Refresh
 * Runs daily at 2 AM IST
 * Triggers the market scanner to fetch latest stock data
 */

const http = require("http");

const CRON_SECRET = process.env.CRON_SECRET || "dev-secret";
const API_URL = "http://localhost:3000/api/scan/run";

async function triggerScanner() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ market: "NSE" });

    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/scan/run",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        "x-cron-secret": CRON_SECRET,
      },
      timeout: 30000, // 30 second timeout
    };

    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        const timestamp = new Date().toISOString();
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(
            `[${timestamp}] ✅ Scanner job triggered successfully (Status: ${res.statusCode})`
          );
          console.log(`Response: ${responseData.substring(0, 200)}`);
          resolve({ success: true, status: res.statusCode });
        } else {
          console.error(
            `[${timestamp}] ❌ Scanner job failed (Status: ${res.statusCode})`
          );
          console.error(`Response: ${responseData}`);
          reject(
            new Error(
              `HTTP ${res.statusCode}: ${responseData.substring(0, 200)}`
            )
          );
        }
      });
    });

    req.on("error", (error) => {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] ❌ Scanner request error:`, error.message);
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] ❌ Scanner request timeout (30s)`);
      reject(new Error("Request timeout"));
    });

    req.write(data);
    req.end();
  });
}

// Run the cron job
triggerScanner()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] 🚨 Cron job failed:`, error.message);
    process.exit(1);
  });
