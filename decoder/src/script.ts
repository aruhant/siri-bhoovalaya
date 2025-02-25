import { Sequence, Unit, Units, Word } from "./sequence.js";
import { Logger } from "./utils/logger.js";

export interface Script {
    //name: string;
    //allBlockToUnits: Map<string, Units>;
    sequenceToScript(sequence: Sequence): string[];
    scriptToSequence(script: string[]): Sequence;
    wordToScript(word: Word): string;
    scriptToWord(script: string): Word;
    sciptToUnits(script: string): Units;
    unitsToScript(unit: Units): string;
    getName(): string;
}

export class BrahmiLikeScript implements Script {
    name: string;
    characterMap: Map<string, Units>;
    matraMap: Map<string, Units>;
    characters: string[] = [];
    ignoreCharacters: string[] = [];
    matras: string[] = [];
    allBlockToUnits: Map<string, Units>;
    halant: string;
    readonly max_length: number;

    // constructor which receives the characters, matras and halant
    constructor(characterMap: Map<string, Units>, matraMap: Map<string, Units>, halant: string,
        ignoreCharacters: string[] = [], name: string = "bh"
    ) {
        this.name = name;
        this.characterMap = characterMap;
        this.matraMap = matraMap;
        this.halant = halant;
        this.ignoreCharacters = ignoreCharacters;
        this.allBlockToUnits = new Map([
            ...Array.from(this.characterMap.entries()).map(([key, value]) => [key.replaceAll(this.halant, ""), value] as [string, Units]),
            ...Array.from(this.matraMap.entries())
        ]);

        // max_length is the maximum length of the characters
        this.max_length = Math.max(...Array.from(this.allBlockToUnits.keys()).map(key => key.length));
        // characters are the keys of the characterMap in ascending order. if two keys have the same value, the key that comes first in the characterMap is considered solely
        this.characterMap.forEach((u, c) => this.characters[Unit.unitsToNumber(u) - 1] ??= c);
        // matras are the keys of the matraMap in ascending order
        this.matraMap.forEach((u, m) => this.matras[Unit.unitsToNumber(u) - 1] ??= m);
    }

    unitsToScript(unit: Units): string {
        return this.characters[Unit.unitsToNumber(unit) - 1];
    }

    sequenceToScript(sequence: Sequence): string[] {
        let script: string[] = [];
        sequence.getUnits().forEach((unit) => {
            script.push(this.unitsToScript(unit.get()));
        });
        return script;
    }

    scriptToSequence(script: string[]): Sequence {
        let units: Unit[] = [];
        script.forEach((character) => {
            const unit = this.sciptToUnits(character);
            if (unit === undefined && !this.ignoreCharacters.includes(character)) {
                Logger.warn(`Invalid character: ${character}`);
            } else {
                units.push(new Unit(Unit.unitsToNumber(unit)));
            }
        });
        return Sequence.fromUnits(units);
    }

    wordToScript(word: Word): string {
        let script = "";
        let can_use_matraa = false;

        word.toNumbers().forEach((number, index, array) => {
            let character = this.characters[number - 1];
            // vowels
            if (BrahmiLikeScript.isVowelBlock(Unit.numberToUnits(number)) || BrahmiLikeScript.isLu(Unit.numberToUnits(number))) {
                character = can_use_matraa ? this.matras[number - 1] : character;
                can_use_matraa = false;
                // consonants
            } else if (BrahmiLikeScript.isConsonantBlock(Unit.numberToUnits(number))) {
                // if the next character is not a consonant and not a L, remove the halant
                if (index != array.length - 1 && !BrahmiLikeScript.isConsonantBlock(Unit.numberToUnits(array[index + 1]))) {
                    character = character.replace(this.halant, "");
                }
                can_use_matraa = true;
            }
            else if (BrahmiLikeScript.isSpecialBlock(Unit.numberToUnits(number))) {
                can_use_matraa = false;
            }
            else {
                throw new Error("Invalid character number: " + number);
            }
            script += character;
        });
        return script;
    }
    /**
     * 
     * @param script 
     * @returns A member of the Units enum if the script is a valid block, undefined otherwise
     */
    sciptToUnits(script: string): Units | undefined {
        return this.allBlockToUnits.get(script.replaceAll(this.halant, ""));
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
                if (this.sciptToUnits(block) !== undefined) {
                    blocked.push(block);
                    lb = ub;
                    found = true;
                    break;
                }
            }
            if (!found && !this.ignoreCharacters.includes(split[lb])) {
                Logger.warn(`Invalid character: ${split[lb]}, hex: ${split[lb].charCodeAt(0).toString(16)}`);

            }
        }
        blocked.forEach((block, index) => {
            if (block != this.halant) {
                const blockIndex: number = Unit.unitsToNumber(this.sciptToUnits(block));
                word += Unit.numberToEncodedString(blockIndex);
                try{if (BrahmiLikeScript.isConsonantBlock(Unit.numberToUnits(blockIndex)) && (index == blocked.length - 1 ||
                    ((blocked[index + 1] != this.halant) && !this.matraMap.get(blocked[index + 1]) && !BrahmiLikeScript.isSpecialBlock(this.sciptToUnits(blocked[index + 1])) 
                        
                    ))) {
                    word += Unit.numberToEncodedString(1);
                }}
                catch(error){
                    Logger.error(`Error converting blocked: ${blocked}`);
                    Logger.error(`Error converting block to unit: ${blocked[index + 1]}`);
                }
            }
        });

        return new Word(word);
    }

    static isVowelBlock(unit: Units): boolean {
        const numeral = Unit.unitsToNumber(unit);
        return (numeral >= 1 && numeral <= 12) || (numeral >= 16 && numeral <= 27);
    }
    static isConsonantBlock(unit: Units): boolean {
        const numeral = Unit.unitsToNumber(unit);
        return ((numeral > 27 && numeral <= 60) || numeral == 13);
    }
    static isSpecialBlock(unit: Units): boolean {
        const numeral = Unit.unitsToNumber(unit);
        return numeral > 60 && numeral <= 64;
        
    }
    static isLu(unit: Units): boolean {
        const numeral = Unit.unitsToNumber(unit);
        return (numeral == 14 || numeral == 15);
    }
    static isSameVowelGroup(unit1: Units, unit2: Units): boolean {
        if (!BrahmiLikeScript.isVowelBlock(unit1) || !BrahmiLikeScript.isVowelBlock(unit2)) {
            return false;
        }
        // define functions isAgroup, isIgroup, isUgroup etc that takes a unit and returns a boolean
        const isAgroup = (unit: Units) => Unit.unitsToNumber(unit) >= 1 && Unit.unitsToNumber(unit) <= 3;
        const isIgroup = (unit: Units) => Unit.unitsToNumber(unit) >= 4 && Unit.unitsToNumber(unit) <= 6;
        const isUgroup = (unit: Units) => Unit.unitsToNumber(unit) >= 7 && Unit.unitsToNumber(unit) <= 9;
        const isRgroup = (unit: Units) => Unit.unitsToNumber(unit) >= 10 && Unit.unitsToNumber(unit) <= 12;
        const isEgroup = (unit: Units) => Unit.unitsToNumber(unit) >= 16 && Unit.unitsToNumber(unit) <= 21;
        const isOgroup = (unit: Units) => Unit.unitsToNumber(unit) >= 22 && Unit.unitsToNumber(unit) <= 27;
        return (isAgroup(unit1) && isAgroup(unit2)) || (isIgroup(unit1) && isIgroup(unit2)) || (isUgroup(unit1) && isUgroup(unit2)) || (isRgroup(unit1) && isRgroup(unit2)) || (isEgroup(unit1) && isEgroup(unit2)) || (isOgroup(unit1) && isOgroup(unit2));

    }

    
    // static functions getConsontantBlock, getVowelBlock, getSpecialBlock, getLuBlock that returns Units[]
    static getConsonantBlock(): Units[] {
        return Object.values(Units).filter((unit): unit is Units => typeof unit !== 'string' && BrahmiLikeScript.isConsonantBlock(unit));
    }
    static getVowelBlock(): Units[] {
        return Object.values(Units).filter((unit): unit is Units => typeof unit !== 'string' && BrahmiLikeScript.isVowelBlock(unit));
    }
    static getSpecialBlock(): Units[] {
        return Object.values(Units).filter((unit): unit is Units => typeof unit !== 'string' && BrahmiLikeScript.isSpecialBlock(unit));
    }
    static getLuBlock(): Units[] {
        return Object.values(Units).filter((unit): unit is Units => typeof unit !== 'string' && BrahmiLikeScript.isLu(unit));
    }
    static getSameVowelGroup(unit: Units): Units[] {
        return BrahmiLikeScript.getVowelBlock().filter((unit2) => BrahmiLikeScript.isSameVowelGroup(unit, unit2));
    }
    static getAllVowelGroups(): Units[][] {
        const seen = new Set<Units>();
        return BrahmiLikeScript.getVowelBlock().reduce((groups, unit) => {
            if (!seen.has(unit)) {
            const group = BrahmiLikeScript.getSameVowelGroup(unit);
            group.forEach(u => seen.add(u));
            groups.push(group);
            }
            return groups;
        }, [] as Units[][]);
    }


    getName(): string {
        return this.name;
    }
}

// create a new instance of the Script class called devanagari_script
export const devanagari_script = new BrahmiLikeScript(
    new Map([
        // Vowels: hasv, dirgh, pluta
        ["अ", Units._1], ["आ", Units._2], ["आा", Units._3],
        ["इ", Units._4], ["ई", Units._5], ["ईी", Units._6],
        ["उ", Units._7], ["ऊ", Units._8], ["ऊू", Units._9],
        ["ऋ", Units._10], ["ॠ", Units._11], ["ॠॄ", Units._12],
        ["ळ्", Units._13], ["ळु", Units._14], ["ळू", Units._15],
        ["ए", Units._16], ["एा", Units._17], ["एाा", Units._18],
        ["ऐ", Units._19], ["ऐो", Units._20], ["ऐोो", Units._21],
        ["ओ", Units._22], ["ओो", Units._23], ["ओोो", Units._24],
        ["औ", Units._25], ["औौ", Units._26], ["औौौ", Units._27],

        // Grouped consonants
        ["क्", Units._28], ["ख्", Units._29], ["ग्", Units._30], ["घ्", Units._31], ["ङ्", Units._32],
        ["च्", Units._33], ["छ्", Units._34], ["ज्", Units._35], ["झ्", Units._36], ["ञ्", Units._37],
        ["ट्", Units._38], ["ठ्", Units._39], ["ड्", Units._40], ["ढ्", Units._41], ["ण्", Units._42],
        ["त्", Units._43], ["थ्", Units._44], ["द्", Units._45], ["ध्", Units._46], ["न्", Units._47],
        ["प्", Units._48], ["फ्", Units._49], ["ब्", Units._50], ["भ्", Units._51], ["म्", Units._52],
        ["य्", Units._53], ["र्", Units._54], ["ल्", Units._55], ["व्", Units._56], ["श्", Units._57],

        // Un-grouped consonants
        ["ष्", Units._58], ["स्", Units._59], ["ह्", Units._60],

        // Special characters
        ["ं", Units._61], ["ः", Units._62], ["...", Units._63], ["::", Units._64],

        // Missing characters mapped to closest equivalents
        ["क़्", Units._28],  // To "क्"
        ["ख़्", Units._29],  // To "ख्"
        ["ग़्", Units._30],  // To "ग्"
        ["ज़्", Units._35],  // To "ज्"
        ["ड़्", Units._40],  // To "ड्"
        ["ढ़्", Units._41],  // To "ढ्"
        ["फ़्", Units._49],  // To "फ्"
        ["य़्", Units._53],  // To "य्"
        ["ऴ्", Units._55],  // To "ल्"
        ["ऩ्", Units._47],  // To "न्"
        ["ऴ", Units._55],   // To "ळ"
        ["ऱ्", Units._54],  // To "र्"
        ["ऍ", Units._16],   // To "ए"
        ["ऑ", Units._22],   // To "ओ"
        ["ऎ", Units._16],   // To "ए"
        ["ऒ", Units._22],    // To "ओ"
        ["ऌ", Units._13],   // To "ळ्"
        ["ॡ", Units._13],   // To "ळ्"  
    ]),
    new Map([
        ["", Units._1], ["ा", Units._2], ["ाा", Units._3], ["ि", Units._4], ["ी", Units._5], ["ीी", Units._6], ["ु", Units._7], ["ू", Units._8], ["ूू", Units._9], ["ृ", Units._10], ["ॄ", Units._11], ["ॄॄ", Units._12], ["ळु", Units._14], ["ळू", Units._15], ["े", Units._16],
        ["ेे", Units._17], ["ेेे", Units._18], ["ै", Units._19], ["ैै", Units._20], ["ैैै", Units._21], ["ो", Units._22], ["ोो", Units._23], ["ोोो", Units._24], ["ौ", Units._25], ["ौौ", Units._26], ["ौौौ", Units._27], ["ॉ", Units._2], ["ॆ", Units._16], ["ॊ", Units._22], ["ॢ", Units._13], ["ॣ", Units._13]
    ]),
    "्",
    ["ँ", "़", "ॣ", "ॢ", "ऽ", "ॅ", '\u0081', "\u200C", "\u200B"]
);

// instance of the Script class called kannada_script
export const kannada_script = new BrahmiLikeScript(
    new Map([
        // Vowels: hasv, dirgh, pluta
        ["ಅ", Units._1], ["ಆ", Units._2], ["ಆಾ", Units._3],
        ["ಇ", Units._4], ["ಈ", Units._5], ["ಈೀ", Units._6],
        ["ಉ", Units._7], ["ಊ", Units._8], ["ಊೂ", Units._9],
        ["ಋ", Units._10], ["ೠ", Units._11], ["ೠೄ", Units._12],
        ["ಳ್", Units._13], ["ಳು", Units._14], ["ಳೂ", Units._15],
        ["ಎ", Units._16], ["ಏ", Units._17], ["ಏೋ", Units._18],
        ["ಐ", Units._19], ["ಐೖ", Units._20], ["ಐೖೖ", Units._21],
        ["ಒ", Units._22], ["ಓ", Units._23], ["ಓೋ", Units._24],
        ["ಔ", Units._25], ["ಔೌ", Units._26], ["ಔೌೌ", Units._27],

        // Grouped consonants
        ["ಕ್", Units._28], ["ಖ್", Units._29], ["ಗ್", Units._30], ["ಘ್", Units._31], ["ಙ್", Units._32],
        ["ಚ್", Units._33], ["ಛ್", Units._34], ["ಜ್", Units._35], ["ಝ್", Units._36], ["ಞ್", Units._37],
        ["ಟ್", Units._38], ["ಠ್", Units._39], ["ಡ್", Units._40], ["ಢ್", Units._41], ["ಣ್", Units._42],
        ["ತ್", Units._43], ["ಥ್", Units._44], ["ದ್", Units._45], ["ಧ್", Units._46], ["ನ್", Units._47],
        ["ಪ್", Units._48], ["ಫ್", Units._49], ["ಬ್", Units._50], ["ಭ್", Units._51], ["ಮ್", Units._52],
        ["ಯ್", Units._53], ["ರ್", Units._54], ["ಲ್", Units._55], ["ವ್", Units._56], ["ಶ್", Units._57],

        // Un-grouped consonants
        ["ಷ್", Units._58], ["ಸ್", Units._59], ["ಹ್", Units._60],

        // Special characters
        ["ಂ", Units._61], ["ಃ", Units._62], ["...", Units._63], ["::", Units._64],

        // Missing characters mapped to closest equivalents
        [":", Units._62],  // To "ः"
        ["ೞ್", Units._55],  // To "ಲ್"
        ["ಱ್", Units._54],  // To "ರ್"
    ]),
    new Map([
        ["", Units._1], ["ಾ", Units._2], ["ಾಾ", Units._3], ["ಿ", Units._4], ["ೀ", Units._5], ["ೀೀ", Units._6], ["ು", Units._7], ["ೂ", Units._8], ["ೂೂ", Units._9], ["ೃ", Units._10], ["ೄ", Units._11], ["ೄೄ", Units._12], ["ಳು", Units._14], ["ಳೂ", Units._15], ["ೆ", Units._16],
        ["ೇ", Units._17], ["ೇೇ", Units._18], ["ೈ", Units._19], ["ೈೈ", Units._20], ["ೈೈೈ", Units._21], ["ೊ", Units._22], ["ೋ", Units._23], ["ೋೋ", Units._24], ["ೌ", Units._25], ["ೌೌ", Units._26], ["ೌೌೌ", Units._27], ["ೇ", Units._17], ["ೈ", Units._19], ["ೋ", Units._23], ["ೊ", Units._22],
        ["ೋ", Units._23], ["ೀ", Units._4]
    ]),
    "್",
    ["ಁ", "಼","ऽ", '\u0081', "\u200C", "\u200B"]
);
