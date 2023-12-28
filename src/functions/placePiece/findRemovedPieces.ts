import { Game, Point, TEAM } from "../../types"

// To do: get the actual board size.
const boardWidth = 13
const boardHeight = 13

export function pointToIndex(point: Point) {
    return point.y * boardWidth + point.x
}

function indexToPoint(index: number) {
    return {
        x: index % boardWidth,
        y: Math.floor(index / boardWidth)
    }
}

function getBoard(game: Game) {
    const board: {
        isChecked: boolean
        team: TEAM
    }[] = new Array(boardHeight * boardWidth)

    game.players.forEach(player =>
        player.pieces.forEach(piece =>
            board[piece] = {
                team: player.team,
                isChecked: false
            }
        )
    )

    return board
}

type Span = {
    x1: number
    x2: number
    y: number
    dy: 1 | -1
}


export function findRemovedPieces(game: Game, position: Point, team: TEAM) {
    const board = getBoard(game)

    const spans: Span[] = [
        {
            x1: position.x,
            x2: position.x,
            y: position.y,
            dy: 1
        },
        {
            x1: position.x,
            x2: position.x,
            y: position.y - 1,
            dy: -1
        }
    ]

    while (spans.length)
    {
        const span = spans.pop()
        const rowSpansSearchResult = checkRowForSpans(span)
        if (rowSpansSearchResult.foundEmpty) {
            return {
                noRemoved: true
            }
        }

        spans.push(...rowSpansSearchResult.spans)
    }

    function checkRowForSpans({x1, x2, y, dy}: Span) {
        const spans: Span[] = []

        function getLeftmostPoint() {
            let leftmostX = x1

            // If the current x is not of the needed team, go to right
            while (board[pointToIndex({ x: leftmostX, y })].team !== team) {
                leftmostX++
            }

            if(board[pointToIndex({ x: leftmostX, y })].isChecked){
                return {
                    isChecked: true
                }
            }

            // Go to the left until the opponent piece is encountered
            while (true) {
                const piece = board[pointToIndex({ x: leftmostX, y })]

                if (!piece.team) {
                    return {
                        foundEmpty: true
                    }
                }

                if (piece.team !== team) {
                    leftmostX++
                    break
                }

                leftmostX--;
            }

            return {
                foundEmpty: false,
                leftmostX
            }
        }

        const leftmostPointSearchResult = getLeftmostPoint()
        if (leftmostPointSearchResult.foundEmpty) {
            return {
                foundEmpty: true
            }
        }

        for (let x = leftmostPointSearchResult.leftmostX; x < x2; x++) {
            const spanStart = x

            let point: typeof board[0] = null

            if(board[pointToIndex({ x, y })].isChecked){
                continue
            }

            // Go to the right, until an obstacle is encountered
            do {
                x++
                point = board[pointToIndex({ x, y })]
                if (!point.team) {
                    return {
                        foundEmpty: true
                    }
                }
            }
            while (point.team === team)

            spans.push({
                x1: spanStart,
                x2: x,
                y: y + dy,
                dy
            })

            if(x > x2 + 1){
                spans.push({
                    x1: spanStart,
                    x2: x,
                    y: y - dy,
                    dy: -dy as (1 | -1)
                })
            }
        }

        return {
            spans
        }
    }

    const removedPieces = board.map(piece => piece.isChecked)

    return {
        noRemoved: false,
        removedPieces
    }
}