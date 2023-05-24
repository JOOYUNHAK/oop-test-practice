import { BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';

@Entity('user_password')
export class Password {
    @PrimaryGeneratedColumn('increment')
    private id: number;

    @Column({ type: 'varchar' })
    private value: string;

    @Column({ type: 'timestamp', name: 'updated_at' })
    private updatedAt: Date

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    readonly user: User

    constructor(
        passowrd: string,
        updatedAt: Date = new Date()
    ) {
        this.value = passowrd;
        this.updatedAt = updatedAt;
    };

    getValue(): string { return this.value; };

    /*  
       암호화 되어 있는 비밀번호면 그대로 Return
       암호화 되어 있지 않으면 암호화 해서 Return
   */
    static async create(password: string): Promise<Password> {
        this.validate(password);
        return new Password(await this.encrypt(password));
    }

    /* 비밀번호 변경 */
    public async changePassword(old: string, toChange: string, updatedAt: Date): Promise<boolean> {
        if (!await this.comparePassword(old)) return false;
        if (this.equals(old, toChange))
            throw new ConflictException('Duplicated Password');
        this.changeSucceeded(toChange, updatedAt);
        return true
    }

    /* 비밀번호 유효성 검사 */
    private static validate(plainTextPassword: string) {
        const passwordCheckReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{10,}$/;
        if (!passwordCheckReg.test(plainTextPassword))
            throw new BadRequestException('Password Validate Failed');
    }

    /* 비밀번호 암호화 */
    private static async encrypt(plainTextPassword: string): Promise<string> {
        return bcrypt.hashSync(plainTextPassword, 5);
    }

    /* 암호화 되지 않은 비밀번호와 비교 */
    public async comparePassword(plainTextPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainTextPassword, this.value)
    }

    /* 비밀번호 변경 완료 */
    private changeSucceeded(newPassword: string, updatedAt: Date) {
        this.value = newPassword;
        this.updatedAt = updatedAt;
    }

    /* 기존 사용하던 비밀번호랑 같은지 */ 
    private equals(old: string, toChange: string): boolean { return old === toChange; };
}