import { findRemovedPieces, getBoard, isAreaSurrounded } from "../src/functions/placePiece/findRemovedPieces";

import { TEAM, Point } from "../src/types";

expect.extend({
    toMatchBoard(received: boolean[], board: Point[]) {
        for (const p of board) {
            if (!received[p.y * 19 + p.x]) {
                return {
                    pass: false,
                    message: () => `Point ${p.x}:${p.y} missing `
                }
            }
        }

        const cellsCount = received.filter(c => c).length
        if (cellsCount !== board.length) {
            return {
                pass: false,
                message: () => "Too many points"
            }
        }

        return {
            pass: true,
            message: () => ""
        }
    }
})

describe("isAreaSurrounded", () => {
    test("2 pieces next to each other", () => {
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

        //console.log(board)

        const res = isAreaSurrounded(board, { x: 1, y: 0 })

        expect(res.isSurrounded).toBeFalsy()
    })

    test("1 white surrounded by 4 black", () => {
        const board = getBoard({
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

        const res = isAreaSurrounded(board, { x: 1, y: 1 });

        (expect(res.area) as any).toMatchBoard([{ x: 1, y: 1 }])
    })

    test("1 white surrounded by 3 black", () => {
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

        const res = isAreaSurrounded(board3, { x: 1, y: 1 })

        expect(res.isSurrounded).toBeFalsy()
    })

    test("1 white surrounded by 2 black", () => {
        const board = getBoard({
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


        const res = isAreaSurrounded(board, { x: 0, y: 0 });

        (expect(res.area) as any).toMatchBoard([{x: 0, y: 0}])
    })

    test("[2, 20, 22] [21, 41]", () => {
        const game = {
            players: [
                {
                    pieces: [2, 20, 22],
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

        console.log(game)

        const game5Removed = findRemovedPieces(game, { x: 2, y: 2 }, TEAM.BLACK).removedPieces;
        //const removed = game5Removed.reduce((prev, current, i) => current ? [...prev, { y: (i / 19) | 0, x: i % 19 }] : prev, [])

        (expect(game5Removed) as any).toMatchBoard([{x: 2, y: 1}])
    })

    test(`
        *
       *+*
       *++*
        **
    `, () => {
        const game = {
            players: [
                {
                    pieces: [
                        1, 
                        19,         19 + 2, 
                        19 * 2, 
                        19 * 3 + 1, 19 * 3 + 2
                    ],
                    team: TEAM.BLACK,
                    connectionId: "",
                    timeOut: 1
                },
                {
                    pieces: [
                        19 + 1, 
                        19 * 2 + 1, 19 * 2 + 2
                    ],
                    team: TEAM.WHITE,
                    connectionId: "",
                    timeOut: 1
                }
            ],
            id: "",
            teamOnMove: TEAM.WHITE
        }

        console.log(game)

        const gameRemoved = findRemovedPieces(game, { x: 3, y: 2 }, TEAM.BLACK).removedPieces;
        const removed = gameRemoved?.reduce((prev, current, i) => current ? [...prev, { y: (i / 19) | 0, x: i % 19 }] : prev, [])

        console.log(removed);
        (expect(gameRemoved) as any).toMatchBoard([
            {x: 1, y: 1},
            {x: 1, y: 2},
            {x: 2, y: 2},
        ])
    })
})