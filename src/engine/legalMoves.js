import { generateMoves, kingMoves, bishopAttacks, rookAttacks } from "./moveGen.js";
import { PAWN_ATTACKS, KING_ATTACKS, KNIGHT_ATTACKS, BETWEEN } from "./tables.js";
import { files } from "../ui/renderBoard.js";
import { popCount } from "./eval.js";

export function getCheckers(state, color) {
    let kingBb = color === "w" ? state["K"] : state["k"];
    let enemyPawns = color === "w" ? state["p"] : state["P"];
    let enemyKnights = color === "w" ? state["n"] : state["N"];
    let enemyKing = color === "w" ? state["k"] : state["K"];
    let enemyBishops = color === "w" ? state["b"] | state["q"] : state["B"] | state["Q"];
    let enemyRooks = color === "w" ? state["r"] | state["q"] : state["R"] | state["Q"];
    let kingPos = Math.log2(Number(kingBb));
    let enemyColor = color === "w" ? 1 : 0;
    let checkers = 0n;
    let occupancybb =
        state["p"] |
        state["n"] |
        state["b"] |
        state["r"] |
        state["q"] |
        state["k"] |
        state["P"] |
        state["N"] |
        state["B"] |
        state["R"] |
        state["Q"] |
        state["K"];
    checkers |= PAWN_ATTACKS[enemyColor][kingPos] & enemyPawns;
    checkers |= KNIGHT_ATTACKS[kingPos] & enemyKnights;
    checkers |= KING_ATTACKS[kingPos] & enemyKing;
    checkers |= bishopAttacks(kingBb, occupancybb)[0] & enemyBishops;
    checkers |= rookAttacks(kingBb, occupancybb)[0] & enemyRooks;
    return checkers;
}

function isSquareAttacked(sq, enemycolorId, enemyPawns, enemyKnights, enemyBishops, enemyRooks, enemyKing) {
    if (PAWN_ATTACKS[enemycolorId][sq] & enemyPawns) {
        return true;
    }
    if (KNIGHT_ATTACKS[sq] & enemyKnights) {
        return true;
    }
    if (KING_ATTACKS[sq] & enemyKing) {
        return true;
    }
    let occupancybb = enemyPawns | enemyKnights | enemyBishops | enemyRooks | enemyKing;
    if (bishopAttacks(1n << BigInt(sq), occupancybb)[0] & enemyBishops) {
        return true;
    }
    if (rookAttacks(1n << BigInt(sq), occupancybb)[0] & enemyRooks) {
        return true;
    }
    return false;
}

export function generateLegalMoves(state) {
    let legalMoves = [];
    let checkers = getCheckers(state, state.turn);
    let pinned = 0n;
    let kingBb = state.turn === "w" ? state["K"] : state["k"];
    let kingSq = Math.log2(Number(kingBb));
    let fileOffsets = [-1n, 1n, -1n, 1n, -1n, 0n, 0n, 1n];
    let rankOffsets = [-1n, -1n, 1n, 1n, 0n, -1n, 1n, 0n];
    let enemyDiagonalSliders = state.turn === "w" ? state["b"] | state["q"] : state["B"] | state["Q"];
    let enemyLineSliders = state.turn === "w" ? state["r"] | state["q"] : state["R"] | state["Q"];
    let file = BigInt(kingSq) % 8n;
    let rank = BigInt(kingSq) / 8n;
    let friendlybb =
        state.turn === "w"
            ? state["P"] | state["N"] | state["B"] | state["R"] | state["Q"] | state["K"]
            : state["p"] | state["n"] | state["b"] | state["r"] | state["q"] | state["k"];
    let occupancybb =
        state["p"] |
        state["n"] |
        state["b"] |
        state["r"] |
        state["q"] |
        state["k"] |
        state["P"] |
        state["N"] |
        state["B"] |
        state["R"] |
        state["Q"] |
        state["K"];
    for (let i = 0; i < 8; i++) {
        let filedir = fileOffsets[i];
        let rankdir = rankOffsets[i];
        let diagonal = filedir !== 0n && rankdir !== 0n;
        let newFile = file + filedir;
        let newRank = rank + rankdir;
        let sq = newRank * 8n + newFile;
        let blockers = 0;
        let blocker1;
        while (sq >= 0 && sq < 64 && newFile >= 0 && newFile < 8) {
            if (((1n << BigInt(sq)) & occupancybb) !== 0n) {
                blockers += 1;
                if (blockers === 1) {
                    if (((1n << BigInt(sq)) & friendlybb) === 0n) {
                        break;
                    } else {
                        blocker1 = 1n << BigInt(sq);
                    }
                } else if (blockers === 2) {
                    if (
                        (diagonal && ((1n << BigInt(sq)) & enemyDiagonalSliders) !== 0n) ||
                        (!diagonal && ((1n << BigInt(sq)) & enemyLineSliders) !== 0n)
                    ) {
                        pinned |= blocker1;
                        break;
                    }
                }
            }
            newFile += filedir;
            newRank += rankdir;
            sq = newRank * 8n + newFile;
        }
    }
    if (popCount(checkers) > 1) {
        let kingBb = state.turn === "w" ? state["K"] : state["k"];
        for (let move of kingMoves(kingBb, friendlybb)) {
            let start6Mask = BigInt(0b111111);
            let moveStart = move & start6Mask;
            let enemycolorId = state.turn === "w" ? 1 : 0;
            let enemyPawns = state.turn === "w" ? state["p"] : state["P"];
            let enemyKnights = state.turn === "w" ? state["n"] : state["N"];
            let enemyBishops = state.turn === "w" ? state["b"] | state["q"] : state["B"] | state["Q"];
            let enemyRooks = state.turn === "w" ? state["r"] | state["q"] : state["R"] | state["Q"];
            let enemyKing = state.turn === "w" ? state["k"] : state["K"];
            if (!isSquareAttacked(moveStart, enemycolorId, enemyPawns, enemyKnights, enemyBishops, enemyRooks, enemyKing)) {
                legalMoves.push(move);
            }
        }
    } else if (popCount(checkers) === 1) {
        let checkerSq = Math.log2(Number(checkers));
        let enemycolorId = state.turn === "w" ? 1 : 0;
        let enemyPawns = state.turn === "w" ? state["p"] : state["P"];
        let enemyKnights = state.turn === "w" ? state["n"] : state["N"];
        let enemyBishops = state.turn === "w" ? state["b"] | state["q"] : state["B"] | state["Q"];
        let enemyRooks = state.turn === "w" ? state["r"] | state["q"] : state["R"] | state["Q"];
        let enemyKing = state.turn === "w" ? state["k"] : state["K"];
        for (let move of kingMoves(kingBb, friendlybb)) {
            let end6Mask = BigInt(0b111111000000);
            let moveEnd = (move & end6Mask) >> 6n;
            if (!isSquareAttacked(moveEnd, enemycolorId, enemyPawns, enemyKnights, enemyBishops, enemyRooks, enemyKing)) {
                legalMoves.push(move);
            }
        }
        let moves = generateMoves(state, state.turn, false);
        let checker = 1n << BigInt(checkerSq);
        if ((checker & enemyRooks) !== 0n || (checker & enemyBishops) !== 0n) {
            for (let move of moves) {
                let end6Mask = BigInt(0b111111000000);
                let moveEnd = (move & end6Mask) >> 6n;
                let start6Mask = BigInt(0b111111);
                let moveStart = move & start6Mask;
                if (
                    ((1n << moveEnd) & BETWEEN[kingSq][checkerSq]) !== 0n ||
                    (((1n << moveEnd) & checker) !== 0n && ((1n << moveStart) & pinned) === 0n)
                ) {
                    legalMoves.push(move);
                }
            }
        } else {
            for (let move of moves) {
                let end6Mask = BigInt(0b111111000000);
                let moveEnd = (move & end6Mask) >> 6n;
                let start6Mask = BigInt(0b111111);
                let moveStart = move & start6Mask;
                if (((1n << moveEnd) & checker) !== 0n && ((1n << moveStart) & pinned) === 0n) {
                    legalMoves.push(move);
                }
            }
        }
    } else if (popCount(checkers) === 0) {
        for (let move of kingMoves(kingBb, friendlybb)) {
            let end6Mask = BigInt(0b111111000000);
            let moveEnd = (move & end6Mask) >> 6n;
            let enemycolorId = state.turn === "w" ? 1 : 0;
            let enemyPawns = state.turn === "w" ? state["p"] : state["P"];
            let enemyKnights = state.turn === "w" ? state["n"] : state["N"];
            let enemyBishops = state.turn === "w" ? state["b"] | state["q"] : state["B"] | state["Q"];
            let enemyRooks = state.turn === "w" ? state["r"] | state["q"] : state["R"] | state["Q"];
            let enemyKing = state.turn === "w" ? state["k"] : state["K"];
            if (!isSquareAttacked(moveEnd, enemycolorId, enemyPawns, enemyKnights, enemyBishops, enemyRooks, enemyKing)) {
                legalMoves.push(move);
            }
        }
        let moves = generateMoves(state, state.turn, false);
        for (let move of moves) {
            let start6Mask = BigInt(0b111111);
            let moveStart = move & start6Mask;
            if (((1n << moveStart) & pinned) === 0n) {
                legalMoves.push(move);
            }
        }
    }
    return legalMoves;
}

export function move(move, state) {
    let pieces = ["P", "N", "B", "R", "Q", "K", "p", "n", "b", "r", "q", "k"];
    let castlingObj = { 4484: 327n, 4228: 192n, 8124: 3967n, 7868: 3832n };
    state["cacherights"].push(state["castling"]);
    state["cacheep"].push(state["enpassant"]);
    state.movelist.push(move);
    let start6Mask = BigInt(0b111111);
    let moveStart = move & start6Mask;
    let target6Mask = start6Mask << 6n;
    let moveTarget = (move & target6Mask) >> 6n;
    let flag = 0n;
    let castlingflag = false;
    let epFlag = false;
    let doublePushFlag = false;
    const flagObj = { 4: "Q", 5: "N", 6: "R", 7: "B" };
    if (move > 4096n) {
        flag = (move & (BigInt(0b1111) << 12n)) >> 12n;
        switch (flag) {
            case 1n:
                castlingflag = true;
                flag = 0n;
                break;
            case 2n:
                epFlag = true;
                flag = 0n;
                break;
            case 3n:
                doublePushFlag = true;
                flag = 0n;
                break;
        }
    }
    let pawn = false;
    let capture = null;
    let movedPiece;
    let turn = state["turn"];
    for (let piece of pieces) {
        let bb = state[piece];
        if (((1n << moveStart) & bb) !== 0n) {
            movedPiece = piece;
        } else if (((1n << moveTarget) & bb) !== 0n) {
            capture = piece;
        }
    }
    state[movedPiece] &= ~(1n << moveStart);
    if (flag === 0n) {
        state[movedPiece] |= 1n << moveTarget;
    }
    if (movedPiece === "p" || movedPiece === "P") {
        pawn = true;
    }
    if (capture) {
        state[capture] &= ~(1n << moveTarget);
    }
    if (castlingflag) {
        let rook = turn === "w" ? "R" : "r";
        let castleMove = `${move}`;
        let rookMove = castlingObj[castleMove];
        let rookStart = rookMove & start6Mask;
        let rookTarget = (rookMove & target6Mask) >> 6n;
        state[rook] &= ~(1n << rookStart);
        state[rook] |= 1n << rookTarget;
    }
    if (flag > 3n) {
        let flagStr = `${flag}`;
        let flagPiece = flagObj[flagStr];
        let objPiece = turn === "b" ? flagPiece.toLowerCase() : flagPiece;
        state[objPiece] |= 1n << moveTarget;
    }
    if (epFlag) {
        if (turn === "w") {
            state["p"] &= ~(1n << (moveTarget - 8n));
        } else {
            state["P"] &= ~(1n << (moveTarget + 8n));
        }
    }
    if (doublePushFlag) {
        state["enpassant"] = files[(move & BigInt(0b111111)) % 8n];
    } else {
        state["enpassant"] = null;
    }
    state["turn"] = state["turn"] === "w" ? "b" : "w";
    return [capture, state, pawn, movedPiece];
}

export function unMove(move, state, capture, movedPiece) {
    state["turn"] = state["turn"] === "w" ? "b" : "w";
    let castlingObj = { 4484: 327n, 4228: 192n, 8124: 3967n, 7868: 3832n };
    let start6Mask = BigInt(0b111111);
    let moveStart = move & start6Mask;
    let target6Mask = start6Mask << 6n;
    let moveTarget = (move & target6Mask) >> 6n;
    let flag = 0n;
    let castlingFlag = false;
    let epFlag = false;
    if (move > 4096n) {
        flag = (move & (BigInt(0b1111) << 12n)) >> 12n;
        if (flag === 1n) {
            castlingFlag = true;
            flag = 0n;
        }
        if (flag === 2n) {
            epFlag = true;
            flag = 0n;
        }
        if (flag < 4n) {
            flag = 0n;
        }
    }
    let turn = state["turn"];
    state[movedPiece] &= ~(1n << moveTarget);
    if (flag === 0n) {
        state[movedPiece] |= 1n << moveStart;
    } else {
        let promPiece = turn === "w" ? "P" : "p";
        state[promPiece] |= 1n << moveStart;
    }
    if (capture) {
        state[capture] |= 1n << moveTarget;
    }
    if (flag > 0n) {
        const flagObj = { 4: "Q", 5: "N", 6: "R", 7: "B" };
        let piece = flagObj[`${flag}`];
        let promoted = turn === "b" ? piece.toLowerCase() : piece;
        state[promoted] &= ~(1n << moveTarget);
    }

    if (castlingFlag) {
        let rook = turn === "w" ? "R" : "r";
        let rookMove = castlingObj[`${move}`];
        let rookStart = rookMove & start6Mask;
        let rookTarget = (rookMove & target6Mask) >> 6n;
        state[rook] &= ~(1n << rookTarget);
        state[rook] |= 1n << rookStart;
    }
    if (epFlag) {
        if (turn === "w") {
            state["p"] |= 1n << (moveTarget - 8n);
        } else {
            state["P"] |= 1n << (moveTarget + 8n);
        }
    }
    state["enpassant"] = state["cacheep"].pop();
    state["castling"] = state["cacherights"].pop();
    state.movelist.pop();
    return state;
}
