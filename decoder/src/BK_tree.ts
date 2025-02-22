import { Word } from "./sequence.js";
import { DistanceCalculator, CustomEditDistance } from "./fuzzy_search.js";
import { Dictionary } from "./dictionary.js";
import { Logger } from "./utils/logger.js";
import { Encoding } from "./file_processor.js";
import { Script } from "./script.js";

class BKTreeNode {
    word: Word;
    private children: { [distance: number]: BKTreeNode };

    constructor(word: Word) {
        this.word = word;
        this.children = {};
    }

    addChild(distance: number, word: Word): void {
        this.children[distance] = new BKTreeNode(word);
    }

    getChild(distance: number): BKTreeNode | null {
        return this.children[distance] != undefined ? this.children[distance] : null;

    }

    getChildren(): { [distance: number]: BKTreeNode } {
        return this.children;
    }
}

export class BKTree implements Dictionary {
    private root: BKTreeNode | null = null;
    private distanceCalculator: DistanceCalculator;
    private size: number = 0;
    private longest: number = 0;

    constructor(distanceCalculator: DistanceCalculator, words: Word[] = []) {
        this.distanceCalculator = distanceCalculator;
         for (const word of words) {
            this.add(word);
            Logger.progress(`Building BK-tree: ${Math.floor(100 * this.size / words.length)}%`);
        }
        Logger.infoBr(`BK-tree built with ${this.size} words`);
    }

    balance(distanceCalculator: DistanceCalculator, unbalanced_words: Word[]): BKTree {
        // ToDo: implement balancing
        return new BKTree(distanceCalculator, unbalanced_words);
    }

    add(word: Word): void {
        this.size++;
        if (word.length() > this.longest) {
            this.longest = word.length();
        }
        if (!this.root) {
            this.root = new BKTreeNode(word);
            return;
        }

        let node = this.root;
        while (node) {
            const dist = this.distanceCalculator.getDistance(word, node.word);
            if (dist === 0) {
                return; // Word already exists
            }
            const child = node.getChild(dist);
            if (!child) {
                node.addChild(dist, word);
                return;
            } else {
                node = child;
            }
        }
    }

    length(): number {
        return this.size;
    }

    max_length(): number {
        return this.longest;
    }

    exact_match(word: Word): boolean {
        return this.partial_match(word, 0).length > 0;
    }

    partial_match(word: Word, threshold: number): { word: Word, distance: number }[] {
        const results: { word: Word, distance: number }[] = [];
        const stack: { node: BKTreeNode; dist: number }[] = [];

        if (!this.root) {
            return results;
        }

        const initialDist = this.distanceCalculator.getDistance(this.root.word, word);
        //console.log(this.root.word.toEncodedString(), word.toEncodedString(), initialDist);
        stack.push({ node: this.root, dist: initialDist });
        //Logger.debugObject({  stack });
        //console.log(stack.length);
        while (stack.length > 0) {
            const { node, dist } = stack.pop(); 

            if (dist <= threshold) {
                results.push({ word: node.word, distance: dist });
            }

            const minDistance = Math.max(0, dist - threshold);
            const maxDistance = dist + threshold;

            const children = node.getChildren();
            for (const edgeDistance in children) {
                if (children.hasOwnProperty(edgeDistance)) {
                    const numEdgeDistance = parseInt(edgeDistance, 10);
                    if (numEdgeDistance >= minDistance && numEdgeDistance <= maxDistance) {
                        const childNode = children[numEdgeDistance];
                        const childDist = this.distanceCalculator.getDistance(childNode.word, word);
                        stack.push({ node: childNode, dist: childDist });
                    }
                }
                else {
                    throw new Error('Error in partial_match')
                }
            }
        }

        return results;
    }
    closest_match(word: Word, maxEditDistance: number): { word: Word, distance: number }{
        const results = this.partial_match(word, maxEditDistance);
        return results.reduce((best, result) => result.distance < best.distance ? result : best, results[0]) || null;
    }

    printTree(): void {
        if (!this.root) {
            console.log("Tree is empty");
            return;
        }

        const printNode = (node: BKTreeNode, depth: number, parent_distance: string): void => {
            console.log(`${' '.repeat(depth * 2)}${node.word.toEncodedString()} - ${parent_distance}`);
            const children = node.getChildren();
            for (const distance in children) {
                if (children.hasOwnProperty(distance)) {
                    printNode(children[distance], depth + 1, distance);
                }
                else {
                    throw new Error('Error in printTree')
                }
            }
        };

        printNode(this.root, 0, "[root]");
    }

    gettAllWords(): Word[] {
        return this.partial_match(new Word(""), this.longest).map((match) => match.word);
    }
}
