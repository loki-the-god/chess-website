export let files = ["a", "b", "c", "d", "e", "f", "g", "h"];

import bp from "../assets/b_pawn.png";
import wp from "../assets/w_pawn.png";
import bn from "../assets/b_knight.png";
import wn from "../assets/w_knight.png";
import bb from "../assets/b_bishop.png";
import wb from "../assets/w_bishop.png";
import br from "../assets/b_rook.png";
import wr from "../assets/w_rook.png";
import bq from "../assets/b_queen.png";
import wq from "../assets/w_queen.png";
import bk from "../assets/b_king.png";
import wk from "../assets/w_king.png";

export let pieces = {"b_pawn": bp, "w_pawn": wp, "b_knight": bn, "w_knight": wn, "b_bishop": bb, "w_bishop": wb, "b_rook": br, "w_rook": wr, "b_queen": bq, "w_queen": wq, "b_king": bk, "w_king": wk};

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
            brd.innerHTML += `<button class="${colorClass} size-full aspect-square border-none flex items-center justify-center relative" id="${files[uiFile]}${uiRank + 1}" data-square="${color}" aria-live="polite" aria-label="square-${files[uiFile]}${uiRank + 1}"></button>`;
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
                    let coolor = color === "w" ? "white" : "black";
                    let src = pieces[`${color}_${pieceMap[piece.toLowerCase()]}`];
                    square.innerHTML = `<img class="w-full h-full object-contain" src="${src}" data-color="${color}" alt="${coolor}-${pieceMap[piece.toLowerCase()]}">`;
                    break;
                }
            }
        }
    }
}
