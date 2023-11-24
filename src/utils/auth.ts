import { User } from "../types";
import jwt from "jsonwebtoken"

// Temporary solution
process.env = process.env || {}
process.env.JWT_SECRET_KEY = "jwt_secret_key"

export function createTokenFromUser(user: Partial<User>){
    const {
        password: _1,
        id: _2,
        ...jwtContent
    } = user

    return jwt.sign(jwtContent, process.env.JWT_SECRET_KEY)
}