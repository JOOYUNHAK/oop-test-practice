import databaseConfiguration from "../../config/database.configuration";
import { ConfigModuleOptions } from "@nestjs/config";

export const configModuleOption: ConfigModuleOptions = {
    isGlobal: true,
    envFilePath: 'config/env/.development.env',
    load: [ databaseConfiguration]
}