import { generateLegalMoves } from "./legalMoves.js";
import { PAWN_ATTACKS } from "./tables.js";

export function evaluate(state) {
    let evaluation = countMaterial(state, "w") - countMaterial(state, "b");
    let perspective = state.turn === "w" ? 1 : -1;
    return evaluation * perspective;
}

function countMaterial(state, color) {
    let pieces = ["P", "N", "B", "R", "Q"];
    let pieceValues = [100, 300, 320, 500, 900];
    let material = 0;
    for (let i = 0; i < pieceValues.length; i++) {
        let piece = pieces[i];
        let value = pieceValues[i];
        let statePiece = color === "w" ? piece : piece.toLowerCase();
        if (state[statePiece] === 0n) {
            continue;
        }
        let pieceCount = popCount(state[statePiece]);
        material += value * pieceCount;
    }
    return material;
}

export function orderMoves(state, onlyCaptures=false) {
    let enemyBb =
        state.turn === "b"
            ? state["P"] | state["N"] | state["B"] | state["R"] | state["Q"]
            : state["p"] | state["n"] | state["b"] | state["r"] | state["q"];
    let pieces = state.turn === "w" ? ["P", "N", "B", "R", "Q", "K"] : ["p", "n", "b", "r", "q", "k"];
    let oppPieces = state.turn === "b" ? ["P", "N", "B", "R", "Q", "K"] : ["p", "n", "b", "r", "q", "k"];
    let enemyPawns = state.turn === "w" ? state["p"] : state["P"];
    let pieceValues = [100, 300, 320, 500, 900, 400];
    let proms = [0n, 5n, 7n, 6n, 4n, 0n];
    let friendlycolorId = state.turn === "w" ? 0 : 1;
    let moves = {};
    let end6Mask = BigInt(0b111111000000);
    let start6Mask = BigInt(0b111111);
    for (let testmove of generateLegalMoves(state, onlyCaptures)) {
        let pieceVal;
        let moveVal = 0;
        let moveStart = testmove & start6Mask;
        let moveEnd = (testmove & end6Mask) >> 6n;
        let moveFlag = (testmove & (BigInt(0b1111) << 12n)) >> 12n;
        for (let piece of Object.keys(state)) {
            if (pieces.includes(piece)) {
                if (((1n << moveStart) & state[piece]) !== 0n) {
                    pieceVal = pieceValues[pieces.indexOf(piece)];
                }
            }
        }
        if (moveFlag > 3n) {
            moveVal += pieceValues[proms.indexOf(moveFlag)];
        }
        if (((1n << moveEnd) & enemyBb) !== 0n) {
            let captureVal = 0;
            for (let piece of Object.keys(state)) {
                if (oppPieces.includes(piece)) {
                    if (((1n << moveEnd) & state[piece]) !== 0n) {
                        captureVal = 10 * pieceValues[oppPieces.indexOf(piece)];
                    }
                }
            }
            moveVal += captureVal - pieceVal;
        }
        if ((PAWN_ATTACKS[friendlycolorId][Number(moveEnd)] & enemyPawns) !== 0n) {
            moveVal -= pieceVal;
        }
        moves[testmove] = moveVal;
    }
    let sortedMoves = Object.entries(moves)
        .sort(([, valA], [, valB]) => valB - valA)
        .map(([key]) => BigInt(key));
    return sortedMoves;
}

export function popCount(bb) {
    let count = 0;
    while (bb) {
        bb &= bb - 1n;
        count++;
    }
    return count;
}
