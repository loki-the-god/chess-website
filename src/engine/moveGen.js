import { files } from "../ui/renderBoard.js";
import { KING_ATTACKS, KNIGHT_ATTACKS, PAWN_ATTACKS, RANK_2_MASK, RANK_7_MASK, NOT_FILE_A_MASK, NOT_FILE_H_MASK } from "./tables.js";

export function generateMoves(state, color, genking, onlyCaptures = false) {
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
        pawn = pawnMoves(state["p"], color, enemybb, friendlybb, state["enpassant"], onlyCaptures);
        knight = knightMoves(state["n"], friendlybb, enemybb, onlyCaptures);
        bishop = bishopMoves(state["b"], friendlybb, enemybb, onlyCaptures);
        rook = rookMoves(state["r"], friendlybb, enemybb, onlyCaptures);
        queen = queenMoves(state["q"], friendlybb, enemybb, onlyCaptures);
        king = kingMoves(state["k"], friendlybb, enemybb, onlyCaptures);
    } else {
        friendlybb = state["P"] | state["N"] | state["B"] | state["R"] | state["Q"] | state["K"];
        enemybb = state["p"] | state["n"] | state["b"] | state["r"] | state["q"] | state["k"];
        pawn = pawnMoves(state["P"], color, enemybb, friendlybb, state["enpassant"], onlyCaptures);
        knight = knightMoves(state["N"], friendlybb, enemybb, onlyCaptures);
        bishop = bishopMoves(state["B"], friendlybb, enemybb, onlyCaptures);
        rook = rookMoves(state["R"], friendlybb, enemybb, onlyCaptures);
        queen = queenMoves(state["Q"], friendlybb, enemybb, onlyCaptures);
        king = kingMoves(state["K"], friendlybb, enemybb, onlyCaptures);
    }
    if (genking) {
        moves = [...pawn, ...knight, ...bishop, ...rook, ...queen, ...king];
    } else {
        moves = [...pawn, ...knight, ...bishop, ...rook, ...queen];
    }
    return moves;
}

function pawnMoves(bb, color, enemybb, friendlybb, enpassant, onlyCaptures = false) {
    let moves = [];
    while (bb) {
        let lsb = bb & -bb;
        let sq = bitScan(lsb);
        let colorIndex = color === "w" ? 0 : 1;
        let attackbb = PAWN_ATTACKS[colorIndex][sq] & ~friendlybb;
        while (attackbb) {
            let attacklsb = attackbb & -attackbb;
            if ((attacklsb & enemybb) !== 0n) {
                let targetsq = bitScan(attacklsb);
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
        if (!onlyCaptures) {
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

function knightMoves(bb, friendlybb, enemybb, onlyCaptures = false) {
    let moves = [];
    while (bb) {
        let lsb = bb & -bb;
        let sq = bitScan(lsb);
        let attackbb = KNIGHT_ATTACKS[sq] & ~friendlybb;
        while (attackbb) {
            let attacklsb = attackbb & -attackbb;
            let targetsq = bitScan(attacklsb);
            if (((1n << BigInt(targetsq)) & enemybb) !== 0n || (((1n << BigInt(targetsq)) & enemybb) === 0n && !onlyCaptures)) {
                moves.push((BigInt(targetsq) << 6n) + BigInt(sq));
            }
            attackbb ^= attacklsb;
        }
        bb ^= lsb;
    }
    return moves;
}
function bishopMoves(bb, friendlybb, enemybb, onlyCaptures = false) {
    let moves = [];
    let occupancybb = friendlybb | enemybb;
    let attacks_per_bishop = bishopAttacks(bb, occupancybb)[1];
    for (let [bishop, attacks] of Object.entries(attacks_per_bishop)) {
        while (attacks) {
            let lsb = attacks & -attacks;
            let sq = BigInt(bitScan(lsb));
            if (((1n << BigInt(+bishop)) & enemybb) !== 0n || (((1n << BigInt(+bishop)) & enemybb) === 0n && !onlyCaptures)) {
                if (((1n << sq) & friendlybb) === 0n) {
                    moves.push(BigInt(+bishop) + (sq << 6n));
                }
            }
            attacks ^= lsb;
        }
    }
    return moves;
}
function rookMoves(bb, friendlybb, enemybb, onlyCaptures = false) {
    let moves = [];
    let occupancybb = friendlybb | enemybb;
    let attacks_per_rook = rookAttacks(bb, occupancybb)[1];
    for (let [rook, attacks] of Object.entries(attacks_per_rook)) {
        while (attacks) {
            let lsb = attacks & -attacks;
            let sq = BigInt(bitScan(lsb));
            if (((1n << BigInt(+rook)) & enemybb) !== 0n || (((1n << BigInt(+rook)) & enemybb) === 0n && !onlyCaptures)) {
                if (((1n << sq) & friendlybb) === 0n) {
                    moves.push(BigInt(+rook) + (sq << 6n));
                }
            }
            attacks ^= lsb;
        }
    }
    return moves;
}
function queenMoves(bb, friendlybb, enemybb) {
    let bishop = bishopMoves(bb, friendlybb, enemybb);
    let rook = rookMoves(bb, friendlybb, enemybb);
    return [...bishop, ...rook];
}
export function bishopAttacks(bb, occupancybb) {
    let fileOffsets = [-1n, 1n, -1n, 1n];
    let rankOffsets = [-1n, -1n, 1n, 1n];
    return slidingAttacks(bb, fileOffsets, rankOffsets, occupancybb);
}
export function rookAttacks(bb, occupancybb) {
    let fileOffsets = [-1n, 0n, 0n, 1n];
    let rankOffsets = [0n, -1n, 1n, 0n];
    return slidingAttacks(bb, fileOffsets, rankOffsets, occupancybb);
}
function slidingAttacks(bb, files, ranks, occupancybb) {
    let attacks = 0n;
    let attacks_per_piece = {};
    while (bb) {
        let lsb = bb & -bb;
        let sq = bitScan(lsb);
        let p_attacks = 0n;
        for (let dir = 0; dir < files.length; dir++) {
            let file = BigInt(sq % 8);
            let rank = BigInt(sq) / 8n;
            let dirFile = files[dir];
            let dirRank = ranks[dir];
            let newFile = file;
            let newRank = rank;
            let newSquare;
            while (true) {
                newFile += dirFile;
                newRank += dirRank;
                newSquare = newRank * 8n + newFile;
                if (newFile > 7n || newFile < 0n || newRank > 7n || newRank < 0n) {
                    break;
                }
                p_attacks |= 1n << newSquare;
                if (((1n << BigInt(newSquare)) & occupancybb) !== 0n) {
                    break;
                }
            }
        }
        attacks_per_piece[sq.toString()] = p_attacks;
        attacks |= p_attacks;
        bb ^= lsb;
    }
    return [attacks, attacks_per_piece];
}

export function kingMoves(bb, friendlybb, enemybb, onlyCaptures = false) {
    let moves = [];
    while (bb) {
        let lsb = bb & -bb;
        let sq = bitScan(lsb);
        let attackbb = KING_ATTACKS[sq] & ~friendlybb;
        while (attackbb) {
            let attacklsb = attackbb & -attackbb;
            let targetsq = bitScan(attacklsb);
            if (((1n << BigInt(targetsq)) & enemybb) !== 0n || (((1n << BigInt(targetsq)) & enemybb) === 0n && !onlyCaptures)) {
                moves.push((BigInt(targetsq) << 6n) + BigInt(sq));
            }
            attackbb ^= attacklsb;
        }
        bb ^= lsb;
    }
    return moves;
}

const index64 = [
    0, 1, 48, 2, 57, 49, 28, 3, 61, 58, 50, 42, 38, 29, 17, 4, 62, 55, 59, 36, 53, 51, 43, 22, 45, 39, 33, 30, 24, 18, 12, 5, 63, 47,
    56, 27, 60, 41, 37, 16, 54, 35, 52, 21, 44, 32, 23, 11, 46, 26, 40, 15, 34, 20, 31, 10, 25, 14, 19, 9, 13, 8, 7, 6,
];
export function bitScan(bb) {
    const debruijn64 = 285870213051386505n;
    return index64[Number((((bb & -bb) * debruijn64) >> 58n) & 63n)];
}
