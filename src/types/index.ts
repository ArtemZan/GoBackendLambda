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