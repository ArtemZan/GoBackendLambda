"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRemovedPieces = exports.isAreaSurrounded = exports.getBoard = exports.pointToIndex = void 0;
// To do: get the actual board size.
var boardWidth = 19;
var boardHeight = 19;
function pointToIndex(point) {
    return point.y * boardWidth + point.x;
}
exports.pointToIndex = pointToIndex;
function indexToPoint(index) {
    return {
        x: index % boardWidth,
        y: Math.floor(index / boardWidth)
    };
}
function getBoard(game) {
    var board = new Array(boardHeight * boardWidth);
    game.players.forEach(function (player) {
        var _a;
        return (_a = player.pieces) === null || _a === void 0 ? void 0 : _a.forEach(function (piece) {
            return board[piece] = {
                team: player.team,
                isChecked: false
            };
        });
    });
    return board;
}
exports.getBoard = getBoard;
function isAreaSurrounded(board, pointFromArea) {
    var _a;
    var team = (_a = board[pointToIndex(pointFromArea)]) === null || _a === void 0 ? void 0 : _a.team;
    if (!team) {
        return {
            isSurrounded: false
        };
    }
    var spans = [
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
    ];
    while (spans.length) {
        var span = spans.pop();
        console.log("Check span: ", span);
        var rowSpansSearchResult = checkRowForSpans(span);
        if (rowSpansSearchResult.foundEmpty) {
            console.log("Not surrounded");
            return {
                isSurrounded: false
            };
        }
        spans.push.apply(spans, rowSpansSearchResult.spans);
    }
    function checkRowForSpans(_a) {
        var x1 = _a.x1, x2 = _a.x2, y = _a.y, dy = _a.dy;
        if (y < 0 || y >= boardHeight || x1 < 0 || x1 >= boardWidth) {
            return {
                foundEmpty: false
            };
        }
        var spans = [];
        function getLeftmostPoint() {
            var _a;
            var leftmostX = x1;
            console.log("Find the leftmost");
            // If the current x is not of the needed team, go to right
            var point = board[pointToIndex({ x: leftmostX, y: y })];
            while ((point === null || point === void 0 ? void 0 : point.team) !== team) {
                point = board[pointToIndex({ x: leftmostX, y: y })];
                if (!(point === null || point === void 0 ? void 0 : point.team)) {
                    return { foundEmpty: true };
                }
                if (leftmostX >= boardWidth - 1 || leftmostX >= x2) {
                    return { foundEmpty: false };
                }
                leftmostX++;
            }
            console.log("The leftmost: ", leftmostX);
            if ((_a = board[pointToIndex({ x: leftmostX, y: y })]) === null || _a === void 0 ? void 0 : _a.isChecked) {
                return {
                    isChecked: true
                };
            }
            console.log("Go to the left until the opponent piece is encountered");
            // Go to the left until the opponent piece is encountered
            while (true) {
                var piece = board[pointToIndex({ x: leftmostX, y: y })];
                if (!(piece === null || piece === void 0 ? void 0 : piece.team)) {
                    return {
                        foundEmpty: true
                    };
                }
                if ((piece === null || piece === void 0 ? void 0 : piece.team) !== team) {
                    leftmostX++;
                    break;
                }
                leftmostX--;
            }
            console.log("The actual leftmost point: ", leftmostX);
            return {
                foundEmpty: false,
                leftmostX: leftmostX
            };
        }
        var leftmostPointSearchResult = getLeftmostPoint();
        if (leftmostPointSearchResult.foundEmpty) {
            return {
                foundEmpty: true
            };
        }
        for (var x = leftmostPointSearchResult.leftmostX; x <= x2; x++) {
            var spanStart = x;
            var point = null;
            var spanStartPoint = board[pointToIndex({ x: x, y: y })];
            console.log("Is checked: ", spanStartPoint === null || spanStartPoint === void 0 ? void 0 : spanStartPoint.isChecked);
            if ((spanStartPoint === null || spanStartPoint === void 0 ? void 0 : spanStartPoint.isChecked) || ((spanStartPoint === null || spanStartPoint === void 0 ? void 0 : spanStartPoint.team) && (spanStartPoint === null || spanStartPoint === void 0 ? void 0 : spanStartPoint.team) !== team)) {
                continue;
            }
            console.log("Go to the right, until an obstacle is encountered");
            // Go to the right, until an obstacle is encountered
            while (true) {
                point = board[pointToIndex({ x: x, y: y })];
                if (!(point === null || point === void 0 ? void 0 : point.team)) {
                    return {
                        foundEmpty: true
                    };
                }
                if (point.team !== team) {
                    break;
                }
                x++;
                point.isChecked = true;
            }
            x--;
            console.log("The rightmost: ", x);
            spans.push({
                x1: spanStart,
                x2: x,
                y: y + dy,
                dy: dy
            });
            if (x > x2 + 1) {
                spans.push({
                    x1: spanStart,
                    x2: x,
                    y: y - dy,
                    dy: -dy
                });
            }
        }
        return {
            spans: spans
        };
    }
    var areaMap = board.map(function (piece) { return piece.isChecked; });
    return {
        isSurrounded: true,
        area: areaMap
    };
}
exports.isAreaSurrounded = isAreaSurrounded;
function findRemovedPieces(game, position, team) {
    var _a;
    var board = getBoard(game);
    if ((_a = board[pointToIndex(position)]) === null || _a === void 0 ? void 0 : _a.team) {
        return {
            isCellUsed: true
        };
    }
    board[pointToIndex(position)] = {
        team: team,
        isChecked: false
    };
    var neighbours = [
        { x: position.x, y: position.y + 1 },
        { x: position.x + 1, y: position.y },
        { x: position.x, y: position.y - 1 },
        { x: position.x - 1, y: position.y }
    ];
    var removedPieces = neighbours
        .map(function (position) { return isAreaSurrounded(board, position); })
        .reduce(function (prev, current) {
        return (current === null || current === void 0 ? void 0 : current.isSurrounded) ?
            prev ?
                current.area.map(function (isRemoved, index) { return isRemoved || prev[index]; })
                :
                    current.area
            :
                prev;
    }, null);
    var isSuicide = isAreaSurrounded(board, position).isSurrounded;
    // Suicide doesn't take place, if some of the enemies pieces are killed
    if (isSuicide && !removedPieces) {
        return {
            isSuicide: true
        };
    }
    return {
        removedPieces: removedPieces
    };
}
exports.findRemovedPieces = findRemovedPieces;
