import { files } from "../ui/renderBoard.js";

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
    let colorIndice = color === "w" ? 1n : -1n;
    for (let i = 0; i < 64; i++) {
        if (((1n << BigInt(i)) & bb) !== 0n) {
            if (((1n << (BigInt(i) + colorIndice * 8n)) & enemybb) === 0n && ((1n << (BigInt(i) + colorIndice * 8n)) & friendlybb) === 0n) {
                if ((8n <= BigInt(i) && BigInt(i) <= 15n && color === "b") || (48n <= BigInt(i) && BigInt(i) <= 55n && color === "w")) {
                    let promMove = BigInt(i) + ((BigInt(i) + colorIndice * 8n) << 6n);
                    const proms = [4n, 5n, 6n, 7n];
                    for (let i = 0; i < 4; i++) {
                        let prom = proms[i];
                        moves.push(promMove + (prom << 12n));
                    }
                } else {
                    moves.push(BigInt(i) + ((BigInt(i) + colorIndice * 8n) << 6n));
                }
                if ((8n <= BigInt(i) && BigInt(i) <= 15n && color === "w") || (48n <= BigInt(i) && BigInt(i) <= 55n && color === "b")) {
                    if (
                        ((1n << (BigInt(i) + 16n * colorIndice)) & enemybb) === 0n &&
                        ((1n << (BigInt(i) + colorIndice * 16n)) & friendlybb) === 0n
                    ) {
                        moves.push(BigInt(i) + ((BigInt(i) + 16n * colorIndice) << 6n) + (3n << 12n));
                    }
                }
            }
            if (
                ((1n << (BigInt(i) + colorIndice * 7n)) & enemybb) !== 0n &&
                !((i % 8 === 0 && color === "w") || (i % 8 === 7 && color === "b"))
            ) {
                if ((8n <= BigInt(i) && BigInt(i) <= 15n && color === "b") || (48n <= BigInt(i) && BigInt(i) <= 55n && color === "w")) {
                    let promMove = BigInt(i) + ((BigInt(i) + colorIndice * 7n) << 6n);
                    const proms = [4n, 5n, 6n, 7n];
                    for (let i = 0; i < 4; i++) {
                        let prom = proms[i];
                        moves.push(promMove + (prom << 12n));
                    }
                } else {
                    moves.push(BigInt(i) + ((BigInt(i) + colorIndice * 7n) << 6n));
                }
            }
            if (
                ((1n << (BigInt(i) + colorIndice * 9n)) & enemybb) !== 0n &&
                !((i % 8 === 7 && color === "w") || (i % 8 === 0 && color === "b"))
            ) {
                if ((8n <= BigInt(i) && BigInt(i) <= 15n && color === "b") || (48n <= BigInt(i) && BigInt(i) <= 55n && color === "w")) {
                    let promMove = BigInt(i) + ((BigInt(i) + colorIndice * 9n) << 6n);
                    const proms = [4n, 5n, 6n, 7n];
                    for (let i = 0; i < 4; i++) {
                        let prom = proms[i];
                        moves.push(promMove + (prom << 12n));
                    }
                } else {
                    moves.push(BigInt(i) + ((BigInt(i) + colorIndice * 9n) << 6n));
                }
            }
            if (enpassant) {
                let file = files.indexOf(enpassant);
                let rank = color === "w" ? 4 : 3;
                let square = file + rank * 8;
                if (file > 0 && i === square - 1) {
                    let moveindice = color === "w" ? 9n : 7n;
                    moves.push(BigInt(i) + ((BigInt(i) + colorIndice * moveindice) << 6n) + (2n << 12n));
                }
                if (file < 7 && i === square + 1) {
                    let moveindice = color === "b" ? 9n : 7n;
                    moves.push(BigInt(i) + ((BigInt(i) + colorIndice * moveindice) << 6n) + (2n << 12n));
                }
            }
        }
    }
    return moves;
}

function knightMoves(bb, friendlybb) {
    let moves = [];
    const offsets = [-17n, -15n, -10n, -6n, 6n, 10n, 15n, 17n];
    const fileOffsets = [-1n, 1n, -2n, 2n, -2n, 2n, -1n, 1n];
    const rankOffsets = [-2n, -2n, -1n, -1n, 1n, 1n, 2n, 2n];
    for (let i = 0; i < 64; i++) {
        if (((1n << BigInt(i)) & bb) !== 0n) {
            for (let off = 0; off < offsets.length; off++) {
                let offset = offsets[off];
                let dirFile = fileOffsets[off];
                let dirRank = rankOffsets[off];
                let file = BigInt(i % 8);
                let targetFile = file + dirFile;
                let rank = BigInt(i) / 8n;
                let targetRank = rank + dirRank;
                let targetSquare = targetRank * 8n + targetFile;
                if (
                    0n <= targetFile &&
                    targetFile < 8n &&
                    0n <= targetRank &&
                    targetRank < 8n &&
                    ((1n << targetSquare) & friendlybb) === 0n
                ) {
                    moves.push(BigInt(i) + ((BigInt(i) + offset) << 6n));
                }
            }
        }
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
    const offsets = [-9n, -8n, -7n, -1n, 1n, 7n, 8n, 9n];
    const fileOffsets = [-1n, 0n, 1n, -1n, 1n, -1n, 0n, 1n];
    const rankOffsets = [-1n, -1n, -1n, 0n, 0n, 1n, 1n, 1n];
    for (let i = 0; i < 64; i++) {
        if (((1n << BigInt(i)) & bb) !== 0n) {
            for (let off = 0; off < offsets.length; off++) {
                let offset = offsets[off];
                let dirFile = fileOffsets[off];
                let dirRank = rankOffsets[off];
                let file = BigInt(i % 8);
                let targetFile = file + dirFile;
                let rank = BigInt(i) / 8n;
                let targetRank = rank + dirRank;
                let targetSquare = targetRank * 8n + targetFile;
                if (
                    0n <= targetFile &&
                    targetFile < 8n &&
                    0n <= targetRank &&
                    targetRank < 8n &&
                    ((1n << targetSquare) & friendlybb) === 0n
                ) {
                    moves.push(BigInt(i) + ((BigInt(i) + offset) << 6n));
                }
            }
        }
    }
    return moves;
}
