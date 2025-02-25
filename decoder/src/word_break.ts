import { Transposed, Word } from "./sequence.js";
import { Dictionary } from "./dictionary.js";
import { Logger } from "./utils/logger.js";

export class Segmenter {
    private dictionary: Dictionary;
    private segmentCostFn: (segment: Word, dictionary: Dictionary) => number;
    private COST_OF_SEGMENTATION: number;

    constructor(dictionary: Dictionary, segmentCostFn?: (segment: Word, dictionary: Dictionary) => number, COST_OF_SEGMENTATION: number = 0.1) {
        this.dictionary = dictionary;
        this.segmentCostFn = segmentCostFn || this.defaultSegmentCost;
        this.COST_OF_SEGMENTATION = COST_OF_SEGMENTATION;
    }

    private defaultSegmentCost(segment: Word, dictionary: Dictionary): number {
        let max_edit_distance: number;
        if (segment.length() <= 3) {
            max_edit_distance = 0.5;
            return dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity;
        } else if (segment.length() < 6) {
            max_edit_distance = 2;
            return (dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity) / 0.95;
        } else if (segment.length() < 10) {
            max_edit_distance = 3;
            return (dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity) / 0.9;
        } else if (segment.length() < 20) {
            max_edit_distance = 4;
            return (dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity) / 0.8;
        } else if (segment.length() < 30) {
            max_edit_distance = 5;
            return (dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity) / 0.7;
        } else {
            max_edit_distance = 6;
            return (dictionary.closest_match(segment, max_edit_distance)?.distance ?? Infinity) / 0.6;
        }
    }

    public segment(text: Transposed): Word[] {
        const conjunct_word = Word.fromSequence(text);
        const n = conjunct_word.length();
        const dp: number[] = Array(n + 1).fill(Infinity);
        const predecessor: number[] = Array(n + 1).fill(-1);
        dp[0] = 0; // Base case: cost of segmenting empty prefix is 0
        const startTime = Date.now();
        for (let i = 1; i <= n; i++) {
            Logger.progress(`Segmenting ${Math.floor(100 * (i * (i + 1)) / (n * (n + 1)))}%`);
            const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
            const progress = (i * (i + 1)) / (n * (n + 1));
            const estimatedTotalTime = elapsedTime / progress;
            const remainingTime = estimatedTotalTime - elapsedTime;
            Logger.progress(`Elapsed Time: ${elapsedTime.toFixed(2)}s, Estimated Remaining Time: ${remainingTime.toFixed(2)}s`);
            for (let j = 0; j < i; j++) {
                const segment = conjunct_word.slice(j, i);
                const cost = this.segmentCostFn(segment, this.dictionary);
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


