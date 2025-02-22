import { BKTree} from "./BK_tree.js";
import { CustomEditDistance } from "./fuzzy_search.js";
import { Word } from "./sequence.js";



    // Create a BK-Tree with the custom edit distance

    // Add words to the tree
    const words = ["book", "co", "bot", "books", "cake", "boo", "cape", "cart", "boon", "cook", "bone"].map((word) => new Word(word.toUpperCase()));
    const bkTree = new BKTree(new CustomEditDistance(), words);
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
    const bkTreeNew = new BKTree(new CustomEditDistance(), newWords);

    const searchWordNew = new Word("APPL");
    const maxDistanceNew = 1;
    const matchesNew = bkTreeNew.partial_match(searchWordNew, maxDistanceNew);
    console.log(`Partial matches for "${searchWord.toEncodedString()}" (max distance ${maxDistanceNew}):`, matchesNew.map((match) => match.word.toEncodedString()).join(", "));

    const closestNew = bkTreeNew.closest_match(searchWordNew, maxDistanceNew);
    console.log("Closest match", closestNew?.word.toEncodedString());

    // More examples with standard edit distance

    const moreWords = ["hello", "help", "hel", "helmetS", "hero", "heron", "hill"].map((word) => new Word(word.toUpperCase()));
    const bkTreeMore = new BKTree(new CustomEditDistance(), moreWords);


    const searchWordMore = new Word("HEL");
    const maxDistanceMore = 3;
    const matchesMore = bkTreeMore.partial_match(searchWordMore, maxDistanceMore);
    console.log(`Partial matches for "${searchWord.toEncodedString()}" (max distance ${maxDistanceMore}):`, matchesMore.map((match) => match.word.toEncodedString()).join(", "));

    const closestMore = bkTreeMore.closest_match(searchWordMore, maxDistanceMore);
    console.log("Closest match", closestMore?.word.toEncodedString());

