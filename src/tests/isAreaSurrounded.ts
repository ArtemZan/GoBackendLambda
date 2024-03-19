import { getBoard, isAreaSurrounded } from "../functions/placePiece/findRemovedPieces";
import { TEAM } from "../types";

const board = getBoard({
    players: [
        {
            pieces: [0],
            team: TEAM.BLACK,
            connectionId: "",
            timeOut: 1
        },
        {
            pieces: [1],
            team: TEAM.WHITE,
            connectionId: "",
            timeOut: 1
        }
    ],
    id: "",
    teamOnMove: TEAM.WHITE
})

console.log(board)

console.log(isAreaSurrounded(board, {x: 1, y: 0}))
//false


const board2 = getBoard({
    players: [
        {
            pieces: [1, 19, 21, 39],
            team: TEAM.BLACK,
            connectionId: "",
            timeOut: 1
        },
        {
            pieces: [20],
            team: TEAM.WHITE,
            connectionId: "",
            timeOut: 1
        }
    ],
    id: "",
    teamOnMove: TEAM.WHITE
})

console.log(board2)

console.log(isAreaSurrounded(board2, {x: 1, y: 1}))
//true

const board3 = getBoard({
    players: [
        {
            pieces: [1, 19, 21],
            team: TEAM.BLACK,
            connectionId: "",
            timeOut: 1
        },
        {
            pieces: [20],
            team: TEAM.WHITE,
            connectionId: "",
            timeOut: 1
        }
    ],
    id: "",
    teamOnMove: TEAM.WHITE
})

console.log(board3)

console.log(isAreaSurrounded(board3, {x: 1, y: 1}))
//false


const board4 = getBoard({
    players: [
        {
            pieces: [1, 19],
            team: TEAM.BLACK,
            connectionId: "",
            timeOut: 1
        },
        {
            pieces: [0],
            team: TEAM.WHITE,
            connectionId: "",
            timeOut: 1
        }
    ],
    id: "",
    teamOnMove: TEAM.WHITE
})

console.log(board4)

console.log(isAreaSurrounded(board4, {x: 0, y: 0}))
//true