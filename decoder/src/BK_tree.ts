import { Word } from "./sequence.js";
import { DistanceCalculator, BrahmiCustomEditDistance } from "./fuzzy_search.js";
import { Dictionary } from "./dictionary.js";
import { Logger } from "./utils/logger.js";
import { Encoding } from "./file_processor.js";
import { Script } from "./script.js";
import fs, { stat } from 'fs';

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
    toJsonObject(): any {
        const children = {};
        for (const distance in this.children) {
            if (this.children.hasOwnProperty(distance)) {
                children[distance] = this.children[distance].toJsonObject();
            }
            else {
                throw new Error('Error in toJsonObject')
            }
        }
        return {
            word: this.word.toEncodedString(),
            children
        };
    }
    static fromJsonObject(json: any): BKTreeNode {
        const node = new BKTreeNode(new Word(json.word));
        for (const distance in json.children) {
            if (json.children.hasOwnProperty(distance)) {
                node.children[distance] = BKTreeNode.fromJsonObject(json.children[distance]);
            }
            else {
                throw new Error('Error in fromJsonObject')
            }
        }
        return node;
    }
}

export class BKTree implements Dictionary {
    private root: BKTreeNode | null = null;
    private smallWords: Set<Word> = new Set();
    private distanceCalculator: DistanceCalculator;
    private size: number = 0;
    private longest: number = 0;
    private static readonly small_word_length: number = 3;

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
        if (word.length() <= BKTree.small_word_length) {
            this.smallWords.add(word);
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
        if (word.length() <= BKTree.small_word_length && this.smallWords.has(word)) {
            return [{ word, distance: 0 }];
        }
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
    closest_match(word: Word, maxEditDistance: number): { word: Word, distance: number } {
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


    toJsonObject() {
        if (!this.root) {
            return null;
        }
        return {
            nodes: this.root.toJsonObject(),
            size: this.size,
            longest: this.longest
        };
    }
    static fromJsonObject(json: any, distanceCalculator: DistanceCalculator): BKTree {
        const tree = new BKTree(distanceCalculator, []);
        tree.root = BKTreeNode.fromJsonObject(json.nodes);
        tree.size = json.size;
        tree.longest = json.longest;
        tree.smallWords = new Set(tree.gettAllWords().filter(word => word.length() <= BKTree.small_word_length));
        return tree;
    }

    static fromFile(file: string, distanceCalculator: DistanceCalculator): BKTree {
        const json = JSON.parse(fs.readFileSync(file, 'utf8'));
        return BKTree.fromJsonObject(json, distanceCalculator);
    }

    toFile(file: string): void {
        fs.writeFileSync(file, JSON.stringify(this.toJsonObject()), 'utf8');
    }

    getStats(): { stats: { nodes: number, height: number, branching: number, maxBranching: number }, branchStats: { [branching: number]: number } } {
        const branchStats = {
        }; // map of branching factor to number of nodes with that branching factor 


        const stats = {
            nodes: 0,
            leaves: 0,
            height: 0,
            branching: 0,
            maxBranching: 0
        };
        // Traverse the tree to get the number of nodes, depth, average branching factor,
        // and  the maximum branching factor
        const traverse = (node: BKTreeNode, depth: number): void => {
            stats.nodes++;
            stats.height = Math.max(stats.height, depth);
            const children = node.getChildren();
            stats.leaves += Object.keys(children).length === 0 ? 1 : 0;
            stats.branching += Object.keys(children).length;
            branchStats[Object.keys(children).length] = (branchStats[Object.keys(children).length] || 0) + 1;
            stats.maxBranching = Math.max(stats.maxBranching, Object.keys(children).length);
            for (const distance in children) {
                if (children.hasOwnProperty(distance)) {
                    traverse(children[distance], depth + 1);
                }
                else {
                    throw new Error('Error in getStats')
                }
            }
        };
        if (this.root) {
            traverse(this.root, 0);
        }
        stats.branching /= (stats.nodes - stats.leaves);
        return { stats, branchStats };
    }

}
