import { UserAuthentication } from "src/auth/domain/authentication/authentication";
import { USER_STATUS } from "./enum/user-status.enum";
import { Email } from "./user-email";
import { Password } from "./user-password";

export class User {
    private id : number;
    private readonly email: Email;
    private readonly password: Password;
    private updatedAt: Date;
    private registeredAt: Date;
    private loginTry: number;
    private authentication: UserAuthentication;
    private status: USER_STATUS;
    private blockedUpTo?: Date;

    constructor( 
        id: number, email: Email, password: Password, authentication: UserAuthentication,
        updatedAt: Date, registeredAt: Date, loginTry: number, blockedUpTo: Date, status: USER_STATUS
    ) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authentication = authentication;
        this.updatedAt = updatedAt;
        this.registeredAt = registeredAt;
        this.loginTry = loginTry;
        this.blockedUpTo = blockedUpTo;
        this.status = status;
    }

    getId(): number { return this.id };
    getEmail(): Email { return this.email; };
    getPassword(): Password { return this.password; };
    getUpdateTime(): Date { return this.updatedAt; };
    getRegisteredTime(): Date { return this.registeredAt; };
    getLoginTryCount(): number { return this.loginTry; };
    getBlockedTime(): Date { return this.blockedUpTo; };
    getStatus(): USER_STATUS { return this.status; };
    getAuthentication(): UserAuthentication { return this.authentication; };
    getClientAuthentication():string { return this.authentication.getType().getClientAuthentication(); };

    withId(id: number): User { 
        this.id = id;
        return this;
    }
    
    registered() { 
        this.status = USER_STATUS.LOGINED; 
        return this;
    };

}