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

export type Game = {
    id: string
    players: string[]
}

export const enum TEAM {
    WHITE = "WHITE",
    BLACK = "BLACK"
}