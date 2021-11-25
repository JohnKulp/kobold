import {
	Client,
	NewsChannel,
	DiscordAPIError,
	Guild,
	GuildMember,
	TextChannel,
	User,
} from 'discord.js';

import { PermissionUtils } from './permission-utils';
import { RegexUtils } from './regex-utils';
import { LangCode } from '../models/enums';
import { Lang } from '../services';

const FETCH_MEMBER_LIMIT = 20;

export class ClientUtils {
	public static async getUser(client: Client, discordId: string): Promise<User> {
		const parsedDiscordId = RegexUtils.discordId(discordId);
		if (!parsedDiscordId) {
			return;
		}

		try {
			await client.users.fetch(parsedDiscordId);
		} catch (error) {
			// 10013: "Unknown User"
			if (error instanceof DiscordAPIError && [10013].includes(error.code)) {
				// TODO: handle unknown user
			} else {
				throw error;
			}
		}
	}

	// eslint-disable-next-line consistent-return
	public static async findMember(guild: Guild, input: string): Promise<GuildMember> {
		try {
			const discordId = RegexUtils.discordId(input);
			if (discordId) {
				return await guild.members.fetch(discordId);
			}

			const tag = RegexUtils.tag(input);
			if (tag) {
				return (await guild.members.fetch({ query: tag.username, limit: FETCH_MEMBER_LIMIT })).find(
					(member) => member.user.discriminator === tag.discriminator,
				);
			}

			return (await guild.members.fetch({ query: input, limit: 1 })).first();
		} catch (error) {
			// 10007: "Unknown Member"
			// 10013: "Unknown User"
			if (error instanceof DiscordAPIError && [10007, 10013].includes(error.code)) {
				// TODO: handle unknown user/member
			} else {
				throw error;
			}
		}
	}

	public static async findNotifyChannel(
		guild: Guild,
		langCode: LangCode,
	): Promise<TextChannel | NewsChannel> {
		// Prefer the system channel
		const { systemChannel } = guild;
		if (systemChannel && PermissionUtils.canSendEmbed(systemChannel)) {
			return systemChannel;
		}

		// Otherwise look for a bot channel
		return (await guild.channels.fetch()).find(
			(channel) =>
				(channel instanceof TextChannel || channel instanceof NewsChannel) &&
				PermissionUtils.canSendEmbed(channel) &&
				Lang.getRegex('channelRegexes.bot', langCode).test(channel.name),
		) as TextChannel | NewsChannel;
	}
}
