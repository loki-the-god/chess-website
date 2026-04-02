import { generateLegalMoves } from "./legalMoves.js";
import { bitScan } from "./moveGen.js";
import { PAWN_ATTACKS } from "./tables.js";

let pawnTableStart = [
    0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, -30, -30, 10, 10, 10, 10, 10, -40, -20, -20, -30, 10, 10, 0, 0, 0, 40, 40, 0, 0, 0, 10, 10, 20, 60,
    60, 20, 0, 0, 30, 30, 30, 50, 50, 30, 30, 30, 70, 70, 70, 70, 70, 70, 70, 70, 0, 0, 0, 0, 0, 0, 0, 0,
];
let pawnTableEnd = [
    0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 20, 20, 20, 20, 20, 20, 20, 20, 30, 30, 30, 30,
    30, 30, 30, 30, 60, 60, 60, 40, 40, 60, 60, 60, 80, 80, 80, 50, 50, 80, 80, 80, 0, 0, 0, 0, 0, 0, 0, 0,
];
let knightTable = [
    -100, -70, -50, -60, -70, -10, -70, -100, -50, -70, -30, 0, 0, -40, -70, -50, -50, -10, 20, 0, 0, 30, 20, -50, -40, 0, 20, 40, 40, 30,
    0, -20, -40, 30, 10, 50, 50, 50, 50, 0, -50, 0, 40, 70, 70, 40, 0, -50, -70, -70, 0, -10, -10, 0, -70, -70, -100, -70, -20, -20, -20,
    -20, -70, -100,
];
let bishopTable = [
    -50, -30, -30, -30, -30, -30, -30, -50, -20, 30, 0, -10, 0, -20, 30, -30, 20, 10, -10, 20, 30, -10, 10, -10, 0, 0, 40, 40, 40, 40, 0, 0,
    -10, 40, 0, 40, 40, 0, 40, -10, -10, 0, 0, 60, 60, 10, -10, -10, -20, 10, 10, 10, 10, 10, 10, -20, -50, -30, -30, -30, -30, -30, -30,
    -50,
];
let rookTable = [
    0, 0, 0, 0, 0, 0, 0, 0, -20, 0, 0, 0, 0, 0, 0, -20, -20, 0, 0, 0, 0, 0, 0, -20, -20, 0, 0, 0, 0, 0, 0, -20, -20, 0, 0, 0, 0, 0, 0, -20,
    -20, 0, 0, 0, 0, 0, 0, -20, 10, 30, 30, 30, 30, 30, 30, 10, -20, 0, 0, 0, 0, 0, 0, -20,
];
let queenTable = [
    0, -10, -10, -10, 0, -20, -20, -10, -10, 0, 20, 30, 40, -10, -10, -10, -20, 20, -10, 30, 0, 30, 10, -20, 10, -10, 0, 50, 50, 0, 20, 10,
    -20, 0, -10, 50, 50, 10, 10, 30, -20, -10, 0, 30, 30, 0, -10, -20, -20, -10, 0, 0, 0, 0, -10, -20, -30, -20, -10, -10, -10, -10, -20,
    -30,
];
let kingTableStart = [
    30, 40, 40, -10, -10, -20, 40, 30, 0, 0, 0, -20, -20, -20, 0, 0, -30, -30, -30, -50, -50, -30, -30, -30, -40, -40, -40, -100, -100, -40,
    -40, -40, -40, -40, -40, -100, -100, -40, -40, -40, -40, -40, -40, -150, -150, -40, -40, -40, -50, -50, -50, -180, -180, -50, -50, -50,
    -60, -60, -60, -200, -200, -60, -60, -60,
];
let kingTableEnd = [
    -50, -40, -40, -20, -20, -40, -40, -50, -40, -20, -20, 0, 0, -20, -20, -20, -40, -10, 10, 30, 30, 10, -10, -40, -20, 0, 30, 50, 50, 30,
    0, -20, -10, 10, 30, 50, 50, 30, 10, -10, -40, -10, 10, 30, 30, 10, -10, -40, -40, -20, -20, 0, 0, -20, -20, -20, -50, -40, -40, -20,
    -20, -40, -40, -50,
];

let pieceValues = [100, 300, 320, 500, 900, 10000];
let tables = [knightTable, bishopTable, rookTable, queenTable];
let otherTables = [
    [pawnTableStart, pawnTableEnd],
    [kingTableStart, kingTableEnd],
];
let pieces = ["P", "N", "B", "R", "Q", "K"];

export function evaluate(state) {
    let endgameWeight = 1 - popCount(state.occupancybb) / 32;
    let evaluation = countMaterial(state, "w", endgameWeight) - countMaterial(state, "b", endgameWeight);
    let perspective = state.turn === "w" ? 1 : -1;
    return evaluation * perspective;
}

function countMaterial(state, color, ew) {
    let material = 0;
    for (let i = 0; i < pieceValues.length; i++) {
        let piece = pieces[i];
        let value = pieceValues[i];
        let statePiece = color === "w" ? piece : piece.toLowerCase();
        let bb = state[statePiece];
        while (bb) {
            let lsb = bb & -bb;
            let sq = bitScan(lsb);
            let filesq = sq % 8;
            let ranksq = Math.floor(sq / 8);
            let tablesq = color === "w" ? (7 - ranksq) * 8 + filesq : ranksq * 8 + (7 - filesq);
            let tableval;
            if (piece !== "P" && piece !== "K") {
                tableval = tables[i - 1][tablesq];
            } else {
                let tableidx = i % 2;
                tableval = otherTables[tableidx][0][tablesq] * (1 - ew) + otherTables[tableidx][1][tablesq] * ew;
            }
            material += value + tableval;
            bb &= bb - 1n;
        }
    }
    return material;
}

export function orderMoves(state, onlyCaptures = false) {
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
    for (let testmove of generateLegalMoves(state, true)) {
        let pieceVal;
        let moveVal = 0;
        let moveStart = testmove & start6Mask;
        let moveEnd = (testmove & end6Mask) >> 6n;
        let moveFlag = (testmove & (BigInt(0b1111) << 12n)) >> 12n;
        for (let piece of pieces) {
            if (((1n << moveStart) & state[piece]) !== 0n) {
                pieceVal = pieceValues[pieces.indexOf(piece)];
            }
            if (((1n << moveEnd) & enemyBb) !== 0n) {
                let captureVal = 0;
                for (let piece of oppPieces) {
                    if (((1n << moveEnd) & state[piece]) !== 0n) {
                        captureVal = 10 * pieceValues[oppPieces.indexOf(piece)];
                    }
                }
                moveVal += captureVal - pieceVal;
            }
            if (moveFlag > 3n) {
                moveVal += pieceValues[proms.indexOf(moveFlag)];
            }
            moves[testmove] = moveVal;
        }
    }
    if (!onlyCaptures) {
        for (let testmove of generateLegalMoves(state, false)) {
            if (moves[testmove]) {
                continue;
            }
            let pieceVal;
            let moveVal = 0;
            let moveEnd = (testmove & end6Mask) >> 6n;
            let moveFlag = (testmove & (BigInt(0b1111) << 12n)) >> 12n;
            if (moveFlag > 3n) {
                moveVal += pieceValues[proms.indexOf(moveFlag)];
            }
            if ((PAWN_ATTACKS[friendlycolorId][Number(moveEnd)] & enemyPawns) !== 0n) {
                moveVal -= pieceVal;
            }

            moves[testmove] = moveVal;
        }
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
