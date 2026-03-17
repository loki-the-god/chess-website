export function evaluate(state) {
    let evaluation = countMaterial(state, "w") - countMaterial(state, "b");
    let perspective = state.turn === "w" ? 1 : -1;
    return evaluation * perspective;
}

function countMaterial(state, color) {
    let pieces = ["P", "N", "B", "R", "Q"];
    let pieceValues = [100, 300, 320, 500, 900];
    let material = 0;
    for (let i = 0; i < pieceValues.length; i++) {
        let piece = pieces[i];
        let value = pieceValues[i];
        let statePiece = color === "w" ? piece : piece.toLowerCase();
        if (state[statePiece] === 0n) {
            continue;
        }
        let pieceCount = popCount(state[statePiece]);
        material += value * pieceCount;
    }
    return material;
}

function popCount(bb) {
    let count = 0;
    while (bb) {
        bb &= bb - 1n;
        count++;
    }
    return count;
}
