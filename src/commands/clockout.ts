import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { handleClock } from "./_clock.js";

export const data = new SlashCommandBuilder()
  .setName("clockout")
  .setDescription("Registra el fin de tu turno");

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await handleClock(interaction, "CLOCKOUT");
}
