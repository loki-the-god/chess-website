import { fenParse } from "../engine/fenParse.js";
import { clearLists, getClicks, addMove, clearEvents } from "./clicks.js";
import { displayBoard, renderState, files } from "./renderBoard.js";
import { generateLegalMoves, move, getCheckers } from "../engine/legalMoves.js";
import { iterativeDeepening } from "../engine/search.js";
import { initTables } from "../engine/tables.js";
import { popCount } from "../engine/eval.js";

export let gameplay = "analysis";
export let playerTurn = null;

export const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
let cacheTurn = null;

export function start() {
    let state = fenParse(startFen);
    initTables();
    displayBoard(state["turn"]);
    renderState(state);
    getClicks(state, false);
    document.getElementById("play").addEventListener("click", playConfig);
    document.getElementById("black").addEventListener("click", blackConfig);
    document.getElementById("start").addEventListener("click", startGame);
}

function playConfig(e) {
    let element = e.currentTarget;
    gameplay = "play";
    playerTurn = !cacheTurn ? "w" : cacheTurn;
    element.removeEventListener("click", playConfig);
    displayBoard(playerTurn);
    let analysis = document.getElementById("analysis");
    analysis.classList.remove("border-b-2", "border-b-purple-600");
    analysis.classList.add("border-none");
    analysis.addEventListener("click", analysisConfig);
    element.classList.add("border-b-2", "border-b-purple-600");
    element.classList.remove("border-none");
    document.getElementById("white-moves").innerHTML = "";
    document.getElementById("black-moves").innerHTML = "";
    clearLists();
    renderState(fenParse(startFen));
    document.getElementById("result").innerHTML = "";
    document.getElementById("vs-computer").classList.remove("hidden");
}

function analysisConfig(e) {
    gameplay = "analysis";
    cacheTurn = playerTurn;
    playerTurn = null;
    let element = e.currentTarget;
    element.removeEventListener("click", analysisConfig);
    let play = document.getElementById("play");
    play.classList.remove("border-b-2", "border-b-purple-600");
    play.classList.add("border-none");
    play.addEventListener("click", playConfig);
    element.classList.add("border-b-2", "border-b-purple-600");
    element.classList.remove("border-none");
    document.getElementById("white-moves").innerHTML = "";
    document.getElementById("black-moves").innerHTML = "";
    clearLists();
    let state = fenParse(startFen);
    renderState(state);
    getClicks(state, false);
    document.getElementById("result").innerHTML = "";
    document.getElementById("vs-computer").classList.add("hidden");
}

function blackConfig(e) {
    let element = e.currentTarget;
    playerTurn = "b";
    displayBoard(playerTurn);
    element.removeEventListener("click", blackConfig);
    element.classList.add("border-b-2", "border-b-purple-600");
    element.classList.remove("border-none");
    let white = document.getElementById("white");
    white.classList.remove("border-b-2", "border-b-purple-600");
    white.classList.add("border-none");
    white.addEventListener("click", whiteConfig);
    document.getElementById("white-moves").innerHTML = "";
    document.getElementById("black-moves").innerHTML = "";
    clearLists();
    renderState(fenParse(startFen));
    document.getElementById("result").innerHTML = "";
}

function whiteConfig(e) {
    let element = e.currentTarget;
    playerTurn = "w";
    displayBoard(playerTurn);
    element.removeEventListener("click", whiteConfig);
    element.classList.add("border-b-2", "border-b-purple-600");
    element.classList.remove("border-none");
    let black = document.getElementById("black");
    black.classList.remove("border-b-2", "border-b-purple-600");
    black.classList.add("border-none");
    black.addEventListener("click", blackConfig);
    document.getElementById("white-moves").innerHTML = "";
    document.getElementById("black-moves").innerHTML = "";
    clearLists();
    renderState(fenParse(startFen));
    document.getElementById("result").innerHTML = "";
}

function startGame() {
    let state = fenParse(startFen);
    renderState(state);
    document.getElementById("result").innerHTML = "";
    document.getElementById("white-moves").innerHTML = "";
    document.getElementById("black-moves").innerHTML = "";
    document.getElementById("choose").classList.add("hidden");
    if (playerTurn === state["turn"]) {
        getClicks(state, true);
    } else {
        setTimeout(() => computerMove(state), 0);
    }
}

export function computerMove(state) {
    let legalMoves = generateLegalMoves(state);
    if (legalMoves.length !== 0) {
        let moveToMake = iterativeDeepening(100, 2000, state, -Infinity, Infinity);
        let myArray = move(moveToMake, state);
        addMove(moveToMake, myArray[0], myArray[3], state);
        renderState(state);
        getClicks(state, true);
    } else {
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                let square = document.getElementById(`${files[file]}${rank + 1}`);
                clearEvents(square);
                if (square.children.length > 1) {
                    square.removeChild(square.children[1]);
                }
            }
        }
        let result;
        if (popCount(getCheckers(state, state["turn"])) === 0) {
            result = "1/2-1/2";
        } else {
            result = state["turn"] === "b" ? "1-0" : "0-1";
        }
        document.getElementById("result").innerHTML += `<p>RESULT: ${result}</p>`;
        if (result !== "1/2-1/2") {
            document.getElementById("result").innerHTML += "<p>You beat the computer!</p>";
        }
        document.getElementById("choose").classList.remove("hidden");
    }
}
