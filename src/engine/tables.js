export let PAWN_ATTACKS = [new Array(64), new Array(64)];
export let KNIGHT_ATTACKS = new Array(64);
export let KING_ATTACKS = new Array(64);
export let BETWEEN = Array.from({ length: 64 }, () => Array(64).fill(0));
export let LINE = Array.from({ length: 64 }, () => Array(64).fill(0));
export const NOT_FILE_A_MASK = 0xfefefefefefefefen;
export const NOT_FILE_H_MASK = 0x7f7f7f7f7f7f7f7fn;
export const NOT_FILES_AB_MASK = 0xfcfcfcfcfcfcfcfcn;
export const NOT_FILES_GH_MASK = 0x3f3f3f3f3f3f3f3fn;
export const NOT_RANK_1_MASK = 0xffffffffffffff00n;
export const NOT_RANK_8_MASK = 0x00ffffffffffffffn;
export const RANK_2_MASK = 0xff00n;
export const RANK_7_MASK = 0xff000000000000n;
export const NOT_RANKS_12_MASK = 0xffffffffffff0000n;
export const NOT_RANKS_78_MASK = 0x0000ffffffffffffn;

export function initTables() {
    for (let i = 0; i < 64; i++) {
        let sq = 1n << BigInt(i);
        PAWN_ATTACKS[0][i] = ((sq & NOT_FILE_A_MASK) << 7n) | ((sq & NOT_FILE_H_MASK) << 9n) | (sq & NOT_RANK_8_MASK);
        PAWN_ATTACKS[1][i] = ((sq & NOT_FILE_A_MASK) >> 9n) | ((sq & NOT_FILE_H_MASK) >> 7n) | (sq & NOT_RANK_1_MASK);
        KNIGHT_ATTACKS[i] =
            ((sq & NOT_RANKS_12_MASK & NOT_FILE_A_MASK) >> 17n) |
            ((sq & NOT_RANKS_12_MASK & NOT_FILE_H_MASK) >> 15n) |
            ((sq & NOT_RANK_1_MASK & NOT_FILES_AB_MASK) >> 10n) |
            ((sq & NOT_RANK_1_MASK & NOT_FILES_GH_MASK) >> 6n) |
            ((sq & NOT_RANK_8_MASK & NOT_FILES_AB_MASK) << 6n) |
            ((sq & NOT_RANK_8_MASK & NOT_FILES_GH_MASK) << 10n) |
            ((sq & NOT_RANKS_78_MASK & NOT_FILE_A_MASK) << 15n) |
            ((sq & NOT_RANKS_78_MASK & NOT_FILE_H_MASK) << 17n);
        KING_ATTACKS[i] =
            ((sq & NOT_RANK_1_MASK & NOT_FILE_A_MASK) >> 9n) |
            ((sq & NOT_RANK_1_MASK) >> 8n) |
            ((sq & NOT_RANK_1_MASK & NOT_FILE_H_MASK) >> 7n) |
            ((sq & NOT_FILE_A_MASK) >> 1n) |
            ((sq & NOT_FILE_H_MASK) << 1n) |
            ((sq & NOT_RANK_8_MASK & NOT_FILE_A_MASK) << 7n) |
            ((sq & NOT_RANK_8_MASK) << 8n) |
            ((sq & NOT_RANK_8_MASK & NOT_FILE_H_MASK) << 9n);
        for (let j = 0; j < 64; j++) {
            let bij = 0n;
            let lij = 0n;
            let ifile = i % 8;
            let jfile = j % 8;
            let irank = Math.floor(i / 8);
            let jrank = Math.floor(j / 8);
            let dir;
            if (j === i) {
                continue;
            }
            if (ifile === jfile) {
                dir = i < j ? 8 : -8;
            } else if (irank === jrank) {
                dir = i < j ? 1 : -1;
            } else if (Math.abs(j - i) % 7 === 0) {
                dir = i < j ? 7 : -7;
            } else if (Math.abs(j-i) % 9 === 0 && (jfile - ifile === jrank - irank)){
                dir = i < j ? 9 : -9;
            } else { continue; }
            let sq = i + dir;
            while (sq !== j) {
                bij |= 1n << BigInt(sq);
                sq += dir;
            }
            sq = i + dir;
            let filedir = dir % 8;
            let filesq = sq % 8;
            lij |= 1n << BigInt(i);
            while (sq >= 0 && sq < 64 && filesq >= 0 && filesq < 8) {
                lij |= 1n << BigInt(sq);
                sq += dir;
                filesq += filedir;
            }
            sq = i - dir;
            filesq = sq % 8;
            while (sq >= 0 && sq < 64 && filesq >= 0 && filesq < 8) {
                lij |= 1n << BigInt(sq);
                sq -= dir;
                filesq -= filedir;
            }
            BETWEEN[i][j] = bij;
            LINE[i][j] = lij;
        }
    }
}

initTables();