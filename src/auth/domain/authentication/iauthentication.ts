export interface IAuthentication {
    getClientAuthentication(): string;
    getRefreshAuthentication(): string;
    getRefreshedTime(): Date; // RefreshToken이 마지막으로 갱신된 날짜가 언제인지

    updateClientAuthentication(clientAuthentication: string): void; 
    updateRefreshAuthentication(refreshAuthentication: string): void;
    
    isNearingExpirationTime(): boolean; // 갱신할 날짜가 다가왔는지
}