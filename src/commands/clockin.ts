import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { handleClock } from "./_clock.js";

export const data = new SlashCommandBuilder()
  .setName("clockin")
  .setDescription("Registra el inicio de tu turno");

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await handleClock(interaction, "CLOCKIN");
}
