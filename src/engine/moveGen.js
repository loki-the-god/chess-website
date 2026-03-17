import { files } from "../ui/renderBoard.js";
import { KING_ATTACKS, KNIGHT_ATTACKS, PAWN_ATTACKS, RANK_2_MASK, RANK_7_MASK, NOT_FILE_A_MASK, NOT_FILE_H_MASK } from "./attacks.js";

export function generateMoves(state, color) {
    let enemybb;
    let friendlybb;
    let moves = [];
    let pawn;
    let knight;
    let bishop;
    let rook;
    let queen;
    let king;
    if (color === "b") {
        friendlybb = state["p"] | state["n"] | state["b"] | state["r"] | state["q"] | state["k"];
        enemybb = state["P"] | state["N"] | state["B"] | state["R"] | state["Q"] | state["K"];
        pawn = pawnMoves(state["p"], color, enemybb, friendlybb, state["enpassant"]);
        knight = knightMoves(state["n"], friendlybb);
        bishop = bishopMoves(state["b"], friendlybb, enemybb);
        rook = rookMoves(state["r"], friendlybb, enemybb);
        queen = queenMoves(state["q"], friendlybb, enemybb);
        king = kingMoves(state["k"], friendlybb);
    } else {
        friendlybb = state["P"] | state["N"] | state["B"] | state["R"] | state["Q"] | state["K"];
        enemybb = state["p"] | state["n"] | state["b"] | state["r"] | state["q"] | state["k"];
        pawn = pawnMoves(state["P"], color, enemybb, friendlybb, state["enpassant"]);
        knight = knightMoves(state["N"], friendlybb);
        bishop = bishopMoves(state["B"], friendlybb, enemybb);
        rook = rookMoves(state["R"], friendlybb, enemybb);
        queen = queenMoves(state["Q"], friendlybb, enemybb);
        king = kingMoves(state["K"], friendlybb);
    }
    moves = [...pawn, ...knight, ...bishop, ...rook, ...queen, ...king];
    return moves;
}

function pawnMoves(bb, color, enemybb, friendlybb, enpassant) {
    let moves = [];
    while (bb) {
        let lsb = bb & -bb;
        let sq = Math.log2(Number(lsb));
        let colorIndex = color === "w" ? 0 : 1;
        let attackbb = PAWN_ATTACKS[colorIndex][sq] & ~friendlybb;
        while (attackbb) {
            let attacklsb = attackbb & -attackbb;
            if ((attacklsb & enemybb) !== 0n) {
                let targetsq = Math.log2(Number(attacklsb));
                if (((RANK_7_MASK & lsb) !== 0n && color === "w") || ((RANK_2_MASK & lsb) !== 0n && color === "b")) {
                    for (let i = 4n; i < 8n; i++) {
                        moves.push((BigInt(targetsq) << 6n) + BigInt(sq) + (i << 12n));
                    }
                } else {
                    moves.push((BigInt(targetsq) << 6n) + BigInt(sq));
                }
            }
            attackbb ^= attacklsb;
        }
        let colorIndice = color === "w" ? 1n : -1n;
        let targetsq = BigInt(sq) + 8n * colorIndice;
        if (((1n << targetsq) & (enemybb | friendlybb)) === 0n) {
            if (((RANK_7_MASK & lsb) !== 0n && color === "w") || ((RANK_2_MASK & lsb) !== 0n && color === "b")) {
                for (let i = 4n; i < 8n; i++) {
                    moves.push((BigInt(targetsq) << 6n) + BigInt(sq) + (i << 12n));
                }
            } else {
                moves.push((BigInt(targetsq) << 6n) + BigInt(sq));
                if (((RANK_7_MASK & lsb) !== 0n && color === "b") || ((RANK_2_MASK & lsb) !== 0n && color === "w")) {
                    let pushTarget = BigInt(sq) + 16n * colorIndice;
                    if (((1n << pushTarget) & (enemybb | friendlybb)) === 0n) {
                        moves.push((BigInt(pushTarget) << 6n) + BigInt(sq) + (3n << 12n));
                    }
                }
            }
        }
        if (enpassant) {
            let epRank = color === "w" ? 4n : 3n;
            let epsq = epRank * 8n + BigInt(files.indexOf(enpassant));
            let epTarget = epsq + 8n * colorIndice;
            if (
                (BigInt(sq + 1) === epsq && ((1n << BigInt(sq)) & NOT_FILE_H_MASK) !== 0n) ||
                (BigInt(sq - 1) === epsq && ((1n << BigInt(sq)) & NOT_FILE_A_MASK) !== 0n)
            ) {
                moves.push((epTarget << 6n) + BigInt(sq) + (2n << 12n));
            }
        }
        bb ^= lsb;
    }
    return moves;
}

function knightMoves(bb, friendlybb) {
    let moves = [];
    while (bb) {
        let lsb = bb & -bb;
        let sq = Math.log2(Number(lsb));
        let attackbb = KNIGHT_ATTACKS[sq] & ~friendlybb;
        while (attackbb) {
            let attacklsb = attackbb & -attackbb;
            let targetsq = Math.log2(Number(attacklsb));
            moves.push((BigInt(targetsq) << 6n) + BigInt(sq));
            attackbb ^= attacklsb;
        }
        bb ^= lsb;
    }
    return moves;
}
function bishopMoves(bb, friendlybb, enemybb) {
    let fileOffsets = [-1n, 1n, -1n, 1n];
    let rankOffsets = [-1n, -1n, 1n, 1n];
    return slidingPieces(bb, fileOffsets, rankOffsets, friendlybb, enemybb);
}
function rookMoves(bb, friendlybb, enemybb) {
    let fileOffsets = [-1n, 0n, 0n, 1n];
    let rankOffsets = [0n, -1n, 1n, 0n];
    return slidingPieces(bb, fileOffsets, rankOffsets, friendlybb, enemybb);
}
function queenMoves(bb, friendlybb, enemybb) {
    let bishop = bishopMoves(bb, friendlybb, enemybb);
    let rook = rookMoves(bb, friendlybb, enemybb);
    return [...bishop, ...rook];
}

function slidingPieces(bb, files, ranks, friendlybb, enemybb) {
    let moves = [];
    for (let i = 0; i < 64; i++) {
        if (((1n << BigInt(i)) & bb) !== 0n) {
            for (let dir = 0; dir < files.length; dir++) {
                let file = BigInt(i % 8);
                let rank = BigInt(i) / 8n;
                let dirFile = files[dir];
                let dirRank = ranks[dir];
                let loopFile = dirFile < 0n ? file : 7n - file * dirFile;
                let loopRank = dirRank < 0n ? rank : 7n - rank * dirRank;
                let newFile = file;
                let newRank = rank;
                let newSquare;
                for (let sq = 0; sq < Math.min(Number(loopFile), Number(loopRank)); sq++) {
                    newFile += dirFile;
                    newRank += dirRank;
                    newSquare = newRank * 8n + newFile;
                    if (((1n << BigInt(newSquare)) & friendlybb) === 0n) {
                        moves.push(BigInt(i) + (newSquare << 6n));
                        if (((1n << BigInt(newSquare)) & enemybb) !== 0n) {
                            break;
                        }
                    } else {
                        break;
                    }
                }
            }
        }
    }
    return moves;
}

function kingMoves(bb, friendlybb) {
    let moves = [];
    while (bb) {
        let lsb = bb & -bb;
        let sq = Math.log2(Number(lsb));
        let attackbb = KING_ATTACKS[sq] & ~friendlybb;
        while (attackbb) {
            let attacklsb = attackbb & -attackbb;
            let targetsq = Math.log2(Number(attacklsb));
            moves.push((BigInt(targetsq) << 6n) + BigInt(sq));
            attackbb ^= attacklsb;
        }
        bb ^= lsb;
    }
    return moves;
}
