import { initTables } from "../src/engine/tables.js";
import { fenParse } from "../src/engine/fenParse.js";
import { generateLegalMoves, move, unMove } from "../src/engine/legalMoves.js";
import { moveString } from "../src/ui/clicks.js";
import { describe, test, expect } from "vitest";

function perftTest(fen, depth, s, fi) {
    if (depth === 0) {
        return 1;
    }
    let state;
    if (!s) {
        state = fenParse(fen);
    } else {
        state = s;
    }
    let moves = generateLegalMoves(state);
    let numPos = 0;
    for (let i = 0; i < moves.length; i++) {
        let testmove = moves[i];
        let myArray = move(testmove, state);
        let capture = myArray[0];
        let moved = myArray[3];
        let numPostest = perftTest(null, depth - 1, state, false);
        numPos += numPostest;
        if (fi) {
            console.log(`NumPos after move ${moveString(testmove)}: ${numPostest} at depth ${depth}`);
        }
        unMove(testmove, state, capture, moved);
    }
    return numPos;
}

initTables();
describe("perft test suite", () => {
    test("perft 1 depth 1", () => {
        expect(perftTest("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ", 1, undefined, false)).toBe(48);
    });
    test("perft 1 depth 2", () => {
        expect(perftTest("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ", 2, undefined, false)).toBe(2039);
    });
    test("perft 1 depth 3", () => {
        expect(perftTest("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ", 3, undefined, false)).toBe(97862);
    });
    test("perft 1 depth 4", () => {
        expect(perftTest("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ", 4, undefined, false)).toBe(4085603);
    }, 2000000);
    test("perft 2 depth 1", () => {
        expect(perftTest("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1 ", 1, undefined, false)).toBe(14);
    });
    test("perft 2 depth 2", () => {
        expect(perftTest("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1 ", 2, undefined, false)).toBe(191);
    });
    test("perft 2 depth 3", () => {
        expect(perftTest("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1 ", 3, undefined, false)).toBe(2812);
    });
    test("perft 2 depth 4", () => {
        expect(perftTest("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1 ", 4, undefined, false)).toBe(43238);
    });
    test("perft 2 depth 5", () => {
        expect(perftTest("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1 ", 5, undefined, false)).toBe(674624);
    }, 120000);
    test("perft 3 depth 1", () => {
        expect(perftTest("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", 1, undefined, false)).toBe(6);
    });
    test("perft 3 depth 2", () => {
        expect(perftTest("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", 2, undefined, false)).toBe(264);
    });
    test("perft 3 depth 3", () => {
        expect(perftTest("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", 3, undefined, false)).toBe(9467);
    });
    test("perft 3 depth 4", () => {
        expect(perftTest("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", 4, undefined, false)).toBe(422333);
    }, 120000);
    test("perft 4 depth 1", () => {
        expect(perftTest("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", 1, undefined, false)).toBe(44);
    });
    test("perft 4 depth 2", () => {
        expect(perftTest("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", 2, undefined, false)).toBe(1486);
    });
    test("perft 4 depth 3", () => {
        expect(perftTest("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", 3, undefined, false)).toBe(62379);
    });
    test("perft 4 depth 4", () => {
        expect(perftTest("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", 4, undefined, false)).toBe(2103487);
    }, 120000);
    test("perft 5 depth 1", () => {
        expect(perftTest("r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10", 1, undefined, false)).toBe(46);
    });
    test("perft 5 depth 2", () => {
        expect(perftTest("r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10", 2, undefined, false)).toBe(2079);
    });
    test("perft 5 depth 3", () => {
        expect(perftTest("r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10", 3, undefined, false)).toBe(89890);
    });
});
