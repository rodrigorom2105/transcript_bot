import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  DISCORD_BOT_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().min(1),
  INTERNAL_SECRET: z.string().min(1),
  BACKEND_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["production", "development"]).default("production"),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Variables de entorno inválidas:");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = result.data;
