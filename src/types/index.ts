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
    id: string
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