export type SignUpBody = {
    name: string
    email: string
    password: string
}

export type User = {
    email: string
    password: string
    isEmailVerified: boolean
    name: string
    id: string
}

export type Player = {
    connectionId: string
    pieces: number[]
    team: TEAM
    timeOut: number
}

export type Game = {
    id: string
    players: Player[]
    teamOnMove: TEAM
}

export const enum TEAM {
    WHITE = "WHITE",
    BLACK = "BLACK"
}

export type Point = {
    x: number
    y: number
}

export type Connection = {
    id: string
    userId: string
}