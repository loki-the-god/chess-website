import { generateMoves } from "./moveGen.js";
import { files } from "../ui/renderBoard.js";

export function generateLegalMoves(state) {
    let moves = generateMoves(state, state["turn"], true);
    let legalMoves = [];
    let kingLetter = state["turn"] === "w" ? "K" : "k";
    let startKingPos = BigInt(Math.round(Math.log2(Number(state[kingLetter]))));
    let otherKingLetter = state["turn"] === "b" ? "K" : "k";
    let otherKingPos = BigInt(Math.round(Math.log2(Number(state[otherKingLetter]))));
    state["turn"] = state["turn"] === "w" ? "b" : "w";
    let check = inCheck(startKingPos, generateMoves(state, state["turn"]));
    state["turn"] = state["turn"] === "w" ? "b" : "w";
    if (state["castling"] > 0) {
        if (
            ((startKingPos === 4n && state["turn"] === "w") || (otherKingPos === 4n && state["turn"] === "b")) &&
            (state["castling"] & 12) !== 0
        ) {
            if ((state["R"] & 1n) === 0n && (state["castling"] & 4) !== 0) {
                state["castling"] &= ~4;
            }
            if ((state["R"] & (1n << 7n)) === 0n && (state["castling"] & 8) !== 0) {
                state["castling"] &= ~8;
            }
        } else {
            state["rights"] &= 3;
        }
        if (
            ((startKingPos === 60n && state["turn"] === "b") || (otherKingPos === 60n && state["turn"] === "w")) &&
            (state["castling"] & 3) !== 0
        ) {
            if ((state["r"] & (1n << 56n)) === 0n && (state["castling"] & 1) !== 0) {
                state["castling"] &= ~1;
            }
            if ((state["r"] & (1n << 63n)) === 0n && (state["castling"] & 2) !== 0) {
                state["castling"] &= ~2;
            }
        } else {
            state["castling"] &= 12;
        }
    }
    let allBb =
        state["P"] | state["N"] | state["B"] | state["R"] | state["Q"] | state["p"] | state["n"] | state["b"] | state["r"] | state["q"];
    for (let i = 0; i < moves.length; i++) {
        let moveTest = moves[i];
        let [capture, newState, _, pieceMoved] = move(moveTest, state);
        let opponentMoves = generateMoves(newState, newState["turn"]);
        let moveValid;
        if (newState[kingLetter] === 0n) {
            moveValid = false;
        } else {
            let kingPos = BigInt(Math.round(Math.log2(Number(newState[kingLetter]))));
            moveValid = !inCheck(kingPos, opponentMoves);
        }
        state = unMove(moveTest, newState, capture, pieceMoved);
        if (moveValid) {
            legalMoves.push(moveTest);
            if (!check) {
                if (state["turn"] === "w") {
                    if ((state["castling"] & 8) !== 0 && moveTest === 324n && (allBb & (1n << 6n)) === 0n && (allBb & (1n << 5n)) === 0n) {
                        let castlingTest = 388n;
                        let [newcapture, newnewState, _, newpieceMoved] = move(castlingTest, state);
                        if (structuredClone(newnewState)[kingLetter] !== 0n) {
                            let newkingPos = BigInt(Math.round(Math.log(Number(newnewState[kingLetter])) / Math.log(2)));
                            let oppMoves = generateMoves(newnewState, newnewState["turn"]);
                            let castleValid = !inCheck(newkingPos, oppMoves);
                            state = unMove(castlingTest, newnewState, newcapture, newpieceMoved);
                            if (castleValid) {
                                legalMoves.push(4484n);
                            }
                        } else {
                            state = unMove(castlingTest, newnewState, newcapture, newpieceMoved);
                        }
                    }
                    if (
                        (state["castling"] & 4) !== 0 &&
                        moveTest === 196n &&
                        (allBb & (1n << 2n)) === 0n &&
                        (allBb & (1n << 1n)) === 0n &&
                        (allBb & (1n << 3n)) === 0n
                    ) {
                        let castlingTest = 132n;
                        [capture, newState, _, pieceMoved] = move(castlingTest, state);
                        if (structuredClone(newState)[kingLetter] !== 0n) {
                            let kingPos = BigInt(Math.round(Math.log(Number(newState[kingLetter])) / Math.log(2)));
                            let oppMoves = generateMoves(newState, newState["turn"]);
                            let castleValid = !inCheck(kingPos, oppMoves);
                            state = unMove(castlingTest, newState, capture, pieceMoved);

                            if (castleValid) {
                                legalMoves.push(4228n);
                            }
                        } else {
                            state = unMove(castlingTest, newnewState, newcapture, newpieceMoved);
                        }
                    }
                } else {
                    if (
                        (state["castling"] & 2) !== 0 &&
                        moveTest === 3964n &&
                        (allBb & (1n << 62n)) === 0n &&
                        (allBb & (1n << 61n)) === 0n
                    ) {
                        let castlingTest = 4028n;
                        [capture, newState, _, pieceMoved] = move(castlingTest, state);
                        if (structuredClone(newState)[kingLetter] !== 0n) {
                            let kingPos = BigInt(Math.round(Math.log(Number(newState[kingLetter])) / Math.log(2)));
                            let oppMoves = generateMoves(newState, newState["turn"]);
                            let castleValid = !inCheck(kingPos, oppMoves);
                            state = unMove(castlingTest, newState, capture, pieceMoved);
                            if (castleValid) {
                                legalMoves.push(8124n);
                            }
                        } else {
                            state = unMove(castlingTest, newnewState, newcapture, newpieceMoved);
                        }
                    }
                    if (
                        (state["castling"] & 1) !== 0 &&
                        moveTest === 3836n &&
                        (allBb & (1n << 58n)) === 0n &&
                        (allBb & (1n << 57n)) === 0n &&
                        (allBb & (1n << 59n)) === 0n
                    ) {
                        let castlingTest = 3772n;
                        [capture, newState, _, pieceMoved] = move(castlingTest, state);
                        if (structuredClone(newState)[kingLetter] !== 0n) {
                            let kingPos = BigInt(Math.round(Math.log(Number(newState[kingLetter])) / Math.log(2)));
                            let oppMoves = generateMoves(newState, newState["turn"]);
                            let castleValid = !inCheck(kingPos, oppMoves);
                            state = unMove(castlingTest, newState, capture, pieceMoved);
                            if (castleValid) {
                                legalMoves.push(7868n);
                            }
                        } else {
                            state = unMove(castlingTest, newnewState, newcapture, newpieceMoved);
                        }
                    }
                }
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

export function inCheck(king, moves) {
    let check = false;
    for (let j = 0; j < moves.length; j++) {
        let oppMoveTest = moves[j];
        let target6Mask = BigInt(0b111111000000);
        let oppMoveTarget = (oppMoveTest & target6Mask) >> 6n;
        if (oppMoveTarget === king) {
            check = true;
            break;
        }
    }
    return check;
}
