import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import * as backend from "../services/backend.js";
import { logger } from "../utils/logger.js";

export const data = new SlashCommandBuilder()
  .setName("estado")
  .setDescription("Muestra si tienes una sesión activa en este momento");

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const userId = interaction.user.id;
  logger.info({ cmd: "estado", userId }, "comando ejecutado");

  try {
    const { status, data } = await backend.status(userId);

    if (status === 200) {
      const body = data as
        | backend.StatusResponse200Active
        | backend.StatusResponse200Inactive;

      if (body.active) {
        const hora = new Intl.DateTimeFormat("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Mexico_City",
        }).format(new Date(body.startedAt));

        await interaction.editReply(
          `✅ Sesión activa desde las ${hora}. ID: ${body.sessionId.slice(0, 8)}`
        );
        return;
      }

      await interaction.editReply(
        "❌ No tienes sesión activa. Abre la app web para iniciar una."
      );
      return;
    }

    logger.error({ cmd: "estado", userId, status, body: data }, "error inesperado del backend");
    await interaction.editReply("Ocurrió un error inesperado. Intenta de nuevo.");
  } catch (err) {
    logger.error({ cmd: "estado", userId, err }, "excepción al llamar al backend");
    await interaction.editReply("Ocurrió un error inesperado. Intenta de nuevo.");
  }
}
