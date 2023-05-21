import { UserEntity } from "src/user/domain/entity/user.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('auth')
export class Authentication {
    @PrimaryGeneratedColumn('increment')
    private readonly id: number;

    @Column({ name: 'refresh_token' })
    private readonly refreshToken: string;

    @OneToOne(() => UserEntity, (user) => user.authentication, { onDelete: 'CASCADE', onUpdate: 'CASCADE' } )
    user: UserEntity

    @Column({ name: 'updated_at', type: 'timestamp' })
    private readonly updatedAt: Date;

    constructor(id: number, refreshToken: string, updatedAt: Date ) {
        this.id = id;
        this.refreshToken = refreshToken;
        this.updatedAt = updatedAt;
    }

    getRefreshAuthentication(): string { return this.refreshToken; };
    getUpdatedTime(): Date { return this.updatedAt; };
}