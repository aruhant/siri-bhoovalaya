import { Word } from "./sequence.js";
import {  } from "./fuzzy_search.js";

export interface Dictionary {
    length(): number;
    max_length(): number;
    exact_match(word: Word): boolean;
    partial_match(word: Word, threshold: number): { word: Word, distance: number }[];
    closest_match(word: Word, maxEditDistance: number): { word: Word, distance: number } | null;
    gettAllWords(): Word[];
}
