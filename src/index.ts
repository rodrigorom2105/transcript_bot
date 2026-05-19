import {
  Client,
  Events,
  GatewayIntentBits,
  ChatInputCommandInteraction,
  REST,
  Routes,
} from "discord.js";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import * as preguntar from "./commands/preguntar.js";
import * as estado from "./commands/estado.js";
import * as clockin from "./commands/clockin.js";
import * as clockout from "./commands/clockout.js";

type Command = {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

const commands = new Map<string, Command>([
  [preguntar.data.name, preguntar],
  [estado.data.name, estado],
  [clockin.data.name, clockin],
  [clockout.data.name, clockout],
]);

async function registerCommands(): Promise<void> {
  const rest = new REST().setToken(config.DISCORD_BOT_TOKEN);
  const body = [...commands.values()].map((cmd) => cmd.data.toJSON());

  await rest.put(
    Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID),
    { body }
  );

  logger.info(
    { count: body.length, guildId: config.DISCORD_GUILD_ID },
    "comandos registrados"
  );
}

async function main(): Promise<void> {
  await registerCommands();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, (c) => {
    logger.info({ tag: c.user.tag }, "bot listo");
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      logger.error({ cmd: interaction.commandName, err }, "error ejecutando comando");
      const msg = "Ocurrió un error inesperado. Intenta de nuevo.";
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(msg).catch(() => undefined);
      } else {
        await interaction.reply({ content: msg, ephemeral: true }).catch(() => undefined);
      }
    }
  });

  await client.login(config.DISCORD_BOT_TOKEN);
}

process.on("unhandledRejection", (err) => {
  logger.error({ err }, "unhandledRejection");
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "uncaughtException");
  process.exit(1);
});

main().catch((err) => {
  logger.error({ err }, "error al iniciar el bot");
  process.exit(1);
});
