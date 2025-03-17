/*
Copyright (C) 2025 Aruhant Mehta
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import { Sequence, Word } from "./sequence.js";
import * as fs from 'fs';
import { Script } from "./script.js";

export enum Encoding {
    numerical,
    encoded_string,
    script
}

export class SequenceFile {
    static readList(filename: string, encoding: Encoding = Encoding.encoded_string, script?: Script, inline_delimiter?: string, endline_delimeter = "\n"): Sequence[] {
        let read: string[] = fs.readFileSync(filename, 'utf8').split(endline_delimeter).filter(line => line.trim() != '');
        switch (encoding) {
            case Encoding.numerical:
                inline_delimiter = inline_delimiter ?? ',';
                return read.map(line => Sequence.fromNumbers(line.trim().split(inline_delimiter).map(Number)));
            case Encoding.script:
                if (script == undefined) {
                    throw new Error("Script is required to read Sequence from script encoded file");
                }
                inline_delimiter = inline_delimiter ?? ' ';
                return read.map(line => script.scriptToSequence(line.trim().split(inline_delimiter)));
            case Encoding.encoded_string:
                inline_delimiter = inline_delimiter ?? '';
                return read.map(line => new Sequence(line.trim().split(inline_delimiter).join('')));

            default:
                throw new Error("Invalid encoding to read Sequence from file");
        }
    }
    static writeList(filename: string, sequence: Sequence[], encoding: Encoding = Encoding.encoded_string, script?: Script, inline_delimiter?: string, endline_delimeter = "\n") {
        let toWrite: string[];
        switch (encoding) {
            case Encoding.numerical:
                if (inline_delimiter == undefined) {
                    inline_delimiter = ',';
                }
                toWrite = sequence.map(seq => seq.toNumbers().join(inline_delimiter));
                break;
            case Encoding.script:
                if (!script) {
                    throw new Error("Script is required to write Sequence as script encoded file");
                }
                inline_delimiter = inline_delimiter ?? ' ';
                toWrite = sequence.map(seq => script.sequenceToScript(seq).join(inline_delimiter));
                break;
            case Encoding.encoded_string:
                inline_delimiter = inline_delimiter ?? '';
                toWrite = sequence.map(seq => seq.toEncodedString().split("").join(inline_delimiter));
                break;
            default:
                throw new Error("Invalid encoding to write Sequence to file");
        }
        fs.writeFileSync(filename, toWrite.join(endline_delimeter));
    }
    static readLine(filename: string, encoding: Encoding = Encoding.encoded_string, script?: Script, inline_delimiter?: string): Sequence {
        return SequenceFile.readList(filename, encoding, script, inline_delimiter)[0];
}
    static writeLine(filename: string, sequence: Sequence, encoding: Encoding = Encoding.encoded_string, script?: Script, inline_delimiter?: string) {
        SequenceFile.writeList(filename, [sequence], encoding, script, inline_delimiter);
    }
}

export class WordFile {
    static readList(filename: string, encoding: Encoding = Encoding.encoded_string, script?: Script, inline_delimiter?: string, endline_delimeter = "\n"): Word[] {
        let read: string[] = fs.readFileSync(filename, 'utf8').split(endline_delimeter).filter(line => (line.trim() !== '' && line.length > 0));
        switch (encoding) {
            case Encoding.numerical:
                inline_delimiter = inline_delimiter ?? ',';
                return read.map(line => Word.fromNumbers(line.trim().split(inline_delimiter).map(Number)));
            case Encoding.script:
                if (script == undefined) {
                    throw new Error("Script is required to read Word from script encoded file");
                }
                inline_delimiter = inline_delimiter ?? '';
                return read.map(line => script.scriptToWord(line.trim().split(inline_delimiter).join('')));
            case Encoding.encoded_string:
                inline_delimiter = inline_delimiter ?? '';
                return read.map(line => new Word(line.trim().split(inline_delimiter).join('')));

            default:
                throw new Error("Invalid encoding to read Word from file");
        }
    }
    static writeList(filename: string, words: Word[], encoding: Encoding = Encoding.encoded_string, script?: Script, inline_delimiter?: string, endline_delimeter = "\n") {
        let toWrite: string[];
        switch (encoding) {
            case Encoding.numerical:
                if (inline_delimiter == undefined) {
                    inline_delimiter = ',';
                }
                toWrite = words.map(word => word.toNumbers().join(inline_delimiter));
                break;
            case Encoding.script:
                if (!script) {
                    throw new Error("Script is required to write Word as script encoded file");
                }
                inline_delimiter = inline_delimiter ?? '';
                toWrite = words.map(word => script.wordToScript(word).split("").join(inline_delimiter));
                break;
            case Encoding.encoded_string:
                inline_delimiter = inline_delimiter ?? '';
                toWrite = words.map(word => word.toEncodedString().split("").join(inline_delimiter));
                break;
            default:
                throw new Error("Invalid encoding to write Word to file");
        }
        fs.writeFileSync(filename, toWrite.join(endline_delimeter));
    }
    static readLine(filename: string, encoding: Encoding = Encoding.encoded_string, script?: Script, inline_delimiter?: string): Word {
        return WordFile.readList(filename, encoding, script, inline_delimiter)[0];
    }
    static writeLine(filename: string, word: Word, encoding: Encoding = Encoding.encoded_string, script?: Script, inline_delimiter?: string) {
        WordFile.writeList(filename, [word], encoding, script, inline_delimiter);
    }
}



