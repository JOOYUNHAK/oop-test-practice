import { UserAuthentication } from "src/auth/domain/authentication/authentication";
import { USER_STATUS } from "./enum/user-status.enum";
import { Email } from "./user-email";
import { Password } from "./user-password";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

export class User {
    private id : number;
    private readonly email: Email;
    private readonly password: Password;
    private updatedAt: Date;
    private registeredAt: Date;
    private loginTry: number;
    private authentication: UserAuthentication;
    private status: USER_STATUS;
    private blockedUpTo?: Date;

    private readonly LOGIN_TRY_LIMIT_COUNT = 5;
    private readonly LOGIN_BLOCK_TIME = 300;

    constructor( 
        id: number, email: Email, password: Password, authentication: UserAuthentication,
        updatedAt: Date, registeredAt: Date, loginTry: number, blockedUpTo: Date, status: USER_STATUS
    ) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authentication = authentication;
        this.updatedAt = updatedAt;
        this.registeredAt = registeredAt;
        this.loginTry = loginTry;
        this.blockedUpTo = blockedUpTo;
        this.status = status;
    }

    getId(): number { return this.id };
    getEmail(): Email { return this.email; };
    getPassword(): Password { return this.password; };
    getUpdateTime(): Date { return this.updatedAt; };
    getRegisteredTime(): Date { return this.registeredAt; };
    getLoginTryCount(): number { return this.loginTry; };
    getBlockedTime(): Date { return this.blockedUpTo; };
    getStatus(): USER_STATUS { return this.status; };
    getAuthentication(): UserAuthentication { return this.authentication; };
    getClientAuthentication():string { return this.authentication.getType().getClientAuthentication(); };

    withId(id: number): User { 
        this.id = id;
        return this;
    }
    
    registered() { 
        this.status = USER_STATUS.LOGINED; 
        return this;
    };

    /* 로그인 처리 */
    async loginWith
    (password: string, now: Date) {
        /* 로그인시도 횟수가 5번이면 Block Time 체크 */
        if( this.loginTry == this.LOGIN_TRY_LIMIT_COUNT ) {
            const fromPassedSec = 
                Math.floor(( now.getTime() - this.blockedUpTo.getTime() ) / 1000);
            if( fromPassedSec < this.LOGIN_BLOCK_TIME ) // 5분 경과 안했으면 Throw Error
                throw new ForbiddenException('Login Try Count Exceed')

            this.initBlockedInfo(); // 5분이 지났으면 Block 정보 초기화 이후 다음 프로세스
        }
        /* 로그인 횟수 검사 통과되면 비밀번호 검사 */
        if( await this.password.comparePassword(password, this.password.getValue()) )
            return this.loginSucceeded(now);
        this.loginFailed(now);
    }

    /* 비밀번호를 5번까지 틀린 사람 Throw Error */
    statusCheck() {
        if( this.status == USER_STATUS.DENIED || this.status == USER_STATUS.BLOCKED )
            throw new NotFoundException('Something Error Id Or Password');
    }
    
    /* 갱신된 인증 정보까지 받아오면 로그인 성공 */
    updateAuthentication(updateAuthentication: UserAuthentication) {
        this.authentication = updateAuthentication;
        this.status = USER_STATUS.LOGINED;
     }

    private loginSucceeded(now: Date) {
        this.loginTry = 0;
        this.blockedUpTo = null;
        this.updatedAt = now;
        this.status = USER_STATUS.PASSED;
    }

    private loginFailed(now: Date) {
        this.loginTry += 1;
        /* 5번째 틀렸을 경우엔 사용자 상태와 Block된 시간 설정 */
        if( this.loginTry == 5 ) {
            this.blockedUpTo = now;
            this.status = USER_STATUS.BLOCKED;
            return;
        }
        this.status = USER_STATUS.DENIED;
    }

    private initBlockedInfo() { 
        this.loginTry = 0;
        this.status = USER_STATUS.LOGOUTED;
    }

}