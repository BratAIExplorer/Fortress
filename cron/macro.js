/**
 * Cron Job: Macro Data Refresh
 * Runs daily at 8 PM IST
 * Triggers the macro snapshot fetch (Nifty, VIX, Gold, USD/INR, etc.)
 */

const http = require("http");

const CRON_SECRET = process.env.CRON_SECRET || "dev-secret";

async function triggerMacro() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({});

    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/macro",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        "x-cron-secret": CRON_SECRET,
      },
      timeout: 30000,
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
            `[${timestamp}] ✅ Macro job triggered successfully (Status: ${res.statusCode})`
          );
          console.log(`Response: ${responseData.substring(0, 200)}`);
          resolve({ success: true, status: res.statusCode });
        } else {
          console.error(
            `[${timestamp}] ❌ Macro job failed (Status: ${res.statusCode})`
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
      console.error(`[${timestamp}] ❌ Macro request error:`, error.message);
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] ❌ Macro request timeout (30s)`);
      reject(new Error("Request timeout"));
    });

    req.write(data);
    req.end();
  });
}

// Run the cron job
triggerMacro()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] 🚨 Cron job failed:`, error.message);
    process.exit(1);
  });
