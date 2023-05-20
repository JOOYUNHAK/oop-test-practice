import { IAuthentication } from "src/auth/domain/authentication/iauthentication";

export class JwtToken implements IAuthentication {
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
