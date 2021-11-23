import 'module-alias/register';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/rest/v9';
import { Options } from 'discord.js';

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
import { JobService, Logger } from './services';
import { Config } from '~/configurer';
let Logs = require('../lang/logs.json');

async function start(): Promise<void> {
	let client = new CustomClient({
        //any binds for json config imports. TODO make a more robust type for the config
		intents: Config.client.intents as any,
		partials: Config.client.partials as any,
		makeCache: Options.cacheWithLimits({
			// Keep default caching behavior
			...Options.defaultMakeCacheSettings,
			// Override specific options from config
			...Config.client.caches,
		}),
	});

	// Commands
	let commands: Command[] = [
		new DevCommand(),
		new HelpCommand(),
		new InfoCommand(),
		new LinkCommand(),
		new TestCommand(),
		new TranslateCommand(),
	].sort((a, b) => (a.data.name > b.data.name ? 1 : -1));

	// Event handlers
	let guildJoinHandler = new GuildJoinHandler();
	let guildLeaveHandler = new GuildLeaveHandler();
	let commandHandler = new CommandHandler(commands);
	let triggerHandler = new TriggerHandler([]);
	let messageHandler = new MessageHandler(triggerHandler);
	let reactionHandler = new ReactionHandler([]);

	let bot = new Bot(
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

	await bot.start();
}

async function registerCommands(commands: Command[]): Promise<void> {
	let cmdDatas = commands.map((cmd) => cmd.data);
	let cmdNames = cmdDatas.map((cmdData) => cmdData.name);

	Logger.info(
		Logs.info.commandsRegistering.replaceAll(
			'{COMMAND_NAMES}',
			cmdNames.map((cmdName) => `'${cmdName}'`).join(', '),
		),
	);

	try {
		let rest = new REST({ version: '9' }).setToken(Config.client.token);
		await rest.put(Routes.applicationCommands(Config.client.id), { body: [] });
		await rest.put(Routes.applicationCommands(Config.client.id), { body: cmdDatas });
	} catch (error) {
		Logger.error(Logs.error.commandsRegistering, error);
		return;
	}

	Logger.info(Logs.info.commandsRegistered);
}

process.on('unhandledRejection', (reason, promise) => {
	Logger.error(Logs.error.unhandledRejection, reason);
});

start().catch((error) => {
	Logger.error(Logs.error.unspecified, error);
});
