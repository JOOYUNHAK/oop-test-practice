import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/user-auth-common.module.ts/domain/user/user";

@Entity('authentication')
export class UserAuthentication {
    @PrimaryGeneratedColumn('increment')
    private id: number;
    
    @Column({ type: 'varchar', name: 'refresh_token'})
    private refreshAuthentication: string;
    
    @Column({ type: 'timestamp', name: 'refreshed_at' })
    private refreshedAt: Date;
    
    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'user_id', referencedColumnName: 'id' })
    readonly user: User

    private clientAuthentication: string;
    
    constructor( clientAuthentication: string, refreshAuthentication: string, refreshedAt: Date) {
        this.clientAuthentication = clientAuthentication;
        this.refreshAuthentication = refreshAuthentication;
        this.refreshedAt = refreshedAt;
    };
    
    getId(): number { return this.id; };
    
    isNeededUpdate(now: Date): boolean { 
        return Math.floor(
            ((now.getTime() - this.refreshedAt.getTime()) / AUTHENTICATION_OPTION.EXPIRED_TIME)
        ) > AUTHENTICATION_OPTION.REFRESH_CYCLE ? true : false;
     } 

    getClientAuthentication(): string { return this.clientAuthentication; };

    updateClientAuthentication(clientAuthentication: string) { this.clientAuthentication = clientAuthentication; };
    updateRefreshAuthentication(refreshAuthentication: string, refreshedAt: Date) { 
        this.refreshAuthentication = refreshAuthentication;
        this.refreshedAt = refreshedAt;
    };
    
    static createWith ( clientAuthentication: string, refreshAuthentication: string ) {
        return new UserAuthentication(clientAuthentication, refreshAuthentication, new Date())
    }
}

enum AUTHENTICATION_OPTION {
    EXPIRED_TIME = 1000 * 60 * 60 * 24,
    REFRESH_CYCLE = 7
}

