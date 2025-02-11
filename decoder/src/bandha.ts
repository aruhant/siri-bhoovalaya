import { Chakra } from './chakra.js';
import { Sequence } from './sequence.js';
import fs from 'fs';
export class Bandha {
    private bandha: {i:number,j:number}[];
    private size: number;

    constructor( bandha: {i:number,j:number}[]

    ) {
        // ToDo: validate bandha
        this.bandha = bandha;
        this.size = Math.sqrt(bandha.length);
    }

    apply(chakra: Chakra): Sequence {
        const result:Sequence = new Sequence('');
        this.bandha.forEach( (unit) => {
            result.append(chakra.getUnit(unit.i, unit.j));
        });
        return result;
    }

    // method to convert this form of bandha (sequence of i,j pairs) to a 2D array of numbers
    to2DArray1base(): number[][] {
        let result: number[][] = Array.from({ length: this.size }, () => Array(this.size).fill(0));
        //Logger.debugObject(this.bandha);
        //Logger.debugObject(result);
        this.bandha.forEach((element, index) => {
            result[element.i][element.j] = index +1;
        });
        return result;
    }

    toString() {
        let as2DArray = this.to2DArray1base();
        let result = '';
        as2DArray.forEach(row => {
            row.forEach(value => {
            result += `${value}`.padStart((this.size*this.size+1).toString().length) 
            });
            result += '\n';
        });
        return result;
    }

    get(){
        return this.bandha;
    }

}


export class BandhaFile {
    static readPairSeperatedBandha(filename: string): Bandha {
        const bandha = fs.readFileSync(filename, 'utf8')
            .trim()
            .split('\n')
            .map(line => {
                const [i, j] = line.split(',').map(Number);
                return { i, j };
            });
        return new Bandha(bandha);
    }

    static writePairSeperatedBandha(filename: string, bandha: Bandha
    ) {
        const data = bandha.get().map(({ i, j }) => `${i},${j}`).join('\n');
        fs.writeFileSync(filename, data);
    }
}

export class BandhaGenerator{
    static patternGenerator(size: number, up: number, right: number) {
        const bandha: {i:number,j:number}[] = [];
        let row = 0;
        let col = (size - 1) / 2;
        for (let i = 0; i < size * size; i++) {
            bandha.push({i: row, j: col});
            row = ((row - up) % size + size) % size;
            col = ((col + right) % size + size) % size;
            // if the cell is already filled, move one row down
            if (bandha.find(unit => unit.i === row && unit.j === col)) {
                row = ((row + 2*up) % size + size) % size;
                col = ((col - right) % size + size) % size;
            }
        }
        return new Bandha(bandha);        
    }

}