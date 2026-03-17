import { evaluate } from "./eval.js";
import { generateLegalMoves, inCheck, move, unMove } from "./legalMoves.js";

export function search(state, depth, alpha, beta) {
    if (depth === 0) {
        return [evaluate(state), null];
    }
    let moves = generateLegalMoves(state);
    let bestMove = moves[0];
    if (moves.length === 0) {
        let kingLetter = state["turn"] === "w" ? "K" : "k";
        let kingPos = BigInt(Math.round(Math.log(Number(state[kingLetter])) / Math.log(2)));
        state["turn"] = state["turn"] === "w" ? "b" : "w";
        let oppMoves = generateLegalMoves(state);
        state["turn"] = state["turn"] === "w" ? "b" : "w";
        if (!inCheck(kingPos, oppMoves)) {
            return [0, state.movelist[state.movelist.length - 1]];
        } else {
            return [-1000000 - depth * 100, state.movelist[state.movelist.length - 1]];
        }
    }
    for (let testmove of moves) {
        let moveArray = move(testmove, state);
        let capture = moveArray[0];
        let moved = moveArray[3];
        let evaluation = -(search(state, depth - 1, -beta, -alpha)[0]);
        unMove(testmove, state, capture, moved);
        if (evaluation >= beta) {
            return [evaluation, testmove];
        }
        if (evaluation > alpha) {
            alpha = evaluation;
            bestMove = testmove;
        }
    }
    return [alpha, bestMove];
}
