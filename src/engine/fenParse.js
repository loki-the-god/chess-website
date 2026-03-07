export function fenParse(fen) {
    let rank = 7;
    let file = 0;
    let boardState = {
        P: 0n,
        p: 0n,
        N: 0n,
        n: 0n,
        B: 0n,
        b: 0n,
        R: 0n,
        r: 0n,
        Q: 0n,
        q: 0n,
        K: 0n,
        k: 0n,
        turn: null,
        castling: 0,
        enpassant: null,
        fifty: 0,
        nextturn: 0,
        cacherights: [],
        cacheep: [],
    };
    let flags = [];
    let char;
    for (let x = 0; x < fen.length; x++) {
        char = fen[x];
        if (char === "/" || (char === " " && rank === 0)) {
            rank -= 1;
            file = 0;
        } else if (!isNaN(char) && rank !== -1) {
            file += parseInt(char);
        } else {
            if (rank === -1) {
                if (char !== " ") {
                    flags.push(char);
                }
            } else {
                let pos = file + rank * 8;
                boardState[char] += BigInt(2 ** pos);
            }
            file += 1;
        }
    }
    for (let index = 0; index < flags.length; index++) {
        if (index === 0) {
            boardState["turn"] = flags[index];
        } else if (index === 1) {
            if (flags[index] !== "-") {
                while (true) {
                    char = flags[index];
                    if (!"kq".includes(char.toLowerCase())) {
                        break;
                    }
                    if (char === char.toLowerCase()) {
                        boardState["castling"] += char === "k" ? 2 : 1;
                    } else {
                        boardState["castling"] += char === "K" ? 8 : 4;
                    }
                    index++;
                }
            }
        } else {
            if ("abcdefgh".includes(char)) {
                boardState["enpassant"] = char;
                index++;
            }
        }
    }
    boardState["fifty"] = parseInt(flags[flags.length - 2]);
    boardState["nextturn"] = parseInt(flags[flags.length - 1]);
    return boardState;
}
