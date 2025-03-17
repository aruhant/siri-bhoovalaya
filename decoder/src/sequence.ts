/*
Copyright (C) 2025 Aruhant Mehta
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import fs from 'fs';
export enum Units {
    _1,
    _2,
    _3,
    _4,
    _5,
    _6,
    _7,
    _8,
    _9,
    _10,
    _11,
    _12,
    _13,
    _14,
    _15,
    _16,
    _17,
    _18,
    _19,
    _20,
    _21,
    _22,
    _23,
    _24,
    _25,
    _26,
    _27,
    _28,
    _29,
    _30,
    _31,
    _32,
    _33,
    _34,
    _35,
    _36,
    _37,
    _38,
    _39,
    _40,
    _41,
    _42,
    _43,
    _44,
    _45,
    _46,
    _47,
    _48,
    _49,
    _50,
    _51,
    _52,
    _53,
    _54,
    _55,
    _56,
    _57,
    _58,
    _59,
    _60,
    _61,
    _62,
    _63,
    _64
}
// ToDo: extend string
export class Sequence {
    private sequence: string;

    append(unit: Unit) {
        this.sequence += unit.toEncodedString();
    }
    join(sequence: Sequence) {
        this.sequence += sequence.toEncodedString();
    }

    constructor(encodedString: string) {
        this.sequence = encodedString.split('').map(s => new Unit(s)).map(u => u.toEncodedString()).join('');
        if (this.sequence !== encodedString) {
            throw new Error('Invalid sequence');
        }
    }

    static fromUnits(units: Unit[]): Sequence {
        return new Sequence(units.map(u => u.toEncodedString()).join(''));
    }

    static fromNumbers(numbers: number[]): Sequence {
        return new Sequence(numbers.map(n => Unit.numberToEncodedString(n)).join(''));
    }
    unitAt(i: number): Unit {
        return new Unit(this.sequence[i]);
    }

    toNumbers(): number[] {
        return this.sequence.split('').map(Unit.encodedStringToNumber);
    }

    toEncodedString(): string {
        return this.sequence;
    }
    getUnits(): Unit[] {
        return this.sequence.split('').map(s => new Unit(s));
    }
    toString(): string {
        return this.toNumbers().join(' ');
    }
    length(): number {
        return this.sequence.length;
    }
    slice(start: number, end: number): Sequence {
        return new Sequence(this.sequence.slice(start, end));
    }
    

}

export class Sequence2D {
    private sequence: Sequence;
    private size: number;
    constructor(sequence: Sequence) {
        this.sequence = sequence;
        this.size = Math.sqrt(sequence.length());
        if (this.size % 1 !== 0) {
            throw new Error('Invalid sequence length');
    }
    }

    unitAt(i: number, j: number): Unit {
        return this.sequence.unitAt(i * this.size + j);
    }

    getSize(): number {
        return this.size;
    }
    

    toString() {
        const numbers = this.sequence.toNumbers();
        let result = '';
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                result += `${numbers[i * this.size + j]}`.padStart(3);

            }
            result += '\n';
        }
        return result;
    }
}

export class Transposed extends Sequence {
    constructor(sequence: Sequence) {
        super(sequence.toEncodedString());
    }

}



export class Word extends Sequence {

    constructor(encodedString: string) {
        super(encodedString);
    }

    static fromNumbers(numbers: number[]): Word {
        return new Word(Sequence.fromNumbers(numbers).toEncodedString());
    }

    static fromUnits(units: Unit[]): Word {
        return new Word(Sequence.fromUnits(units).toEncodedString());
    }

    static fromSequence(sequence: Sequence): Word {
        return new Word(sequence.toEncodedString());
    }

    // string functions
    equals(other: Word): boolean {
        return this.toEncodedString() === other.toEncodedString();
    }

    compare(other: Word): number {
        if (this.toEncodedString() < other.toEncodedString()) {
            return -1;
        } else if (this.toEncodedString() > other.toEncodedString()) {
            return 1;
        } else {
            return 0;
        }
    }

    startsWith(prefix: Word): boolean {
        return this.toEncodedString().startsWith(prefix.toEncodedString());
    }

    endsWith(suffix: Word): boolean {
        return this.toEncodedString().endsWith(suffix.toEncodedString());
    }

    contains(substring: Word): boolean {
        return this.toEncodedString().includes(substring.toEncodedString());
    }

    indexOf(substring: Word): number {
        return this.toEncodedString().indexOf(substring.toEncodedString());
    }

    lastIndexOf(substring: Word): number {
        return this.toEncodedString().lastIndexOf(substring.toEncodedString());
    }

    slice(start: number, end: number): Word {
        return new Word(this.toEncodedString().slice(start, end));
    }
    substring(start: number, end: number): Word {
        return this.slice(start, end);
    }
    replace(oldSubstring: Word, newSubstring: Word): Word {
        return new Word(this.toEncodedString().replace(oldSubstring.toEncodedString(), newSubstring.toEncodedString()));
    }
    replaceAll(oldSubstring: Word, newSubstring: Word): Word {
        return new Word(this.toEncodedString().replaceAll(oldSubstring.toEncodedString(), newSubstring.toEncodedString()));
    }
    split(separator?: Word): Word[] | Unit[] {
        if (separator) {
            return this.toEncodedString().split(separator.toEncodedString()).map((s) => new Word(s));
        } else {
            return this.toEncodedString().split('').map((s) => new Unit(s));
        }
    }
    editDistance(other: Word, customEditDistance: (word1: Word, word2: Word) => number): number {
        return customEditDistance(this, other);
    }
}

export class Unit {
    private unit: Units;
    static readonly baseChar = 48;
    constructor(value: string | number) {
        // ToDo: allow for Units as well
        if (typeof value === 'number') {
            this.unit = Unit.numberToUnits(value);
        } else if (typeof value === 'string') {
            this.unit = Unit.encodedStringToUnits(value);
        }
        else {
            throw new Error('Invalid Unit type');
        }
    }
    toNumber(): number {
        return Unit.unitsToNumber(this.unit);
    }
    toEncodedString(): string {
        return Unit.unitsToEncodedString(this.unit);
    }
    get(): Units {
        return this.unit;
    }

    static numberToEncodedString(n: number): string {
        if (!Unit.validateNumber(n)) {
            throw new Error(`Invalid number for encoding: ${n}`);
        }
        return String.fromCharCode(Unit.baseChar + n);

    }

    static encodedStringToNumber(s: string): number {
        const n = s.charCodeAt(0) - Unit.baseChar;
        if (!Unit.validateNumber(n)) {
            throw new Error(`Invalid encoded string for number conversion: ${s}`);
        }
        return n;
    }
    // ToDo: instead of harcording with _, use [index - 1]
    static unitsToNumber(unit: Units): number {
        try {
        const n = +((Units[unit]).replace('_', ''));
        if (!Unit.validateNumber(n)) {
            throw new Error(`Invalid unit for number conversion: ${unit}`);
        }
        return n;
    } catch (error) {
        throw new Error(`Invalid unit for number conversion: ${unit}`);
    }
    }
    static unitsToEncodedString(unit: Units): string {
        try { return Unit.numberToEncodedString(Unit.unitsToNumber(unit)); }
        catch (error) {
            throw new Error(`Invalid unit for encoded string conversion: ${unit}`);
        }
    }
    static numberToUnits(n: number): Units {
        if (!Unit.validateNumber(n)) {
            throw new Error(`Invalid number for Units conversion: ${n}`);
        }
        return Units[`_${n}`];
    }
    static encodedStringToUnits(s: string): Units {
        try {
            return Units[`_${Unit.encodedStringToNumber(s)}`];
        } catch (error) {
            throw new Error(`Invalid encoded string for Units conversion: ${s}`);
        }
    }

    private static validateNumber(n: number): boolean {
        return n >= 1 && n <= 64;
    }
}


