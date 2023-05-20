export interface IAuthentication {
    getClientAuthentication(): string;
    getRefreshAuthentication(): string;
    getRefreshedTime(): Date
}