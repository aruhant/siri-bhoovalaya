import { Encoding, WordFile } from "./file_processor.js";
import { Transposed, Word } from "./sequence.js";
import { levenshteinDistance } from "./utils/levenshtein.js";
import { Dictionary } from "./dictionary.js";
import { devanagari_script } from "./script.js";
import { Logger } from "./utils/logger.js";
import humanizeDuration from "humanize-duration";

/**
 * Function to calculate the cost of a segment based on edit distance to lexicon.
 * Cost is the minimum Levenshtein distance to any word in the lexicon.
 */
function segmentCost(segment: Word, dictionary: Dictionary): number {
    let max_edit_distance:number;
    if (segment.length()<6) {
        max_edit_distance = 2;
    }
    else if (segment.length()<10) {
        max_edit_distance = 3;
    }
    else if (segment.length()<20) {
        max_edit_distance = 4;
    }
    else if (segment.length()<30) {
        max_edit_distance = 5;
    }
    else {
        max_edit_distance = 6;
    }

    return dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity;
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
        const elapsedTime = (Date.now() - startTime) ; // in seconds
        const progress = (i*(i+1) )/ (n*(n+1));
        const estimatedTotalTime = elapsedTime / progress;
        const remainingTime = estimatedTotalTime - elapsedTime;
        Logger.progress(`Elapsed : ${ humanizeDuration (elapsedTime, { round: true })},  Remaining : ${ humanizeDuration (remainingTime, { round: true })}`);




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
