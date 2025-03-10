import { Sequence, Transposed, Word } from "./sequence.js";
import { Dictionary } from "./dictionary.js";
import { Logger } from "./utils/logger.js";
import humanizeDuration from "humanize-duration";
import assert from "assert";
import { BKTree } from "./BK_tree.js";
import { BrahmiDistanceCalculator } from "./fuzzy_search.js";
import { devanagari_script, kannada_script } from "./script.js";

export interface Segmenter {
    segment(text: Transposed): Word[];
}
// ToDo: trie-based prefix match along with BK-tree. and markers in BK-Tree to remember at each node, what each the previous iteration yielded to be used in the next iteration
export class Default_Segmenter {
    private readonly dictionary: Dictionary;
    // this is used during thorough check so as to not eliminate any possible word
    private readonly rigorousCheckCost: (segment: Word) => number;
    // this has a tighter threshold and is used to find the best match during an superficial scan
    private readonly superficialCheckCost: (segment: Word) => number;
    private readonly COST_OF_SEGMENTATION: number;
    private readonly BEGIN_RIGOROUS_SEGMENTATION_LENGTH: number;
    private readonly EXTRA_TOLERANCE_MAX_SIZE;

    constructor(dictionary: Dictionary, rigorousCheckCostFn?: (segment: Word) => number, 
    superficialCheckCostFn?: (segment: Word) => number,
    COST_OF_SEGMENTATION: number = 0.6 , BEGIN_RIGOROUS_SEGMENTATION: number = 10, EXTRA_TOLERANCE_MAX_SIZE: number = 2) {
        this.dictionary = dictionary;
        this.rigorousCheckCost = rigorousCheckCostFn || this.defaultRigorous;
        this.superficialCheckCost = superficialCheckCostFn || this.defaultSuperficial;
        this.COST_OF_SEGMENTATION = COST_OF_SEGMENTATION;
        this.BEGIN_RIGOROUS_SEGMENTATION_LENGTH = BEGIN_RIGOROUS_SEGMENTATION;
        this.EXTRA_TOLERANCE_MAX_SIZE = EXTRA_TOLERANCE_MAX_SIZE;
    }
// ToDo: everything should be in terms of confidennce levels which unifies length, cost/distance, and other factors
private defaultRigorous(segment: Word, _dictionary?: Dictionary): number {
    let max_edit_distance: number;
    const scale = 0.5 + 0.5/(1+0.04 * (segment.length()-1));
    if (segment.length() <= 3) {
        max_edit_distance = 0.5;
        //scale = 1;
    } else if (segment.length() < 6) {
        max_edit_distance = 2;
        //scale = 0.95;
    } else if (segment.length() < 10) {
        max_edit_distance = 3;
        //scale = 0.9;
    } else if (segment.length() < 20) {
        max_edit_distance = 4;
        //scale = 0.8;
    } else if (segment.length() < 30) {
        max_edit_distance = 5;
        //scale = 0.7;
    } else {
        max_edit_distance = 7;
        //scale = 0.6;
    }
    return (this.dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity) / scale;
    /*
    const match = dictionary.closest_match(segment, max_edit_distance);
    if (match != null) {
        Logger.debug(`Matched ${kannada_script.wordToScript(segment)} to ${kannada_script.wordToScript(match.word)} with distance ${match.distance}`);
    }
    return (match?.distance ?? Infinity) / 0.7;
    */
}
private defaultSuperficial(segment: Word, _dictionary?: Dictionary): number {
    let max_edit_distance: number;
    const scale = 0.5 + 0.5/(1+0.04 * (segment.length()-1));
    if (segment.length() < 10) {
        max_edit_distance = 0;
    } else if (segment.length() < 20) {
        max_edit_distance = 1;
        //scale = 0.8;
    } else if (segment.length() < 30) {
        max_edit_distance = 2;
        //scale = 0.7;
    } else if (segment.length() < 40) {
        max_edit_distance = 3;
        //scale = 0.6;
    }
    else {
        max_edit_distance = 4.5;
    }
    return (this.dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity) / scale;
    /*
    const match = dictionary.closest_match(segment, max_edit_distance);
    if (match != null) {
        Logger.debug(`Matched ${kannada_script.wordToScript(segment)} to ${kannada_script.wordToScript(match.word)} with distance ${match.distance}`);
    }
    return (match?.distance ?? Infinity) / 0.7;
    */
}


segment(text: Transposed): Word[] {
    const startTime = Date.now();
    const segment =  this._segment(Word.fromSequence(text));
    Logger.info(`Segmentation took ${humanizeDuration(Date.now() - startTime, { round: true })}`);
    return segment;
}

private _segment(word: Word, upper_limit_length = Infinity): Word[] {
    const length = word.length();
    
    if (length < this.BEGIN_RIGOROUS_SEGMENTATION_LENGTH) {
        return this.rigorousSegment(word);
    }

    
    // Maximum window size to consider
    const maxWordSize = Math.min(this.dictionary.max_length()+ this.EXTRA_TOLERANCE_MAX_SIZE, length, upper_limit_length);
    
    // Find best match by sliding window approach
    let bestWindow: { start: number, end: number, cost: number } | null = null;
    
    // Try different window sizes, starting with the largest
    
    for (let windowSize = maxWordSize; windowSize > this.BEGIN_RIGOROUS_SEGMENTATION_LENGTH; windowSize--) {
        Logger.debug(`Trying window size ${windowSize}`);
        let lowestCost = Infinity;
        // Start index of best match
        let bestStart = -1;
        
        // Slide window across text
        for (let i = 0; i <= length - windowSize; i++) {
            const candidate = word.slice(i, i + windowSize);
            const cost = this.superficialCheckCost(candidate);
            
            if (cost < lowestCost) {
                lowestCost = cost;
                bestStart = i;
            }
        }
    
        
        // If we found a reasonable match
        assert(!(lowestCost === Infinity && bestStart >= 0));
        assert(!(lowestCost < Infinity && bestStart < 0));
        if (lowestCost < Infinity && bestStart >= 0) {
            bestWindow = { 
                start: bestStart, 
                end: bestStart + windowSize, 
                cost: lowestCost 
            };

        Logger.debug(`Match found. Best window: ${bestWindow.start} - ${bestWindow.end} with cost ${bestWindow.cost}`);
            // Stop at first good match with largest window size
            break;
        }
    }
    
    // If no match found, use rigorous segmentation
    if (!bestWindow) {
        return this.rigorousSegment(word);
    }
    
    // Refine match by trimming
    let { start, end, cost } = bestWindow;
    const MARGIN = 1;
    let misses = 0;
    // Trim from right
    while (end > start + 1) {
        const trimmedCandidate = word.slice(start, end - 1);
        const trimmedCost = this.superficialCheckCost(trimmedCandidate);
        console.log(`${kannada_script.wordToScript(word)} has been trimmed to ${kannada_script.wordToScript(trimmedCandidate)}`);
        Logger.debug(`Old cost=${cost}, new cost=${trimmedCost}`);
        if (trimmedCost <= cost) {
        cost = trimmedCost;
        misses = 0;
        } else {
        misses++;
        if (misses >= MARGIN) {
            break;}
        }
        end--;
    }
    // Trim from left
    while (end > start + 1) {
        const trimmedCandidate = word.slice(start + 1, end);
        const trimmedCost = this.superficialCheckCost(trimmedCandidate);
        
        if (trimmedCost <= cost) {
            cost = trimmedCost;
            start++;
        } else {
            break;
        }
    }
    
    // Get our best refined match
    const bestMatchWord = word.slice(start, end);
    console.log(`bestWindow.start = ${bestWindow.start}, bestWindow.end = ${bestWindow.end}`);
    // Recursively segment left and right parts
    const leftSegments = start > 0 ? 
        this._segment(word.slice(0, start), bestWindow.end - bestWindow.start) : [];
        
    const rightSegments = end < length ? 
        this._segment(word.slice(end, length), bestWindow.end - bestWindow.start) : [];
    
    // Combine all segments
    return [...leftSegments, bestMatchWord, ...rightSegments];
}

private rigorousSegment(text: Transposed): Word[] {
    const conjunct_word = Word.fromSequence(text);
    const n = conjunct_word.length();
    const dp: number[] = Array(n + 1).fill(Infinity);
    const predecessor: number[] = Array(n + 1).fill(-1);
    dp[0] = 0; // Base case: cost of segmenting empty prefix is 0
    const startTime = Date.now();
    for (let i = 1; i <= n; i++) {
                
    Logger.progress(`Segmenting ${ Math.floor(100 * (i*(i+1) )/ (n*(n+1)))}%`);
    const elapsedTime = (Date.now() - startTime) ; // in seconds
    const progress = (i*(i+1) )/ (n*(n+1));
    const estimatedTotalTime = elapsedTime / progress;
    const remainingTime = estimatedTotalTime - elapsedTime;
    Logger.progress(`Elapsed : ${ humanizeDuration (elapsedTime, { round: true })},  Remaining : ${ humanizeDuration (remainingTime, { round: true })}`);

        for (let j = Math.max(0, i - this.BEGIN_RIGOROUS_SEGMENTATION_LENGTH+1); j < i; j++) {
            const segment = conjunct_word.slice(j, i);
            const cost = this.rigorousCheckCost(segment);
            if (dp[j] !== Infinity && dp[j] + cost + this.COST_OF_SEGMENTATION < dp[i]) {
                dp[i] = dp[j] + cost + this.COST_OF_SEGMENTATION;
                predecessor[i] = j;
            }
        }
    }

    // Backtrack to reconstruct the segmentation
    const segments: Word[] = [];
    let currentIndex = n;
    while (currentIndex > 0) {
        const startIndex = predecessor[currentIndex];
        segments.unshift(conjunct_word.slice(startIndex, currentIndex));
        currentIndex = startIndex;
    }

    return segments;
}
}

function testSegmenter() {
    const dictionary = new BKTree(new BrahmiDistanceCalculator(), ["hello", "world", "th", "algr", "oithm" ,"this", "is", "a", "test", "of", "segmentation", "algorithm"].map((word) => new Word(word.toUpperCase())));
    const segmenter = new Default_Segmenter(dictionary);
    const text = "thsisatestofsegmentationalgkth".split("").map(c => c.toLocaleUpperCase()).join("");
    const segments = segmenter.segment(new Transposed(new Sequence(text)));
    console.log(segments.map(segment => segment.toEncodedString()).join("\n"));
}
//testSegmenter();


