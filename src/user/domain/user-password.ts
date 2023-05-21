import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export class Password {
    private readonly password: string;
    private readonly isHashed: boolean;

    constructor( 
        passowrd: string
    ) { 
        this.password = passowrd;
        this.isHashed = true;
     };

    getValue(): string { return this.password; };

    /* 비밀번호 유효성 검사 */
    private static validate(plainTextPassword: string): boolean {
        const passwordCheckReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{10,}$/;
        if( !passwordCheckReg.test(plainTextPassword) )
            throw new BadRequestException('Password Validate Failed');
        return true;
    }

    /* 비밀번호 암호화 */
    private static async encrypt(plainTextPassword: string): Promise<string> {
        return bcrypt.hashSync(plainTextPassword, 5);
    }

    /* 암호화 되지 않은 비밀번호와 비교 */
    public async comparePassword(
        plainTextPassword: string, encryptedPassword: string
    ): Promise<boolean> {
        return await bcrypt.compare(plainTextPassword, encryptedPassword)
    }

    /*  
        암호화 되어 있는 비밀번호면 그대로 Return
        암호화 되어 있지 않으면 암호화 해서 Return
    */
    static async create(password: string, isHashed: boolean): Promise<Password> { 
        if( isHashed ) return new Password( password );
        
        this.validate(password);
        return new Password( await this.encrypt(password) );
    }
}