import { DataSource } from "typeorm";

export const createDataSource = async (...entities: any []) => {
    const datasource =  new DataSource({
        type: 'mysql',
        host: '127.0.0.1',
        port: 3306,
        username: 'root',
        password: '1234',
        database: 'test',
        entities: entities,
        logging: false,
        synchronize: true
    });
    return await datasource.initialize();
}