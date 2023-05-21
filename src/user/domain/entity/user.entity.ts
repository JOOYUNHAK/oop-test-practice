import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { USER_STATUS } from '../enum/user-status.enum'
import { Authentication } from "src/auth/domain/authentication/entity/auth.entity";

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn('increment')
    readonly id: number;

    @Column({ type: 'varchar', length: 50 })
    private readonly email: string;

    @Column({ type: 'varchar',length: 72 })
    private readonly password: string;

    @Column({ type: 'timestamp', name: 'registered_at' })
    private readonly registeredAt: Date;

    @Column({ type: 'timestamp', name: 'updated_at' })
    private readonly updatedAt: Date; 

    @Column({ type: 'tinyint', name: 'login_try' })
    private readonly loginTry: number;

    @Column({ type: 'timestamp', name: 'blocked_up_to', nullable: true })
    private blockedUpTo: Date;

    @Column({ type: 'enum', enum: USER_STATUS})
    private readonly status: USER_STATUS;

    @OneToOne(() => Authentication, { cascade: ['insert', 'remove', 'update'] })
    @JoinColumn({name: 'authentication_id'})
    readonly authentication: Authentication
    
    constructor(
        id: number, email: string, password: string, updatedAt: Date, registeredAt: Date, 
        loginTry: number, blockedUpTo: Date, status: USER_STATUS, authentication: Authentication
    ) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.updatedAt = updatedAt;
        this.registeredAt = registeredAt;
        this.loginTry = loginTry;
        this.blockedUpTo = blockedUpTo;
        this.status = status;
        this.authentication = authentication;
    }

    getId(): number { return this.id; };
    getEmail(): string { return this.email; };
    getPassword(): string { return this.password; };
    getAuthentication(): Authentication { return this.authentication; };
    getRegisteredTime(): Date { return this.registeredAt; };
    getUpdatedTime(): Date { return this.updatedAt; };
    getLoginTry(): number { return this.loginTry; };
    getBlockedTime(): Date { return this.blockedUpTo; };
    getStatus(): USER_STATUS { return this.status; };

}