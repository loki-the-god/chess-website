export let files = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function displayBoard(perspective) {
    let brd = document.getElementById("board");
    brd.innerHTML = "";
    let uiFile;
    let uiRank;
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            let colorClass = (rank + file) % 2 === 1 ? "bg-orange-300" : "bg-yellow-800";
            let color = (rank + file) % 2 === 1 ? "light" : "dark";
            uiFile = perspective === "w" ? file : 7 - file;
            uiRank = perspective === "w" ? rank : 7 - rank;
            brd.innerHTML += `<button class="${colorClass} size-16 border-none flex items-center justify-center relative" id="${files[uiFile]}${uiRank + 1}" data-square="${color}"></button>`;
        }
    }
}

export function renderState(state) {
    let pieceMap = {
        p: "pawn",
        n: "knight",
        b: "bishop",
        r: "rook",
        q: "queen",
        k: "king",
    };
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            let uiFile = files[file];
            let square = document.getElementById(`${uiFile}${rank + 1}`);
            for (const [piece, bb] of Object.entries(state)) {
                if (piece.length > 1) {
                    square.innerHTML = "";
                    break;
                }
                let pos = file + rank * 8;
                if (((1n << BigInt(pos)) & bb) === 1n << BigInt(pos)) {
                    let color = piece.toLowerCase() === piece ? "b" : "w";
                    let src = `assets/${color}_${pieceMap[piece.toLowerCase()]}.png`;
                    square.innerHTML = `<img class="size-16" src="${src}" data-color="${color}">`;
                    break;
                }
            }
        }
    }
}
