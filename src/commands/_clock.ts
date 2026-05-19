import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import * as sheets from "../services/sheets.js";
import { formatLA } from "../utils/time.js";
import { logger } from "../utils/logger.js";

export async function handleClock(
  interaction: ChatInputCommandInteraction,
  action: sheets.ClockAction
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const userId = interaction.user.id;
  const member = interaction.member as GuildMember | null;
  const sheetName =
    member?.displayName ?? interaction.user.username;

  const cmd = action === "CLOCKIN" ? "clockin" : "clockout";
  logger.info({ cmd, userId, sheetName }, "comando ejecutado");

  try {
    await sheets.ensureSheet(sheetName);
    const last = await sheets.getLastAction(sheetName);

    if (action === "CLOCKIN" && last === "CLOCKIN") {
      await interaction.editReply(
        "⚠️ Ya tienes un clockin abierto. Haz /clockout primero."
      );
      return;
    }

    if (action === "CLOCKOUT" && last !== "CLOCKIN") {
      await interaction.editReply(
        "⚠️ No tienes un clockin abierto."
      );
      return;
    }

    const { fecha, hora } = formatLA(new Date());
    await sheets.appendRow(sheetName, [fecha, hora, action]);

    const label = action === "CLOCKIN" ? "Clockin" : "Clockout";
    await interaction.editReply(
      `✅ ${label} registrado a las ${hora} (Los Angeles).`
    );
  } catch (err) {
    logger.error({ cmd, userId, sheetName, err }, "error en clock");
    await interaction.editReply("Ocurrió un error inesperado. Intenta de nuevo.");
  }
}
