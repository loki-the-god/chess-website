import { evaluate, popCount, orderMoves } from "./eval.js";
import { getCheckers, move, unMove } from "./legalMoves.js";

export let shouldStop = false;
export let bestMoveSoFar = null;
let movesOrdered = {};
let stopTime = 0;
function startTimer(ms) {
    shouldStop = false;
    stopTime = Date.now() + ms;
}

function checkTime() {
    if (Date.now() >= stopTime) {
        shouldStop = true;
    }
}

function searchRoot(state, depth, alpha, beta, moves = null) {
    let evaluation;
    let movesCheck;
    if (!moves) {
        movesCheck = orderMoves(state);
    } else {
        movesCheck = moves;
    }
    bestMoveSoFar = orderMoves(state)[0];
    for (let testmove of movesCheck) {
        if (shouldStop) {
            break;
        }
        let moveArray = move(testmove, state);
        let capture = moveArray[0];
        let moved = moveArray[3];
        evaluation = -search(state, depth - 1, -beta, -alpha)[0];
        movesOrdered[testmove] = evaluation;
        unMove(testmove, state, capture, moved);
        if (evaluation >= beta) {
            return evaluation;
        }
        if (evaluation > alpha) {
            alpha = evaluation;
            bestMoveSoFar = testmove;
        }
        if (shouldStop) {
            break;
        }
    }
    return evaluation;
}
function search(state, depth, alpha, beta, moves = null) {
    if (depth === 0) {
        return searchAllCaptures(state, alpha, beta);
    }
    let movesCheck;
    if (!moves) {
        movesCheck = orderMoves(state);
    } else {
        movesCheck = moves;
    }
    let bestMove = movesCheck[0];
    if (movesCheck.length === 0) {
        if (popCount(getCheckers(state, state["turn"])) === 0) {
            return [0, state.movelist[state.movelist.length - 1]];
        } else {
            return [-1000000 - depth * 100, state.movelist[state.movelist.length - 1]];
        }
    }
    for (let testmove of movesCheck) {
        checkTime();
        if (shouldStop) {
            break;
        }
        let moveArray = move(testmove, state);
        let capture = moveArray[0];
        let moved = moveArray[3];
        let evaluation = -search(state, depth - 1, -beta, -alpha)[0];
        unMove(testmove, state, capture, moved);
        if (evaluation >= beta) {
            return [evaluation, testmove];
        }
        if (evaluation > alpha) {
            alpha = evaluation;
            bestMove = testmove;
        }
        if (shouldStop) {
            break;
        }
    }
    return [alpha, bestMove];
}

function searchAllCaptures(state, alpha, beta) {
    let evaluation = evaluate(state);
    let moves = orderMoves(state, true);
    let bestMove = moves[0];
    if (evaluation >= beta) {
        return [evaluation, bestMove];
    }
    if (evaluation > alpha) {
        alpha = evaluation;
        bestMove = null;
    }
    for (let testmove of moves) {
        checkTime();
        if (shouldStop) {
            return [alpha, null];
        }
        let moveArray = move(testmove, state);
        let capture = moveArray[0];
        let moved = moveArray[3];
        evaluation = -searchAllCaptures(state, -beta, -alpha)[0];
        unMove(testmove, state, capture, moved);
        if (evaluation >= beta) {
            return [evaluation, testmove];
        }
        if (evaluation > alpha) {
            alpha = evaluation;
            bestMove = testmove;
        }
        if (shouldStop) {
            break;
        }
    }
    return [alpha, bestMove];
}

export function iterativeDeepening(maxDepth, timer, state, alpha, beta) {
    movesOrdered = {};
    let bestCompletedMove = null;
    startTimer(timer);
    for (let depth = 1; depth <= maxDepth; depth++) {
        bestMoveSoFar = bestCompletedMove;
        let moves =
            depth === 1
                ? null
                : Object.entries(movesOrdered)
                        .sort(([, valA], [, valB]) => valB - valA)
                        .map(([key]) => BigInt(key));
        searchRoot(state, depth, alpha, beta, moves);
        if (shouldStop) {
            console.log(depth);
            break;
        } else {
        bestCompletedMove = bestMoveSoFar;}
    }
    return bestCompletedMove;
}
