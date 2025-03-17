/*
Copyright (C) 2025 Aruhant Mehta
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import assert from "assert";
import {Sequence2D, Unit } from "./sequence.js";

export class Chakra {
    private chakra: Sequence2D;
    private size: number;

    constructor(chakra: Sequence2D) {
        this.chakra = chakra;
        this.size = chakra.getSize();
    }

    getChakra(): Sequence2D {
        return this.chakra;
    }

    getSize(): number {
        return this.size;
    }

    /*ToDo: implement this
    getSubChakra(subChakraIndex: number, divisions: number): Chakra {
        const subChakraSize = Math.floor(this.size / divisions);
        const subChakra: number[][] = Array.from({ length: subChakraSize }, () => Array(subChakraSize).fill(0));
        const fromLeft = (subChakraIndex % divisions) * subChakraSize;
        const fromTop = Math.floor(subChakraIndex / divisions) * subChakraSize;

        for (let i = 0; i < subChakraSize; i++) {
            for (let j = 0; j < subChakraSize; j++) {
                subChakra[i][j] = this.chakra.get(i + fromTop, j + fromLeft);
            }
        }
        return new Chakra(new Sequence(subChakra), subChakraSize);
    }
    */

    getUnit(i: number, j: number): Unit {
        assert(i >= 0 && i < this.size, `Invalid row index ${i}`);
        assert(j >= 0 && j < this.size, `Invalid column index ${j}`);
        return this.chakra.unitAt(i, j);
    }

    toString() {
        return this.chakra.toString();
    }

    
}