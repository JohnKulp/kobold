import dotenv from 'dotenv';
import Config from '~/config/config.json';
import BotSites from '~/config/bot-sites.json';
import Debug from '~/config/debug.json';
import { BotSite } from '~/models/config-models';

dotenv.config({ path: '.envcache' });

Config.client.id = process.env.CLIENT_ID;
Config.client.token = process.env.CLIENT_TOKEN;

Config.api.secret = process.env.API_SECRET;

Config.clustering.masterApi.token = process.env.CLUSTERING_MASTER_API_TOKEN;

Config.database.url = process.env.DATABASE_URL;

const typedBotSites = BotSites as BotSite[];

export { Config, typedBotSites as BotSites, Debug };
