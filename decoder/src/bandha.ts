/*
Copyright (C) 2025 Aruhant Mehta
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import { assert } from 'console';
import { Chakra } from './chakra.js';
import { Sequence, Transposed } from './sequence.js';
import fs from 'fs';
import { Logger } from './utils/logger.js';
export class Bandha {
    private bandha: { i: number, j: number }[];
    private size: number;

    constructor(bandha: { i: number, j: number }[]) {
        this.bandha = bandha;
        this.size = Math.sqrt(bandha.length);
        if (this.size % 1 !== 0) {
            Logger.warn(`Bandha size ${this.size} is not a perfect square`);
        }
        for (const { i, j } of bandha) {
            if (i < 0 || i >= this.size || j < 0 || j >= this.size) {
                Logger.warn(`Bandha has unconvential indices: ${i}, ${j}`);
            }
        }
    }

    apply(chakra: Chakra): Transposed {
        if (chakra.getSize() - this.size != 0) {
            Logger.info(this.size.toString());
            Logger.info(chakra.getSize().toString());
            Logger.warn(`Bandha size ${this.size} does not match chakra size ${chakra.getSize()}`);
        }
        const result: Transposed = new Sequence('');
        this.bandha.forEach((unit) => {
            result.append(chakra.getUnit(unit.i, unit.j));
        });
        return result;
    }

    // method to convert this form of bandha (sequence of i,j pairs) to a 2D array of numbers
    to2DArray1base(): number[][] {
        let result: number[][] = Array.from({ length: this.size }, () => Array(this.size).fill(0));
        this.bandha.forEach((element, index) => {
            result[element.i][element.j] = index + 1;
        });
        return result;
    }

    toStringAs2DArray() {
        let as2DArray = this.to2DArray1base();
        let result = '';
        as2DArray.forEach(row => {
            row.forEach(value => {
                result += `${value}`.padStart((this.size * this.size + 1).toString().length)
            });
            result += '\n';
        });
        return result;
    }
    toString(delimiter: string = '\n'): string {
        return this.bandha.map(({ i, j }) => `${i},${j}`).join(delimiter);
    }

    get() {
        return this.bandha;
    }
    static fromKoshtakChintamani(size: number, up: number, right: number) {
        const bandha: { i: number, j: number }[] = [];
        let row = 0;
        let col = (size - 1) / 2;
        for (let i = 0; i < size * size; i++) {
            bandha.push({ i: row, j: col });
            row = ((row - up) % size + size) % size;
            col = ((col + right) % size + size) % size;
            // if the cell is already filled, move one row down
            if (bandha.find(unit => unit.i === row && unit.j === col)) {
                row = ((row + 2 * up) % size + size) % size;
                col = ((col - right) % size + size) % size;
            }
        }
        return new Bandha(bandha);
    }
    /*
    static fromSubChakraBandha(subChakraBandha: Bandha, order: number[]): Bandha {
        const bandha: { i: number, j: number }[] = [];
       order.forEach((index) => {
            // add elements of the subChakraBandha 
        });
        return new Bandha(bandha);
      
}
*/
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
        fs.writeFileSync(filename, bandha.toString());
    }
}

