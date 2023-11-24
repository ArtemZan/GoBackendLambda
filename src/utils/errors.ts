// To do: status codes

type ValueOf<T> = T[keyof T]

enum ERROR_CODE_500 {
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    SEND_EMAIL_FAILED = "SEND_EMAIL_FAILED",
}

enum ERROR_CODE_400 {
    EMAIL_TAKEN = "EMAIL_TAKEN",
    ADD_USER_FAILED = "ADD_USER_FAILED",
    WRONG_CODE = "WRONG_CODE",
    WRONG_CREDENTIALS = "WRONG_CREDENTIALS"
}

export const ERROR_CODE = {
    ...ERROR_CODE_400,
    ...ERROR_CODE_500
} 

export const errorMessage: { [key in ValueOf<typeof ERROR_CODE>]: string } = {
    EMAIL_TAKEN: "This email is already taken",
    SEND_EMAIL_FAILED: "Failed to send email",
    ADD_USER_FAILED: "Failed to add user",
    WRONG_CODE: "Wrong code",
    UNKNOWN_ERROR: "Unknown error",
    WRONG_CREDENTIALS: "Invalid username or password"
}

export function getBodyFromErrorCode(code: ValueOf<typeof ERROR_CODE>) {
    return JSON.stringify({
        error: errorMessage[code],
        errorCode: code
    })
}

type SupportedStatus = 400 | 500 

export function getResponseFromErrorCode(status: 500, code: ERROR_CODE_500): any;
export function getResponseFromErrorCode(status: 400, code: ERROR_CODE_400): any;
export function getResponseFromErrorCode(status: SupportedStatus, code: ValueOf<typeof ERROR_CODE>) {
    return {
        statusCode: status,
        body: getBodyFromErrorCode(code)
    }
}



getResponseFromErrorCode(500, ERROR_CODE.UNKNOWN_ERROR)