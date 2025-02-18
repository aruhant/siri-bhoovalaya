import { Word } from "./sequence.js";
import { FuzzySearch } from "./fuzzy_search.js";

export interface Dictionary {
    length(): number;
    max_length(): number;
    exact_match(word: Word): boolean;
    partial_match(word: Word, threshold: number): { word: Word, distance: number }[];
}
