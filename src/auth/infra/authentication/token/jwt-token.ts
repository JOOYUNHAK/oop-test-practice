import { IAuthentication } from "src/auth/domain/authentication/iauthentication";

export class JwtToken implements IAuthentication {
    private readonly AUTHENTICATION_DATE_RANGE = 1000 * 60 * 60 * 24; // 날짜 계산(일 단위)
    private readonly AUTHENTICATION_REFRESH_LIMIT = 7; // RefreshToken이 생성된지 7일이 지났으면 자동 재생성
    private accessToken: string;
    private refreshToken: string;
    private refreshedAt: Date;

    constructor(
        accessToken: string, refreshToken: string, refreshedAt: Date
    ) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.refreshedAt = refreshedAt;
    }

    getClientAuthentication(): string { return this.accessToken; }; // 클라이언트 노출용
    getRefreshAuthentication(): string { return this.refreshToken }; // 인증 갱신 DB용
    getRefreshedTime(): Date { return this.refreshedAt; }; // 마지막으로 갱신된 날짜

    updateClientAuthentication(clientAuthentication: string): void { 
        this.accessToken = clientAuthentication
    }

    updateRefreshAuthentication(refreshAuthentication: string, updatedAt: Date = new Date()): void {
        this.refreshToken = refreshAuthentication;
        this.refreshedAt = updatedAt;
    }
    
    /* RefreshToken을 갱신해야 하는지 */
    isNearingExpirationTime(now: Date = new Date()): boolean {
        if( 
            ((now.getTime() - this.refreshedAt.getTime()) / this.AUTHENTICATION_DATE_RANGE) > this.AUTHENTICATION_REFRESH_LIMIT 
        )   return true;
        return false;
    }
    
    /* AccessToken과 RefreshToken발급 위한 Method들 */
    static createAccessTokenPayload(email: string): AccessTokenPayload {
        return { email, createdAt: new Date() }
    };

    static getAccessTokenOption(): AccessTokenOption {
        return {
            expiresIn: process.env.JWT_ACCESS_TOKEN_TIME,
            secret: process.env.JWT_TOKEN_SECRET
        }
    }

    static createRefreshTokenPayload(email: string): RefreshTokenPayload {
        return { email, createdAt: new Date() };
    }

    static getRefreshTokenOption(): RefreshTokenOption {
        return {
            expiresIn:process.env.JWT_REFRESH_TOKEN_TIME,
            secret: process.env.JWT_TOKEN_SECRET
        }
    }
}

interface AccessTokenPayload { email: string, createdAt: Date};
interface RefreshTokenPayload { email: string, createdAt: Date};

interface AccessTokenOption { expiresIn: string | number, secret: string };
interface RefreshTokenOption { expiresIn: string | number, secret: string };
