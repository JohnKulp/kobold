import { ActivityType, ShardingManager } from 'discord.js';

import { CustomClient } from '../extensions';
import { BotSite } from '../models/config-models';
import { HttpService, Lang, Logger } from '../services';
import { ShardUtils } from '../utils';
import { Job } from './job';

import { Config, BotSites } from '~/configurer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Logs = require('../../lang/logs.json');

export class UpdateServerCountJob implements Job {
	public name = 'Update Server Count';

	public schedule: string = Config.jobs.updateServerCount.schedule;

	public log: boolean = Config.jobs.updateServerCount.log;

	private botSites: BotSite[];

	constructor(private shardManager: ShardingManager, private httpService: HttpService) {
		this.botSites = BotSites.filter((botSite) => botSite.enabled);
	}

	public async run(): Promise<void> {
		const serverCount = await ShardUtils.serverCount(this.shardManager);

		const type: ActivityType = 'STREAMING';
		const name = `to ${serverCount.toLocaleString()} servers`;
		const url = Lang.getCom('links.stream');

		await this.shardManager.broadcastEval(
			(client, context) => {
				const customClient = client as CustomClient;
				return customClient.setPresence(context.type, context.name, context.url);
			},
			{ context: { type, name, url } },
		);

		Logger.info(
			Logs.info.updatedServerCount.replaceAll('{SERVER_COUNT}', serverCount.toLocaleString()),
		);

		const botSitePromises = this.botSites.map(async (botSite) => {
			try {
				const body = JSON.parse(
					botSite.body.replaceAll('{{SERVER_COUNT}}', serverCount.toString()),
				);
				const res = await this.httpService.post(botSite.url, botSite.authorization, body);

				if (!res.ok) {
					throw res;
				}
			} catch (error) {
				Logger.error(
					Logs.error.updatedServerCountSite.replaceAll('{BOT_SITE}', botSite.name),
					error,
				);
			}

			Logger.info(Logs.info.updatedServerCountSite.replaceAll('{BOT_SITE}', botSite.name));
		});
		await Promise.all([botSitePromises]);
	}
}
