import axios from "axios";
import { config } from "../config.js";

export type AskResponse200 = { answer: string };
export type AskResponse404 = { error: "no_active_session" };
export type AskResponse503 = { error: "llm_unavailable" };

export type StatusResponse200Active = {
  active: true;
  sessionId: string;
  startedAt: string;
};
export type StatusResponse200Inactive = { active: false };

const client = axios.create({
  baseURL: config.BACKEND_URL,
  timeout: 10_000,
  headers: { "X-Internal-Secret": config.INTERNAL_SECRET },
  validateStatus: () => true,
});

export async function ask(
  discordUserId: string,
  question: string
): Promise<{ status: number; data: unknown }> {
  const res = await client.post<unknown>("/ask", { discordUserId, question });
  return { status: res.status, data: res.data };
}

export async function status(
  discordUserId: string
): Promise<{ status: number; data: unknown }> {
  const res = await client.get<unknown>(`/status/${discordUserId}`);
  return { status: res.status, data: res.data };
}
