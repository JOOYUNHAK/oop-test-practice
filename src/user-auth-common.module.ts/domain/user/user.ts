import { UserAuthentication } from "src/user-auth-common.module.ts/domain/auth/authentication";
import { USER_STATUS } from "../../../user/domain/enum/user-status.enum";
import { Password } from "./user-password";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { LoginBlockInfo } from "./login-block-info";

@Entity('user')
export class User {
    @PrimaryGeneratedColumn('increment')
    private id : number;

    @Column({ type: 'varchar', length: 50 })
    private readonly email: string;

    @OneToOne(() => Password, (password) => password.user, { cascade: ['insert', 'update' ]})
    public password: Password;    

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'registered_at' })
    private registeredAt: Date;

    @OneToOne(() => UserAuthentication, (auth) => auth.user, {cascade: ['insert', 'update' ]})
    public authentication: UserAuthentication;

    @Column({ type: 'enum', enum: USER_STATUS })
    private status: USER_STATUS;

    @OneToOne(() => LoginBlockInfo, (block) => block.user, { cascade: ['insert', 'update'] })
    public loginBlockInfo: LoginBlockInfo;

    @Column({ type: 'timestamp', name: 'updated_at' })
    private updatedAt: Date;

    constructor( 
        id: number, email: string, password: Password, authentication: UserAuthentication,
        updatedAt: Date, loginBlockInfo: LoginBlockInfo, status: USER_STATUS
    ) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authentication = authentication;
        this.updatedAt = updatedAt;
        this.loginBlockInfo = loginBlockInfo;
        this.status = status;
    }

    getId(): number { return this.id };
    getEmail(): string { return this.email; };
    getPassword(): Password { return this.password; };
    getUpdateTime(): Date { return this.updatedAt; };
    getRegisteredTime(): Date { return this.registeredAt; };
    getBlockedTime(): LoginBlockInfo { return this.loginBlockInfo; };
    getStatus(): USER_STATUS { return this.status; };
    getAuthentication(): UserAuthentication { return this.authentication; };
    getClientAuthentication():string { return this.authentication.getClientAuthentication(); };

    /* 생성된 유저의 아이디 */
    withId(id: number): User { 
        this.id = id;
        return this;
    }
    
    registered() { 
        this.status = USER_STATUS.LOGINED; 
        return this;
    };

    /* 로그아웃 처리, 이미 로그아웃 상태일경우 guard에게 막힌다 */
    logout(logoutTime: Date) {
        this.updatedAt = logoutTime;
        this.status = USER_STATUS.LOGOUTED; 
    };

    /* 로그인 처리 */
    async loginWith(password: string, now: Date) {
        /* 로그인 차단된 유저인지 */
        this.loginBlockInfo.check(now);
        /* 로그인 횟수 검사 통과되면 비밀번호 검사 */
        await this.password.comparePassword(password) ? 
            this.loginSucceeded(now) : this.loginFailed(now);
    }

    /* 로그인에 성공했는지 */
    isLoginSucceeded(): boolean { return this.status == USER_STATUS.PASSED; };

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

    async changePassword(old: string, toChange: string, updatedAt: Date) {
        /* 비밀번호 변경 실패 */
        if( !await this.password.changePassword(old, toChange, new Date()) ) 
            throw new UnauthorizedException('Something Error Id Or Password');
        this.updatedAt = updatedAt;
     }

     /* 탈퇴 */
    async leaved(inputPassword: string) {
        if( !await this.password.comparePassword(inputPassword) )
            throw new UnauthorizedException('Something Error Id Or Password');
        this.status = USER_STATUS.LEAVED;
    }

    private loginSucceeded(now: Date): void {
        this.loginBlockInfo.initBlockInfo();
        this.updatedAt = now;
        this.status = USER_STATUS.PASSED;
    }

    private loginFailed(now: Date): void {
        this.loginBlockInfo.handleFailed(now);
        this.status = this.loginBlockInfo.toBeBlocked() ? 
                        USER_STATUS.BLOCKED : USER_STATUS.DENIED 
    }
}