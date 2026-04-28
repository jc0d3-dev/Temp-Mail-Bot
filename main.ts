import { BotController } from "./controllers/bot.controller.ts";
import { BOT_TOKEN } from "./config/config.ts";

const POLLING_MODE = Deno.env.get("POLLING") === "true" || !Deno.env.get("DENO_DEPLOYMENT_ID");

if (POLLING_MODE) {
  console.log("🚀 Running in Polling Mode...");
  let lastUpdateId = 0;

  async function pollUpdates() {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          await BotController.handleUpdate(update);
        }
      }
    } catch (error) {
      console.error("Polling error:", error.message);
    }
    setTimeout(pollUpdates, 100);
  }

  // Hapus webhook dulu supaya polling lancar
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
  pollUpdates();
} else {
  // Mode Webhook (untuk Deno Deploy)
  const { serve } = await import("https://deno.land/std@0.195.0/http/server.ts");
  serve(async (req) => {
    if (req.method === "POST") {
      try {
        const update = await req.json();
        await BotController.handleUpdate(update);
      } catch (error) {
        console.error("Update error:", error);
      }
    }
    return new Response("OK");
  });
}

console.log("🔥 Temp Mail Bot Running");
