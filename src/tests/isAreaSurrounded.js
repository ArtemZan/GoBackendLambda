"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var findRemovedPieces_1 = require("../functions/placePiece/findRemovedPieces");
var board = (0, findRemovedPieces_1.getBoard)({
    players: [
        {
            pieces: [0],
            team: "BLACK" /* TEAM.BLACK */,
            connectionId: "",
            timeOut: 1
        },
        {
            pieces: [1],
            team: "WHITE" /* TEAM.WHITE */,
            connectionId: "",
            timeOut: 1
        }
    ],
    id: "",
    teamOnMove: "WHITE" /* TEAM.WHITE */
});
console.log(board);
console.log((0, findRemovedPieces_1.isAreaSurrounded)(board, { x: 1, y: 0 }));
//false
var board2 = (0, findRemovedPieces_1.getBoard)({
    players: [
        {
            pieces: [1, 19, 21, 39],
            team: "BLACK" /* TEAM.BLACK */,
            connectionId: "",
            timeOut: 1
        },
        {
            pieces: [20],
            team: "WHITE" /* TEAM.WHITE */,
            connectionId: "",
            timeOut: 1
        }
    ],
    id: "",
    teamOnMove: "WHITE" /* TEAM.WHITE */
});
console.log(board2);
console.log((0, findRemovedPieces_1.isAreaSurrounded)(board2, { x: 1, y: 1 }));
//true
var board3 = (0, findRemovedPieces_1.getBoard)({
    players: [
        {
            pieces: [1, 19, 21],
            team: "BLACK" /* TEAM.BLACK */,
            connectionId: "",
            timeOut: 1
        },
        {
            pieces: [20],
            team: "WHITE" /* TEAM.WHITE */,
            connectionId: "",
            timeOut: 1
        }
    ],
    id: "",
    teamOnMove: "WHITE" /* TEAM.WHITE */
});
console.log(board3);
console.log((0, findRemovedPieces_1.isAreaSurrounded)(board3, { x: 1, y: 1 }));
//false
var board4 = (0, findRemovedPieces_1.getBoard)({
    players: [
        {
            pieces: [1, 19],
            team: "BLACK" /* TEAM.BLACK */,
            connectionId: "",
            timeOut: 1
        },
        {
            pieces: [0],
            team: "WHITE" /* TEAM.WHITE */,
            connectionId: "",
            timeOut: 1
        }
    ],
    id: "",
    teamOnMove: "WHITE" /* TEAM.WHITE */
});
console.log(board4);
console.log((0, findRemovedPieces_1.isAreaSurrounded)(board4, { x: 0, y: 0 }));
//true
