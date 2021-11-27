import 'ts-node/register';
declare const _default: {
    testing: {
        connection: string;
        pool: {
            min: number;
            max: number;
        };
        client: string;
        migrations: {
            directory: string;
            tableName: string;
        };
        seeds: {
            directory: string;
        };
    };
    development: {
        client: string;
        connection: string;
        migrations: {
            directory: string;
            tableName: string;
        };
        seeds: {
            directory: string;
        };
        pool: {
            min: string | number;
            max: string | number;
        };
    };
    production: {
        client: string;
        connection: string;
        migrations: {
            directory: string;
            tableName: string;
        };
        seeds: {
            directory: string;
        };
        pool: {
            min: string | number;
            max: string | number;
        };
    };
};
export default _default;
