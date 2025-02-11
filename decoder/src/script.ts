import { Sequence, Unit, Word } from "./sequence.js";
import { Logger } from "./utils/logger.js";

interface Script {
    alphabet_to_number: { [key: string]: number };
    sequenceToScript(sequence: Sequence): string;
    wordToScript(word: Word): string;
    scriptToWord(script: string): Word;
}

class BrahmiLikeScript implements Script {
    characterMap: { [key: string]: number };
    matraMap: { [key: string]: number };
    characters: string[] = [];
    ignoreCharacters: string[] = [];
    matras: string[] = [];
    alphabet_to_number: { [key: string]: number };
    halant: string;
    readonly max_length: number;

    // constructor which receives the characters, matras and halant
    constructor(characterMap: { [key: string]: number }, matraMap: { [key: string]: number }, halant: string,
        ignoreCharacters: string[] = []
    ) {
        this.characterMap = characterMap;
        this.matraMap = matraMap;
        this.halant = halant;
        this.ignoreCharacters = ignoreCharacters;
        this.alphabet_to_number = {
            ...Object.fromEntries(Object.entries(this.characterMap).map(([key, value]) => [key.replaceAll(this.halant, ""), value])),
            ...this.matraMap
        };
        // max_length is the maximum length of the characters
        this.max_length = Math.max(...Object.keys(this.alphabet_to_number).map(key => key.length));
        // characters are the keys of the characterMap in ascending order. if two keys have the same value, the key that comes first in the characterMap is considered solely
        Object.entries(characterMap).forEach(([k, v]) => this.characters[v - 1] ??= k);
        // matras are the keys of the matraMap in ascending order
        Object.entries(matraMap).forEach(([k, v]) => this.matras[v - 1] ??= k);

    }

    sequenceToScript(sequence: Sequence): string {
        let script = "";
        sequence.toNumbers().forEach((number) => {
            script += this.characters[number - 1] + " ";
        });
        return script;
    }

    wordToScript(word: Word): string {
        let script = "";
        let can_use_matraa = false;
        word.toNumbers().forEach((number, index, array) => {
            let character = this.characters[number - 1];
            // vowels
            if (BrahmiLikeScript.isVowelBlock(number) || BrahmiLikeScript.isLu(number)) {
                character = can_use_matraa ? this.matras[number - 1] : character;
                can_use_matraa = false;
                // consonants
            } else if (BrahmiLikeScript.isConsonantBlock(number)) {
                // if the next character is not a consonant and not a L, remove the halant
                if (index != array.length - 1 && !BrahmiLikeScript.isConsonantBlock(array[index + 1])) {
                    character = character.replace(this.halant, "");
                }
                can_use_matraa = true;
            }
            else if (BrahmiLikeScript.isSpecialBlock(number)) {
                can_use_matraa = false;
            }
            else {
                throw new Error("Invalid character number");
            }
            script += character;
        });
        return script;
    }

    scriptToWord(script: string): Word {
        let word = "";
        let split = script.split("");
        let blocked: string[] = [];
        for (let lb = 0; lb < split.length; lb++) {
            if (split[lb] == this.halant) {
                blocked.push(this.halant);
                continue;
            }
            let found = false;
            for (let ub = Math.min(script.length, lb + this.max_length) - 1; ub >= lb; ub--) {
                let block = split.slice(lb, ub + 1).join("");
                if (this.alphabet_to_number[block]) {
                    blocked.push(block);
                    lb = ub;
                    found = true;
                    break;
                }
            }
            if (!found && !this.ignoreCharacters.includes(split[lb])) {

                Logger.warn(`Invalid character: ${split[lb]}   ${this.ignoreCharacters}`);

            }
        }
        blocked.forEach((block, index) => {
            if (block != this.halant) {
                const blockIndex = this.alphabet_to_number[block];
                word += Unit.numberToEncodedString(blockIndex);
                if (BrahmiLikeScript.isConsonantBlock(blockIndex) && (index == blocked.length - 1 ||
                    (!this.matraMap[blocked[index + 1]] && !BrahmiLikeScript.isSpecialBlock(this.alphabet_to_number[blocked[index + 1]]) &&
                        (blocked[index + 1] != this.halant)
                    ))) {
                    word += Unit.numberToEncodedString(1);
                }
            }
        });

        return new Word(word);
    }

    static isVowelBlock(numeral: number): boolean {
        return (numeral >= 1 && numeral <= 12) || (numeral >= 16 && numeral <= 27);
    }
    static isConsonantBlock(numeral: number): boolean {
        return ((numeral > 27 && numeral <= 60) || numeral == 13);
    }
    static isSpecialBlock(numeral: number): boolean {
        return numeral > 60 && numeral <= 64;
    }
    static isLu(numeral: number): boolean {
        return (numeral == 14 || numeral == 15);
    }


}

// create a new instance of the Script class called devanagari_script
export const devanagari_script = new BrahmiLikeScript(
    {
        // Vowels: hasv, dirgh, pluta
        "अ": 1, "आ": 2, "आा": 3,
        "इ": 4, "ई": 5, "ईी": 6,
        "उ": 7, "ऊ": 8, "ऊू": 9,
        "ऋ": 10, "ॠ": 11, "ॠॄ": 12,
        "ळ्": 13, "ळु": 14, "ळू": 15,
        "ए": 16, "एा": 17, "एाा": 18,
        "ऐ": 19, "ऐो": 20, "ऐोो": 21,
        "ओ": 22, "ओो": 23, "ओोो": 24,
        "औ": 25, "औौ": 26, "औौौ": 27,

        // Grouped consonants
        "क्": 28, "ख्": 29, "ग्": 30, "घ्": 31, "ङ्": 32,
        "च्": 33, "छ्": 34, "ज्": 35, "झ्": 36, "ञ्": 37,
        "ट्": 38, "ठ्": 39, "ड्": 40, "ढ्": 41, "ण्": 42,
        "त्": 43, "थ्": 44, "द्": 45, "ध्": 46, "न्": 47,
        "प्": 48, "फ्": 49, "ब्": 50, "भ्": 51, "म्": 52,
        "य्": 53, "र्": 54, "ल्": 55, "व्": 56, "श्": 57,

        // Un-grouped consonants
        // 58, 59, 60
        "ष्": 58, "स्": 59, "ह्": 60,

        // Special characters
        "ं": 61, "ः": 62, "...": 63, "::": 64,
        // Missing characters mapped to closest equivalents
        "क़्": 28,  // To "क्"
        "ख़्": 29,  // To "ख्"
        "ग़्": 30,  // To "ग्"
        "ज़्": 35,  // To "ज्"
        "ड़्": 40,  // To "ड्"
        "ढ़्": 41,  // To "ढ्"
        "फ़्": 49,  // To "फ्"
        "य़्": 53,  // To "य्"
        "ऴ्": 55,  // To "ल्"
        "ऩ्": 47,  // To "न्"
        "ऴ": 55,   // To "ळ"
        "ऱ्": 54,  // To "र्"
        "ऍ": 16,   // To "ए"
        "ऑ": 22,   // To "ओ"
        "ऎ": 16,   // To "ए"
        "ऒ": 22    // To "ओ"        
    },
    {
        "": 1, "ा": 2, "ाा": 3, "ि": 4, "ी": 5, "ीी": 6, "ु": 7, "ू": 8, "ूू": 9, "ृ": 10, "ॄ": 11, "ॄॄ": 12, "ळु": 14, "ळू": 15, "े": 16,
        "ेे": 17, "ेेे": 18, "ै": 19, "ैै": 20, "ैैै": 21, "ो": 22, "ोो": 23, "ोोो": 24, "ौ": 25, "ौौ": 26, "ौौौ": 27, "ॉ": 2, "ॆ": 16, "ॊ": 22
    },
    "्",
    ["ँ", "़", "ॣ", "ॢ", "ऽ", "ॅ"]
);