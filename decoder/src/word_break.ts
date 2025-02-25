import { Encoding, WordFile } from "./file_processor.js";
import { Transposed, Word } from "./sequence.js";
import { levenshteinDistance } from "./utils/levenshtein.js";
import { Dictionary } from "./dictionary.js";
import { devanagari_script } from "./script.js";
import { Logger } from "./utils/logger.js";

/**
 * Function to calculate the cost of a segment based on edit distance to lexicon.
 * This can be thought of as a calculation of unlikelyhood of the segment being a word.
 * It considers edit distance to the closest word in the dictionary and length of the segment.
 */
function segmentCost(segment: Word, dictionary: Dictionary): number {
    let max_edit_distance:number;
    if (segment.length()<3) {
        max_edit_distance = 0;
        return dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity;
    }
    else if (segment.length()<6) {
        max_edit_distance = 2;
        return (dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity) / 0.9;

    }
    else if (segment.length()<10) {
        max_edit_distance = 3;
        return (dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity) / 0.8;

    }
    else if (segment.length()<20) {
        max_edit_distance = 4;
        return (dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity) / 0.6;

    }
    else if (segment.length()<30) {
        max_edit_distance = 5;
        return (dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity) / 0.5;

    }
    else {
        max_edit_distance = 6;
        return (dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity) / 0.4;
    }

    
}

export function segmentStringWithEditDistanceCost(text: Transposed, dictionary: Dictionary): Word[] {
    const conjunct_word = Word.fromSequence(text);
    const n = conjunct_word.length();
    const dp: number[] = Array(n + 1).fill(Infinity);
    const predecessor: number[] = Array(n + 1).fill(-1);
    dp[0] = 0; // Base case: cost of segmenting empty prefix is 0
    const startTime = Date.now();
    for (let i = 1; i <= n; i++) {
        
        Logger.progress(`Segmenting ${ Math.floor(100 * (i*(i+1) )/ (n*(n+1)))}%`);
        const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
        const progress = (i*(i+1) )/ (n*(n+1));
        const estimatedTotalTime = elapsedTime / progress;
        const remainingTime = estimatedTotalTime - elapsedTime;
        Logger.progress(`Elapsed Time: ${elapsedTime.toFixed(2)}s, Estimated Remaining Time: ${remainingTime.toFixed(2)}s`);




        for (let j = 0; j < i; j++) {
            const segment = conjunct_word.slice(j, i);
            const cost = segmentCost(segment, dictionary);
            
            if (dp[j] !== Infinity && dp[j] + cost < dp[i]) {
                dp[i] = dp[j] + cost;
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
