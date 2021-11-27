"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Update with your config settings.
// eslint-disable-next-line import/no-extraneous-dependencies
require("ts-node/register");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './.envcache' });
const dbConfig = {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
        directory: './database/migrations',
        tableName: 'knex_migrations',
    },
    seeds: { directory: './database/seeds' },
    pool: {
        min: process.env.POOL_SIZE_MIN || 2,
        max: process.env.POOL_SIZE_MAX || 10,
    },
};
exports.default = {
    testing: {
        ...dbConfig,
        connection: process.env.TEST_DATABASE_URL,
        pool: {
            //every jest worker has its own pool. We can't overload the database by having each using the max pool size of the normal app.
            min: 1,
            max: 1,
        },
    },
    development: dbConfig,
    production: dbConfig,
};
//# sourceMappingURL=knexfile.js.map