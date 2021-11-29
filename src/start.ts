import 'module-alias/register';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/rest/v9';
import { IntentsString, Options, PartialTypes } from 'discord.js';

import { Api } from './api';
import { RootController, CharacterTokenResponseController } from './controllers';
import { Bot } from './bot';
import {
	Command,
	DevCommand,
	HelpCommand,
	InfoCommand,
	LinkCommand,
	TestCommand,
	TranslateCommand,
} from './commands';
import {
	CommandHandler,
	GuildJoinHandler,
	GuildLeaveHandler,
	MessageHandler,
	ReactionHandler,
	TriggerHandler,
} from './events';
import { CustomClient } from './extensions';
import { DBModel, JobService, Logger } from './services';
import { Config } from '~/configurer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Logs = require('../lang/logs.json');

async function registerCommands(commands: Command[]): Promise<void> {
	const cmdDatas = commands.map((cmd) => cmd.data);
	const cmdNames = cmdDatas.map((cmdData) => cmdData.name);

	Logger.info(
		Logs.info.commandsRegistering.replaceAll(
			'{COMMAND_NAMES}',
			cmdNames.map((cmdName) => `'${cmdName}'`).join(', '),
		),
	);

	try {
		const rest = new REST({ version: '9' }).setToken(Config.client.token);
		await rest.put(Routes.applicationCommands(Config.client.id), { body: [] });
		await rest.put(Routes.applicationCommands(Config.client.id), { body: cmdDatas });
	} catch (error) {
		Logger.error(Logs.error.commandsRegistering, error);
		return;
	}

	Logger.info(Logs.info.commandsRegistered);
}

process.on('unhandledRejection', (reason) => {
	Logger.error(Logs.error.unhandledRejection, reason);
});

async function start(): Promise<void> {
	DBModel.init(Config.database.url);

	const client = new CustomClient({
		// any binds for json config imports. TODO make a more robust type for the config
		intents: Config.client.intents as IntentsString[],
		partials: Config.client.partials as PartialTypes[],
		makeCache: Options.cacheWithLimits({
			// Keep default caching behavior
			...Options.defaultMakeCacheSettings,
			// Override specific options from config
			...Config.client.caches,
		}),
	});

	// Commands
	const commands: Command[] = [
		new DevCommand(),
		new HelpCommand(),
		new InfoCommand(),
		new LinkCommand(),
		new TestCommand(),
		new TranslateCommand(),
	].sort((a, b) => (a.data.name > b.data.name ? 1 : -1));

	// Event handlers
	const guildJoinHandler = new GuildJoinHandler();
	const guildLeaveHandler = new GuildLeaveHandler();
	const commandHandler = new CommandHandler(commands);
	const triggerHandler = new TriggerHandler([]);
	const messageHandler = new MessageHandler(triggerHandler);
	const reactionHandler = new ReactionHandler([]);

	const bot = new Bot(
		Config.client.token,
		client,
		guildJoinHandler,
		guildLeaveHandler,
		messageHandler,
		commandHandler,
		reactionHandler,
		new JobService([]),
	);

	if (process.argv[2] === '--register') {
		await registerCommands(commands);
		process.exit();
	}

	// API
	const rootController = new RootController();
	const characterTokenResponseController = new CharacterTokenResponseController();
	const api = new Api([rootController, characterTokenResponseController]);

	await api.start();
	await bot.start();
}

start().catch((error) => {
	Logger.error(Logs.error.unspecified, error);
});
