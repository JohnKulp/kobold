import { ChatInputApplicationCommandData, CommandInteraction } from 'discord.js';

import { EventData } from '~/models/internal-models';
import { Lang } from '~/services';
import { MessageUtils } from '~/utils';
import { Command } from '~/commands/command';

export class AuthorizeCommand implements Command {
	public data: ChatInputApplicationCommandData = {
		name: Lang.getCom('commands.authorize'),
		description: Lang.getRef('commandDescs.authorize', Lang.Default),
	};

	public requireDev = false;

	public requireGuild = false;

	public requirePerms = [];

	// To request access to a character:
	// wanderersguide.app/api/oauth2/authorize/<their character ID here>?response_type=code&client_id=<your client ID here>&state=<optional string>
	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const userId = intr.user.id;
		const channelId = intr.channelId;
		await MessageUtils.sendIntr(intr, Lang.getEmbed('displayEmbeds.help', data.lang()));
	}
}
