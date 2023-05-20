import { JwtModuleOptions } from '@nestjs/jwt'
export const jwtModuleOption: JwtModuleOptions = {
    global: true,
    secret: process.env.JWT_TOKEN_SECRET
}