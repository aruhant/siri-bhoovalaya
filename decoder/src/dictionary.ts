/*
Copyright (C) 2025 Aruhant Mehta
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
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
