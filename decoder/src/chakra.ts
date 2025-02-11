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
        return this.chakra.getUnit(i, j);
    }

    toString() {
        return this.chakra.toString();
    }

    
}