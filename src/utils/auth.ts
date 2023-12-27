import { APIGatewayProxyEventHeaders } from "aws-lambda";
import { User } from "../types";
import jwt from "jsonwebtoken"

// Temporary solution
process.env = process.env || {}
process.env.JWT_SECRET_KEY = "jwt_secret_key"

export function createTokenFromUser(user: Partial<User>){
    const {
        password: _1,
        ...jwtContent
    } = user

    return jwt.sign(jwtContent, process.env.JWT_SECRET_KEY)
}


export function getTokenFromHeaders(headers: APIGatewayProxyEventHeaders){
    const header = headers.authorization
    if(!header){
        return
    }

    const token = header.slice("Bearer ".length)

    return jwt.decode(token) as jwt.JwtPayload
}