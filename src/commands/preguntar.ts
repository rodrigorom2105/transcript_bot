import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import * as backend from "../services/backend.js";
import { logger } from "../utils/logger.js";

export const data = new SlashCommandBuilder()
  .setName("preguntar")
  .setDescription("Consulta al asistente IUL durante tu llamada")
  .addStringOption((opt) =>
    opt
      .setName("pregunta")
      .setDescription("¿Qué quieres preguntarle al asistente?")
      .setRequired(true)
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const pregunta = interaction.options.getString("pregunta", true);
  const userId = interaction.user.id;

  logger.info({ cmd: "preguntar", userId }, "comando ejecutado");

  try {
    const { status, data } = await backend.ask(userId, pregunta);

    if (status === 200) {
      const { answer } = data as backend.AskResponse200;
      const embed = new EmbedBuilder()
        .setTitle("💬 Decir al cliente:")
        .setDescription(`> "${answer}"`);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (status === 404) {
      const body = data as backend.AskResponse404;
      if (body.error === "no_active_session") {
        await interaction.editReply(
          "No tienes una sesión activa. Abre la app web e inicia una sesión primero."
        );
        return;
      }
    }

    if (status === 503) {
      const body = data as backend.AskResponse503;
      if (body.error === "llm_unavailable") {
        await interaction.editReply(
          "El asistente no está disponible en este momento. Intenta en unos segundos."
        );
        return;
      }
    }

    logger.error({ cmd: "preguntar", userId, status, body: data }, "error inesperado del backend");
    await interaction.editReply("Ocurrió un error inesperado. Intenta de nuevo.");
  } catch (err) {
    logger.error({ cmd: "preguntar", userId, err }, "excepción al llamar al backend");
    await interaction.editReply("Ocurrió un error inesperado. Intenta de nuevo.");
  }
}
