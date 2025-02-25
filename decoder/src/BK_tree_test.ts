import { start } from "repl";
import { BKTree } from "./BK_tree.js";
import { Encoding, WordFile } from "./file_processor.js";
import { BrahmiCustomEditDistance } from "./fuzzy_search.js";
import { devanagari_script, kannada_script } from "./script.js";
import { Word } from "./sequence.js";
import { Logger } from "./utils/logger.js";

function matchTest() {
    // Create a BK-Tree with the custom edit distance

    // Add words to the tree
    const words = ["book", "co", "bot", "books", "cake", "boo", "cape", "cart", "boon", "cook", "bone"].map((word) => new Word(word.toUpperCase()));
    const bkTree = new BKTree(new BrahmiCustomEditDistance(), words);
    //bkTree.printTree();
    // Perform a partial match search
    const searchWord = new Word("BOO");
    const maxDistance = 2;
    const matches = bkTree.partial_match(searchWord, maxDistance);
    console.log(`Partial matches for "${searchWord.toEncodedString()}" (max distance ${maxDistance}):`, matches.map((match) => match.word.toEncodedString()).join(", "));

    const closest = bkTree.closest_match(searchWord, maxDistance);
    console.log("Closest match", closest?.word.toEncodedString());

    // Another example with a different set of words
    const newWords = ["apple", "apply", "apples", "ape", "apex", "maple", "ample", "bppl", "abpl", "ppl", "app", "appl"].map((word) => new Word(word.toUpperCase()));
    const bkTreeNew = new BKTree(new BrahmiCustomEditDistance(), newWords);

    const searchWordNew = new Word("APPL");
    const maxDistanceNew = 1;
    const matchesNew = bkTreeNew.partial_match(searchWordNew, maxDistanceNew);
    console.log(`Partial matches for "${searchWord.toEncodedString()}" (max distance ${maxDistanceNew}):`, matchesNew.map((match) => match.word.toEncodedString()).join(", "));

    const closestNew = bkTreeNew.closest_match(searchWordNew, maxDistanceNew);
    console.log("Closest match", closestNew?.word.toEncodedString());

    // More examples with standard edit distance

    const moreWords = ["hello", "help", "hel", "helmetS", "hero", "heron", "hill"].map((word) => new Word(word.toUpperCase()));
    const bkTreeMore = new BKTree(new BrahmiCustomEditDistance(), moreWords);


    const searchWordMore = new Word("HEL");
    const maxDistanceMore = 3;
    const matchesMore = bkTreeMore.partial_match(searchWordMore, maxDistanceMore);
    console.log(`Partial matches for "${searchWord.toEncodedString()}" (max distance ${maxDistanceMore}):`, matchesMore.map((match) => match.word.toEncodedString()).join(", "));

    const closestMore = bkTreeMore.closest_match(searchWordMore, maxDistanceMore);
    console.log("Closest match", closestMore?.word.toEncodedString());

}

function seriaizeTest() {
    const words = ["book", "co", "bot", "books", "cake", "boo", "cape", "cart", "boon", "cook", "bone"].map((word) => new Word(word.toUpperCase()));
    const bkTree = new BKTree(new BrahmiCustomEditDistance(), words);
    const json = bkTree.toJsonObject();
    console.log(json);
    const bkTreeNew = BKTree.fromJsonObject(json, new BrahmiCustomEditDistance());
    console.log(bkTreeNew);
}

function fileTest(inputFile: string = "./data/modified_dictionary_out.txt", saveFile: string = "bk_tree.json", encoding: Encoding = Encoding.script, script = kannada_script) {
    const words = WordFile.readList(inputFile, encoding, script);
    const bkTree = new BKTree(new BrahmiCustomEditDistance(), words.sort(() => Math.random() - 0.5));
    bkTree.toFile(saveFile);
    const bkTreeNew = BKTree.fromFile(saveFile, new BrahmiCustomEditDistance());
    console.log(bkTreeNew);
    const stats = bkTreeNew.getStats();
    Logger.debugObject(stats);
    // bkTreeNew.printTree();
}
/*
function findBestTree(inital?: string | Word[], saveFile: string = "bk_tree_best.json") {
    // correct implementation
    let bestTree: BKTree;
    let words: Word[];
    if (Array.isArray(inital) && inital.every(item => item instanceof Word)) {
        bestTree = new BKTree(new CustomEditDistance(), inital);
        words = inital;
    }
    else if (typeof inital === "string") {
        bestTree = BKTree.fromFile(inital, new CustomEditDistance());
        words = bestTree.gettAllWords();
    }
    else {
        bestTree = BKTree.fromFile(saveFile, new CustomEditDistance());
        words = bestTree.gettAllWords();
    }

    let bestStats = bestTree.getStats();
    let maxBranchingFactor = bestStats.stats.branching;
    Logger.info(`Starting with best tree with branching factor ${maxBranchingFactor}`);
    for (let i = 0; i < 1000; i++) {
        const bkTree = new BKTree(new CustomEditDistance(), words.sort(() => Math.random() - 0.5));
        const stats = bkTree.getStats();
        if (stats.stats.branching > maxBranchingFactor) {
            Logger.infoBr(`New tree has better branching factor ${stats.stats.branching} than previous best ${maxBranchingFactor}`);
            maxBranchingFactor = stats.stats.branching;
            bestTree = bkTree;
            bestStats = stats;
            bestTree.toFile("bk_tree_best.json");
        }
        Logger.info(`Iteration ${i}, height ${stats.stats.height}, branching factor ${stats.stats.branching}`);
        Logger.info(`${JSON.stringify(stats.branchStats)}`);
    }
    Logger.debugObject(bestTree.getStats());

    Logger.info(`Best tree saved to bk_tree_best.json with branching stats ${bestStats}`);
}
*/
// this is like the above function but instead uses treeSpeed to compare two trees
function findBestTree(inital?: string | Word[], saveFile: string = "bk_tree_best.json") {
    // correct implementation
    let bestTree: BKTree;
    let words: Word[];
    if (Array.isArray(inital) && inital.every(item => item instanceof Word)) {
        bestTree = new BKTree(new BrahmiCustomEditDistance(), inital);
        words = inital;
    }
    else if (typeof inital === "string") {
        bestTree = BKTree.fromFile(inital, new BrahmiCustomEditDistance());
        words = bestTree.gettAllWords();
    }
    else {
        bestTree = BKTree.fromFile(saveFile, new BrahmiCustomEditDistance());
        words = bestTree.gettAllWords();
    }

    let bestSpeed = treeSpeed(bestTree);
    Logger.info(`Starting with best tree with speed ${bestSpeed}ms`);
    for (let i = 1; i < 1000; i++) {
        const current_tree = new BKTree(new BrahmiCustomEditDistance(), words.sort(() => Math.random() - 0.5));
        const current_speed = treeSpeed(current_tree);
        if (current_speed < bestSpeed) {
            Logger.info(`New tree is faster with speed ${current_speed}ms than previous best ${bestSpeed}ms`);
            bestSpeed = current_speed;
            bestTree = current_tree;
            bestTree.toFile("bk_tree_best.json");
        }
        Logger.info(`Iteration ${i}, speed ${current_speed}ms`);
        const stats = current_tree.getStats();
        Logger.info(`Iteration ${i}, height ${stats.stats.height}, branching factor ${stats.stats.branching}, height ${stats.stats.height}`);

    }
    Logger.debugObject(bestTree.getStats());
    Logger.info(`Best tree saved to bk_tree_best.json with speed ${bestSpeed}ms`);
}

const randomWords: Word[] = [];
const maxDistance: number[] = [];
for (let i = 0; i < 120; i++) {
    // we will 3 words each ranging from length 1 to 40
    const currentWordLength = Math.floor(i / 3) + 1;
    const word = [];
    for (let j = 0; j < currentWordLength; j++) {
        word.push(Math.floor(Math.random() * 64) + 1);
    }
    randomWords.push(Word.fromNumbers(word));
    if (currentWordLength < 3) {
        maxDistance.push(1);
    }
    else if (currentWordLength < 6) {
        maxDistance.push(2);
    } else if (currentWordLength < 10) {
        maxDistance.push(3);
    } else if (currentWordLength < 20) {
        maxDistance.push(4);
    }
    else if (currentWordLength < 30) {
        maxDistance.push(5);
    }
    else {
        maxDistance.push(6);
    }
}
Logger.debugObject(randomWords);
Logger.debugObject(maxDistance);


function treeSpeed(tree: BKTree): number {

    const start = Date.now();
    for (let i = 0; i < 120; i++) {
        tree.partial_match(randomWords[i], maxDistance[i]);
    }
    const end =  Date.now() - start;
    return end;

}
//Logger.debugObject(BKTree.fromFile("bk_tree_best.json", new CustomEditDistance()).getStats());
//findBestTree();
