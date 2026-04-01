import { displayBoard, files, renderState } from "./renderBoard.js";
import { generateLegalMoves, move, unMove, getCheckers } from "../engine/legalMoves.js";
import { computerMove } from "./game.js";
import { getImageURL } from "../utils/importImage.js";
import { popCount } from "../engine/eval.js";

let moves = [];
let numMoves = [];
let captures = [];
let movedPieces = [];
export let index = -1;

export function clearLists() {
    moves = [];
    numMoves = [];
    captures = [];
    movedPieces = [];
    index = -1;
}

function clearHighlights() {
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            let square = document.getElementById(`${files[file]}${rank + 1}`);
            if (square.classList.contains("bg-violet-900")) {
                square.classList.remove("bg-violet-900");
                square.classList.add("bg-yellow-800");
            } else {
                square.classList.remove("bg-violet-500");
                square.classList.add("bg-orange-300");
            }
            square.removeEventListener("click", movePiece);
            square.removeEventListener("click", handlePromotion);
            if (square.children.length > 1) {
                square.removeChild(square.children[1]);
            } else if (square.children.length === 1) {
                if (square.children[0].classList.contains("bg-indigo-400")) {
                    square.removeChild(square.children[0]);
                }
            }
        }
    }
}
function numberToSquare(number) {
    let rank = number / 8n;
    let numFile = number % 8n;
    let file = files[numFile];
    return `${file}${rank + 1n}`;
}
function squareToNumber(square) {
    let fileStr = square[0];
    let rank = parseInt(square[1]) - 1;
    let file = files.indexOf(fileStr);
    return rank * 8 + file;
}
export function moveString(move, piece, capture) {
    let start6Mask = BigInt(0b111111);
    let moveStart = move & start6Mask;
    let target6Mask = start6Mask << 6n;
    let moveTarget = (move & target6Mask) >> 6n;
    let moveFlag = (move & (start6Mask << 12n)) >> 12n;
    let pieceMove = "";
    if (piece.toLowerCase() !== "p") {
        pieceMove = piece.toUpperCase();
        if (capture) {
            pieceMove += "x";
        }
    } else if (capture) {
        pieceMove = `${numberToSquare(moveStart)[0]}x`;
    }
    const flagObj = { 4: "Q", 5: "N", 6: "R", 7: "B" };
    if (moveFlag > 3n) {
        let flag = flagObj[`${moveFlag}`];
        return `${pieceMove}${numberToSquare(moveTarget)}=${flag.toUpperCase()}`;
    }
    else if (moveFlag === 1n) {
        let moveStr = [4484n, 8124n].includes(move) ? "0-0" : "0-0-0";
        return moveStr;
    } else if (moveFlag === 2n) {
        return `${numberToSquare(moveStart)[0]}x${numberToSquare(moveTarget)}`;
    }
    else {
        return `${pieceMove}${numberToSquare(moveTarget)}`;
    }
}
function addHighlights(e) {
    clearHighlights();
    let element = e.currentTarget;
    let game = element.game;
    element.classList.add(element.dataset.square === "dark" ? "bg-violet-900" : "bg-violet-500");
    element.classList.remove(element.dataset.square === "dark" ? "bg-yellow-800" : "bg-orange-300");
    let square = element.id;
    let proms = [];
    let promMoves = [];
    let numberSquare = squareToNumber(square);
    for (let i = 0; i < element.legalMoves.length; i++) {
        let move = element.legalMoves[i];
        if (move > 16384n) {
            let moveNoFlag = move & BigInt(0b111111111111);
            if (!proms.includes(moveNoFlag)) {
                proms.push(moveNoFlag);
                promMoves.push([move]);
            } else {
                promMoves[promMoves.length - 1].push(move);
            }
        } else {
            let last6Mask = BigInt(0b111111);
            let moveStart = move & last6Mask;
            if (BigInt(numberSquare) === moveStart) {
                let target = (move >> 6n) & last6Mask;
                let targetSquare = numberToSquare(target);
                let targetElement = document.getElementById(targetSquare);
                targetElement.startSquare = element;
                targetElement.state = element.state;
                targetElement.classList.add(targetElement.dataset.square === "dark" ? "bg-violet-900" : "bg-violet-500");
                targetElement.classList.remove(targetElement.dataset.square === "dark" ? "bg-yellow-800" : "bg-orange-300");
                targetElement.move = move;
                targetElement.prom = false;
                targetElement.game = game;
                targetElement.removeEventListener("click", clearHighlights);
                targetElement.addEventListener("click", movePiece);
            }
        }
    }
    for (let i = 0; i < proms.length; i++) {
        let last6Mask = BigInt(0b111111);
        let moveNoFlag = proms[i];
        let promMove = promMoves[i];
        let moveStart = moveNoFlag & last6Mask;
        if (BigInt(numberSquare) === moveStart) {
            let target = (moveNoFlag >> 6n) & last6Mask;
            let targetSquare = numberToSquare(target);
            let targetElement = document.getElementById(targetSquare);
            targetElement.startSquare = element;
            targetElement.state = element.state;
            targetElement.classList.add(targetElement.dataset.square === "dark" ? "bg-violet-900" : "bg-violet-500");
            targetElement.classList.remove(targetElement.dataset.square === "dark" ? "bg-yellow-800" : "bg-orange-300");
            targetElement.moveNoFlag = moveNoFlag;
            targetElement.move = promMove;
            targetElement.game = game;
            targetElement.addEventListener("click", handlePromotion);
            targetElement.removeEventListener("click", clearHighlights);
        }
    }
}

export function getClicks(state, game) {
    let brd = document.getElementById("board");
    document.body.brd = brd;
    brd.state = state;
    if (index >= 0 && !game) {
        brd.move = moves[index];
        if (!brd._hasSwitchListeners) {
            document.body.addEventListener("keydown", switchMoves);
            brd._hasSwitchListeners = true;
        }
    }
    if (!brd._hasFlipListener && !game) {
        document.body.addEventListener("keydown", flipBoard);
        brd._hasFlipListener = true;
    }
    if (game) {
        brd._hasFlipListener = false;
        brd._hasSwitchListeners = false;
        document.body.removeEventListener("keydown", switchMoves);
        document.body.removeEventListener("keydown", flipBoard);
    }
    if (!brd.perspective) {
        brd.perspective = "w";
    }
    let turn = state["turn"];
    let square;
    let color;
    let legalMoves = generateLegalMoves(state);
    if (legalMoves.length === 0) {
        let result;
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                let square = document.getElementById(`${files[file]}${rank + 1}`);
                square.removeEventListener("click", addHighlights);
                square.removeEventListener("click", clearHighlights);
                square.removeEventListener("click", movePiece);
                square.removeEventListener("click", handlePromotion);
                if (square.children.length > 1) {
                    square.removeChild(square.children[1]);
                }
            }
        }
        if (popCount(getCheckers(state, state["turn"])) === 0) {
            result = "1/2-1/2";
        } else {
            result = turn === "w" ? "0-1" : "1-0";
        }
        document.getElementById("result").innerHTML += `<p>RESULT: ${result}</p>`;
        if (game && result !== "1/2-1/2") {
            document.getElementById("result").innerHTML += "<p>You lost... How embarassing...</p>";
        }
        if (game) {
            document.getElementById("choose").classList.remove("hidden");
        }
    } else if (state["fifty"] >= 100) {
        document.getElementById("result").innerHTML = `<p>RESULT: 1/2-1/2</p>`;
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                let square = document.getElementById(`${files[file]}${rank + 1}`);
                if (square.children.length > 1) {
                    square.removeChild(square.children[1]);
                }
            }
        }
        if (game) {
            document.getElementById("choose").classList.remove("hidden");
        }
    } else {
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                square = document.getElementById(`${files[file]}${rank + 1}`);
                square.removeEventListener("click", addHighlights);
                square.removeEventListener("click", clearHighlights);
                square.removeEventListener("click", movePiece);
                square.removeEventListener("click", handlePromotion);
                if (square.children.length > 1) {
                    square.removeChild(square.children[1]);
                }
                if (square.innerHTML) {
                    color = square.children[0].dataset.color;
                    if (color === turn) {
                        square.classList.add("cursor-pointer");
                        square.legalMoves = legalMoves;
                        square.state = state;
                        square.game = game;
                        square.addEventListener("click", addHighlights);
                    } else {
                        square.addEventListener("click", clearHighlights);
                    }
                } else {
                    square.addEventListener("click", clearHighlights);
                    if (square.classList.contains("cursor-pointer")) {
                        square.classList.remove("cursor-pointer");
                    }
                }
            }
        }
    }
}

export function addMove(move, capture, moved, state) {
    numMoves.push(move);
    moves.push(moveString(move, moved, capture));
    captures.push(capture);
    movedPieces.push(moved);
    let li = document.createElement("li");
    li.innerHTML = moveString(move, moved, capture);
    li.classList.add("border-2", "border-white", "bg-sky-900", "text-white", "pr-0.5", "pl-0.5", "flex", "justify-center", "w-18");
    if (state.turn === "w") {
        document.getElementById("black-moves").appendChild(li);
    } else {
        document.getElementById("white-moves").appendChild(li);
    }
    index += 1;
}

function movePiece(e) {
    let targetSquare = e.currentTarget;
    let game = targetSquare.game;
    clearHighlights();
    let state = targetSquare.state;
    let myList = move(targetSquare.move, state);
    let capture = myList[0];
    let pawn = myList[2];
    addMove(targetSquare.move, capture, myList[3], state);
    renderState(state);
    state["nextturn"] += 1;
    if (capture || pawn) {
        state["fifty"] = 0;
    } else {
        state["fifty"] += 1;
    }
    if (game) {
        setTimeout(() => computerMove(state), 0);
    } else {
        getClicks(state);
    }
}

function flipBoard(e) {
    let key = e.key;
    let board = e.currentTarget.brd;
    if (key === "f") {
        let state = board.state;
        let perspective = board.perspective;
        board.perspective = perspective === "w" ? "b" : "w";
        displayBoard(board.perspective);
        renderState(state);
        getClicks(state);
    }
}

function switchMoves(e) {
    let key = e.key;
    let board = e.currentTarget.brd;
    let state = board.state;
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            let square = document.getElementById(`${files[file]}${rank + 1}`);
            square.removeEventListener("click", addHighlights);
            square.removeEventListener("click", clearHighlights);
            square.removeEventListener("click", movePiece);
            square.removeAttribute("style");
        }
    }
    if (key === "ArrowUp") {
        for (let i = index; i > -1; i--) {
            let lastMove = numMoves[i];
            state = unMove(lastMove, state, captures[i], movedPieces[i]);
            index -= 1;
        }
        renderState(state);
    } else if (key === "ArrowDown") {
        for (let i = index + 1; i < numMoves.length; i++) {
            let lastMove = numMoves[i];
            state = move(lastMove, state)[1];
            index += 1;
        }
        renderState(state);
    } else if (key === "ArrowLeft") {
        if (index !== -1) {
            let lastMove = numMoves[index];
            state = unMove(lastMove, state, captures[index], movedPieces[index]);
            index -= 1;
        }
        renderState(state);
    } else if (key === "ArrowRight") {
        if (index < numMoves.length - 1) {
            let lastMove = numMoves[index + 1];
            state = move(lastMove, state)[1];
            index += 1;
        }
        renderState(state);
    }
    if (index === numMoves.length - 1) {
        getClicks(state);
    }
}

function handlePromotion(e) {
    let targetProm = e.currentTarget;
    clearHighlights();
    let state = targetProm.state;
    let turn = state["turn"];
    let file = targetProm.id[0];
    let rank = targetProm.id[1];
    let pos = rank === "8" ? [`${file}8`, `${file}7`, `${file}6`, `${file}5`] : [`${file}1`, `${file}2`, `${file}3`, `${file}4`];
    let pieces = ["queen", "knight", "rook", "bishop"];
    for (let i = 0; i < 4; i++) {
        let square = document.getElementById(pos[i]);
        let src = getImageURL(`/assets/${turn}_${pieces[i]}.png`);
        square.innerHTML += `<button class="bg-indigo-400 border-none size-16 flex items-center justify-center absolute rounded-4xl group hover:bg-orange-700 hover:rounded-none transition-all duration-100"><img class="size-12 group-hover:size-16 transition-all duration-100" src="${src}"></button>`;
        let promButton = square.children[square.children.length - 1];
        promButton.move = targetProm.move[i];
        promButton.state = state;
        promButton.prom = true;
        promButton.game = targetProm.game;
        promButton.addEventListener("click", movePiece);
    }
}

export function clearEvents(square) {
    square.removeEventListener("click", addHighlights);
    square.removeEventListener("click", clearHighlights);
    square.removeEventListener("click", movePiece);
    square.removeEventListener("click", handlePromotion);
}
