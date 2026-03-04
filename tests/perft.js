import { fenParse } from "../src/engine/fenParse.js";
import { checkMoves, move, unMove } from "../src/engine/legalMoves.js";
import { moveString } from "../src/ui/clicks.js";
import { files } from "../src/ui/renderBoard.js";

function perftTest(fen, depth, s, fi, tm, tm2) {
    if (depth === 0) {
        return 1;
    }
    let state;
    if (!s) {
        state = fenParse(fen);
    } else {
        state = s;
    }
    let moves = checkMoves(state);
    let numPos = 0;
    for (let i = 0; i < moves.length; i++) {
        let testmove = moves[i];
        let myArray = move(testmove, state);
        let capture = myArray[0];
        let moved = myArray[3]
        let numPostest = perftTest(null, depth - 1, state, false, testmove, tm);
        numPos += numPostest;
        if (fi) {
            console.log(`NumPos after move ${moveString(testmove)}: ${numPostest} at depth ${depth}`);
        }
        unMove(testmove, state, capture, moved);
    }
    return numPos;
}

console.time("perftTest");
let numPos = perftTest("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1 ", 5, null, true, null);
console.timeEnd("perftTest");
console.log(`Number of positions: ${numPos}`);
