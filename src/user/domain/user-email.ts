import { BadRequestException } from "@nestjs/common";

export class Email {
    private readonly email: string;
    constructor( email: string ) { this.email = email };

    getValue(): string { return this.email; };
    /* 이메일 유효성 검사 */
    private static validate(email: string): boolean {
        const emailCheckReg = 
            /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
        /* 유효성 검사에 실패하면 Error, 성공하면 True */
        if( !emailCheckReg.test(email) ) throw new BadRequestException('Email Validate Failed');
        return true;
    }

    /* 사용자로부터 받은 이메일 유효성 검사 후 반환 */
    static create(email: string): Email {
        this.validate(email);
        return new Email(email);
    }
}