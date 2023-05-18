import { USER_STATUS } from "./enum/user-status.enum";
import { Email } from "./user-email";
import { Password } from "./user-password";

export class User {
    private id? : number;
    private email: Email;
    private password: Password;
    private updatedAt: Date;
    private registeredAt: Date;
    private loginTry: number;
    private blockedUpTo: Date;
    private accessToken: string;
    private refreshToken: string;
    private status: USER_STATUS;

    constructor( email: Email, password: Password, registeredAt: Date ) {
        this.email = email;
        this.password = password;
        this.registeredAt = registeredAt;
        this.updatedAt = registeredAt;
    }
}