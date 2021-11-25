import 'module-alias/register';
import {
	Client,
	Constants,
	Guild,
	Interaction,
	Message,
	MessageReaction,
	RateLimitData,
	User,
} from 'discord.js';

import {
	CommandHandler,
	GuildJoinHandler,
	GuildLeaveHandler,
	MessageHandler,
	ReactionHandler,
} from './events';
import { JobService, Logger } from './services';
import { PartialUtils } from './utils';
import { Config, Debug } from '~/configurer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Logs = require('../lang/logs.json');

export class Bot {
	private ready = false;

	constructor(
		private token: string,
		private client: Client,
		private guildJoinHandler: GuildJoinHandler,
		private guildLeaveHandler: GuildLeaveHandler,
		private messageHandler: MessageHandler,
		private commandHandler: CommandHandler,
		private reactionHandler: ReactionHandler,
		private jobService: JobService,
	) {}

	public async start(): Promise<void> {
		this.registerListeners();
		await this.login(this.token);
	}

	private registerListeners(): void {
		this.client.on(Constants.Events.CLIENT_READY, () => this.onReady());
		this.client.on(Constants.Events.SHARD_READY, (shardId: number) => Bot.onShardReady(shardId));
		this.client.on(Constants.Events.GUILD_CREATE, (guild: Guild) => this.onGuildJoin(guild));
		this.client.on(Constants.Events.GUILD_DELETE, (guild: Guild) => this.onGuildLeave(guild));
		this.client.on(Constants.Events.MESSAGE_CREATE, (msg: Message) => this.onMessage(msg));
		this.client.on(Constants.Events.INTERACTION_CREATE, (intr: Interaction) =>
			this.onInteraction(intr),
		);
		this.client.on(
			Constants.Events.MESSAGE_REACTION_ADD,
			(messageReaction: MessageReaction, user: User) => this.onReaction(messageReaction, user),
		);
		this.client.on(Constants.Events.RATE_LIMIT, (rateLimitData: RateLimitData) =>
			Bot.onRateLimit(rateLimitData),
		);
	}

	private async login(token: string): Promise<void> {
		try {
			await this.client.login(token);
		} catch (error) {
			Logger.error(Logs.error.clientLogin, error);
		}
	}

	private async onReady(): Promise<void> {
		const userTag = this.client.user.tag;
		Logger.info(Logs.info.clientLogin.replaceAll('{USER_TAG}', userTag));

		if (!Debug.dummyMode.enabled) {
			this.jobService.start();
		}

		this.ready = true;
		Logger.info(Logs.info.clientReady);
	}

	private static onShardReady(shardId: number): void {
		Logger.setShardId(shardId);
	}

	private async onGuildJoin(guild: Guild): Promise<void> {
		if (!this.ready || Debug.dummyMode.enabled) {
			return;
		}

		try {
			await this.guildJoinHandler.process(guild);
		} catch (error) {
			Logger.error(Logs.error.guildJoin, error);
		}
	}

	private async onGuildLeave(guild: Guild): Promise<void> {
		if (!this.ready || Debug.dummyMode.enabled) {
			return;
		}

		try {
			await this.guildLeaveHandler.process(guild);
		} catch (error) {
			Logger.error(Logs.error.guildLeave, error);
		}
	}

	private async onMessage(msg: Message): Promise<void> {
		if (
			!this.ready ||
			(Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(msg.author.id))
		) {
			return;
		}

		const filledMsg = await PartialUtils.fillMessage(msg);
		if (!filledMsg) {
			return;
		}

		try {
			await this.messageHandler.process(filledMsg);
		} catch (error) {
			Logger.error(Logs.error.message, error);
		}
	}

	private async onInteraction(intr: Interaction): Promise<void> {
		if (
			!intr.isCommand() ||
			!this.ready ||
			(Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(intr.user.id))
		) {
			return;
		}

		try {
			await this.commandHandler.process(intr);
		} catch (error) {
			Logger.error(Logs.error.command, error);
		}
	}

	private async onReaction(msgReaction: MessageReaction, reactor: User): Promise<void> {
		if (
			!this.ready ||
			(Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(reactor.id))
		) {
			return;
		}

		const filledMsgReaction = await PartialUtils.fillReaction(msgReaction);
		if (!filledMsgReaction) {
			return;
		}

		try {
			await this.reactionHandler.process(filledMsgReaction, reactor);
		} catch (error) {
			Logger.error(Logs.error.reaction, error);
		}
	}

	private static async onRateLimit(rateLimitData: RateLimitData): Promise<void> {
		if (rateLimitData.timeout >= Config.logging.rateLimit.minTimeout * 1000) {
			Logger.error(Logs.error.apiRateLimit, rateLimitData);
		}
	}
}
