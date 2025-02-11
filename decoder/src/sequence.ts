import fs from 'fs';

export class Sequence {
    append(unit : Unit) {
        this.sequence += unit.toEncodedString();
    }
    private sequence: string;
    
    constructor(encodedString: string) {
        // ToDo: validate sequence
        this.sequence = encodedString;
    }
    
    static fromNumbers(numbers: number[]): Sequence {
        return new Sequence(numbers.map(n => Unit.numberToEncodedString(n)).join(''));
    }
    getUnit(i: number): Unit {
        return new Unit(this.sequence[i]);
    }
    
    toNumbers(): number[] {
        return this.sequence.split('').map(Unit.EncodedStringToNumber);
    }
    
    getEncodedString(): string {
        return this.sequence;
    }
    toString(): string {
        return this.toNumbers().join(' ');
    }
    length(): number {
        return this.sequence.length;
    }

    
}

export class Sequence2D {
    private sequence: Sequence;
    private size: number;
    constructor(sequence: Sequence) {
        this.sequence = sequence;
        this.size = Math.sqrt (sequence.length());
    }
    getUnit(i: number, j: number): Unit {
        return this.sequence.getUnit(i * this.size + j);
    }

    getSize(): number {
        return this.size;
    }

    toString() {
        const numbers = this.sequence.toNumbers();
        let result = '';
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                result +=  `${numbers[i * this.size + j]}`.padStart(3) ;

            }
            result += '\n';
        }
        return result;
    }



}

export class SequenceFile {
    static readNumerical(filename: string): Sequence {
       const data = fs.readFileSync(filename, 'utf8').split(',');
        return Sequence.fromNumbers(data.map(Number));
    }
    static read(filename: string): Sequence {
        return new Sequence(fs.readFileSync(filename, 'utf8'));
    }
    
    static write(filename: string, sequence: Sequence) {
        fs.writeFileSync(filename, sequence.getEncodedString());
    }
}

export class Word extends Sequence { }

export class Unit extends String {
    static readonly baseChar: number = 'A'.charCodeAt(0) - 1;

    toEncodedString() {
        return this;
    }
    static numberToEncodedString(n: number): string {
        return this.fromCharCode(Unit.baseChar + n);
    }

    static EncodedStringToNumber(s: string): number {
        return s.charCodeAt(0) - Unit.baseChar;
    }
}