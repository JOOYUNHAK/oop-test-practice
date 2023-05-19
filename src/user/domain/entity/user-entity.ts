import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { USER_STATUS } from '../enum/user-status.enum'

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn('increment')
    private readonly id: number;

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

    @Column({ type: 'varchar', name: 'refresh_token' })
    private readonly refreshToken: string;
    
    constructor(
        id: number, email: string, password: string, registeredAt: Date, updatedAt: Date, 
        loginTry: number, blockedUpTo: Date, status: USER_STATUS, refreshToken: string
    ) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.registeredAt = registeredAt;
        this.updatedAt = updatedAt;
        this.loginTry = loginTry;
        this.blockedUpTo = blockedUpTo;
        this.refreshToken = refreshToken;
        this.status = status;
    }

    getId(): number { return this.id; };
}