import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { ForbiddenException } from "@nestjs/common";

@Entity('login_block_info')
export class LoginBlockInfo {

    @PrimaryGeneratedColumn('increment')
    private id: number;

    @Column({ type: 'tinyint', name: 'login_try' })
    private loginTry: number;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    readonly user: User

    @Column({ name: 'blockedAt', type: 'timestamp', nullable: true })
    private blockedAt: Date;

    constructor(tryCount: number, blockedAt: Date) {
        this.loginTry = tryCount;
        this.blockedAt = blockedAt;
    }

    check(now: Date): void {
        /* 로그인시도 횟수가 5번이면 Block Time 체크 */
        if (this.loginTry == LOGIN_OPTION.TRY_LIMIT_COUNT)
            this.blockTimeCheck(now);
            /* 5분이 지났으면 Block 정보 초기화 */
    }

    initBlockInfo(): void { this.loginTry = 0; };

    handleFailed(now: Date): void {
        this.addFailedCount();
        this.tryCountCheck(now);
    };

    addFailedCount() {
        if( this.loginTry != 5 )
            this.loginTry += 1;
    }

    toBeBlocked(): boolean { return this.loginTry == 5; };

    private tryCountCheck(now: Date):void {
        if( this.loginTry == 5 )
            this.blockedAt = now;
    }
    
    private blockTimeCheck(now: Date): void {
        if( !this.blockedAt ) return;
        /* 5분 경과 안했으면 Throw Error */
        if ( Math.floor( (now.getTime() - this.blockedAt.getTime()) / 1000 ) < LOGIN_OPTION.BLOCK_TIME )  
            throw new ForbiddenException('Login Try Count Exceed')
    }    
}

enum LOGIN_OPTION {
    TRY_LIMIT_COUNT = 5,
    BLOCK_TIME = 300
}