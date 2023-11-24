import { User } from "../types";
import jwt from "jsonwebtoken"

export function createTokenFromUser(user: Partial<User>){
    const {
        password: _1,
        id: _2,
        ...jwtContent
    } = user

    return jwt.sign(jwtContent, process.env.JWT_SECRET_KEY)
}