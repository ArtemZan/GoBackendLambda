import { Game, Point, TEAM } from "../../types"

// To do: get the actual board size.
const boardWidth = 19
const boardHeight = 19

export function pointToIndex(point: Point) {
    return point.y * boardWidth + point.x
}

function indexToPoint(index: number) {
    return {
        x: index % boardWidth,
        y: Math.floor(index / boardWidth)
    }
}

type BoardMap = {
    isChecked?: boolean
    team?: TEAM
}[]

export function getBoard(game: Game) {
    const board: BoardMap = new Array(boardHeight * boardWidth)

    game.players.forEach(player =>
        player.pieces?.forEach(piece =>
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

export function isAreaSurrounded(board: BoardMap, pointFromArea: Point) {
    const team = board[pointToIndex(pointFromArea)]?.team

    if (!team) {
        return {
            isSurrounded: false
        }
    }

    const spans: Span[] = [
        {
            x1: pointFromArea.x,
            x2: pointFromArea.x,
            y: pointFromArea.y,
            dy: 1
        },
        {
            x1: pointFromArea.x,
            x2: pointFromArea.x,
            y: pointFromArea.y - 1,
            dy: -1
        }
    ]

    while (spans.length) {
        const span = spans.pop()
        console.log("Check span: ", span)
        const rowSpansSearchResult = checkRowForSpans(span)
        if (rowSpansSearchResult.foundEmpty) {
            console.log("Not surrounded")
            return {
                isSurrounded: false
            }
        }

        spans.push(...rowSpansSearchResult.spans)
    }

    function checkRowForSpans({ x1, x2, y, dy }: Span) {
        if(y < 0 || y >= boardHeight || x1 < 0 || x1 >= boardWidth)
        {
            return {
                foundEmpty: false
            }
        }

        const spans: Span[] = []

        function getLeftmostPoint() {
            let leftmostX = x1

            console.log("Find the leftmost")

            // If the current x is not of the needed team, go to right
            while (board[pointToIndex({ x: leftmostX, y })]?.team !== team) {
                if(leftmostX >= boardWidth - 1 || leftmostX >= x2)
                {
                    return {
                        foundEmpty: false
                    }
                }
                leftmostX++
            }

            console.log("The leftmost: ", leftmostX)

            if (board[pointToIndex({ x: leftmostX, y })]?.isChecked) {
                return {
                    isChecked: true
                }
            }

            console.log("Go to the left until the opponent piece is encountered")

            // Go to the left until the opponent piece is encountered
            while (true) {
                const piece = board[pointToIndex({ x: leftmostX, y })]

                if (!piece?.team) {
                    return {
                        foundEmpty: true
                    }
                }

                if (piece?.team !== team) {
                    leftmostX++
                    break
                }

                leftmostX--;
            }

            console.log("The actual leftmost point: ", leftmostX)

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

        for (let x = leftmostPointSearchResult.leftmostX; x <= x2; x++) {
            const spanStart = x

            let point: typeof board[0] = null

            const spanStartPoint = board[pointToIndex({ x, y })]

            console.log("Is checked: ", spanStartPoint?.isChecked)

            if (spanStartPoint?.isChecked || (spanStartPoint?.team && spanStartPoint?.team !== team)) {
                continue
            }

            console.log("Go to the right, until an obstacle is encountered")

            // Go to the right, until an obstacle is encountered
            do {
                x++
                point = board[pointToIndex({ x, y })]
                if (!point?.team) {
                    return {
                        foundEmpty: true
                    }
                }
            }
            while (point.team === team)

            console.log("The rightmost: ", x)

            spans.push({
                x1: spanStart,
                x2: x,
                y: y + dy,
                dy
            })

            if (x > x2 + 1) {
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

    const areaMap = board.map(piece => piece.isChecked)

    return {
        isSurrounded: true,
        area: areaMap
    }
}

export function findRemovedPieces(game: Game, position: Point, team: TEAM) {
    const board = getBoard(game)

    if(board[pointToIndex(position)]?.team)
    {
        return {
            isCellUsed: true
        }
    }

    board[pointToIndex(position)] = {
        team,
        isChecked: false
    }


    const neighbours = [
        { x: position.x, y: position.y + 1 },
        { x: position.x + 1, y: position.y },
        { x: position.x, y: position.y - 1 },
        { x: position.x - 1, y: position.y }
    ]

    const removedPieces = neighbours
        .map(position => isAreaSurrounded(board, position))
        .reduce<boolean[]>((prev, current) =>
            current?.isSurrounded ?
                prev ?
                    current.area.map((isRemoved, index) => isRemoved || prev[index])
                    :
                    current.area
                :
                prev
            , null)


    const { isSurrounded: isSuicide } = isAreaSurrounded(board, position)

    // Suicide doesn't take place, if some of the enemies pieces are killed
    if (isSuicide && !removedPieces) {
        return {
            isSuicide: true
        }
    }

    return {
        removedPieces
    }
}