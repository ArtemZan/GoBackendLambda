import { findRemovedPieces, getBoard, isAreaSurrounded } from "../functions/placePiece/findRemovedPieces";
import { TEAM } from "../types";

// const board = getBoard({
//     players: [
//         {
//             pieces: [0],
//             team: TEAM.BLACK,
//             connectionId: "",
//             timeOut: 1
//         },
//         {
//             pieces: [1],
//             team: TEAM.WHITE,
//             connectionId: "",
//             timeOut: 1
//         }
//     ],
//     id: "",
//     teamOnMove: TEAM.WHITE
// })

// console.log(board)

// console.log(isAreaSurrounded(board, {x: 1, y: 0}))
// //false


// const board2 = getBoard({
//     players: [
//         {
//             pieces: [1, 19, 21, 39],
//             team: TEAM.BLACK,
//             connectionId: "",
//             timeOut: 1
//         },
//         {
//             pieces: [20],
//             team: TEAM.WHITE,
//             connectionId: "",
//             timeOut: 1
//         }
//     ],
//     id: "",
//     teamOnMove: TEAM.WHITE
// })

// console.log(board2)

// console.log(isAreaSurrounded(board2, {x: 1, y: 1}))
// //true

// const board3 = getBoard({
//     players: [
//         {
//             pieces: [1, 19, 21],
//             team: TEAM.BLACK,
//             connectionId: "",
//             timeOut: 1
//         },
//         {
//             pieces: [20],
//             team: TEAM.WHITE,
//             connectionId: "",
//             timeOut: 1
//         }
//     ],
//     id: "",
//     teamOnMove: TEAM.WHITE
// })

// console.log(board3)

// console.log(isAreaSurrounded(board3, {x: 1, y: 1}))
// //false


// const board4 = getBoard({
//     players: [
//         {
//             pieces: [1, 19],
//             team: TEAM.BLACK,
//             connectionId: "",
//             timeOut: 1
//         },
//         {
//             pieces: [0],
//             team: TEAM.WHITE,
//             connectionId: "",
//             timeOut: 1
//         }
//     ],
//     id: "",
//     teamOnMove: TEAM.WHITE
// })

// console.log(board4)

// console.log(isAreaSurrounded(board4, {x: 0, y: 0}))
//true



const game5 = {
    players: [
        {
            pieces: [2, 20, 22],//, 40],
            team: TEAM.BLACK,
            connectionId: "",
            timeOut: 1
        },
        {
            pieces: [21, 41],
            team: TEAM.WHITE,
            connectionId: "",
            timeOut: 1
        }
    ],
    id: "",
    teamOnMove: TEAM.WHITE
}

console.log(game5)

const game5Removed = findRemovedPieces(game5, {x: 2, y: 2}, TEAM.BLACK).removedPieces
const removed = game5Removed.reduce((prev, current, i) => current ? [...prev, {y: (i / 19) | 0, x: i % 19}] : prev, [])
console.log(removed)





const board6 = getBoard({
    players: [
        {
            pieces: [2, 20, 22, 40],
            team: TEAM.BLACK,
            connectionId: "",
            timeOut: 1
        },
        {
            pieces: [21, 41],
            team: TEAM.WHITE,
            connectionId: "",
            timeOut: 1
        }
    ],
    id: "",
    teamOnMove: TEAM.WHITE
})

console.log(board6)

console.log(isAreaSurrounded(board6, {x: 2, y: 1}))
// true -> 1 piece removed

