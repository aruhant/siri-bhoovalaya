import { Sequence, Word } from "./sequence.js";
import * as fs from 'fs';
import { Script } from "./script.js";

enum Encoding {
    numerical,
    encoded_string,
    script
}

export class SequenceFile {
    static read(filename: string, encoding: Encoding = Encoding.encoded_string, script?: Script, delimiter?: string): Sequence {
        let data: string = fs.readFileSync(filename, 'utf8');

        switch (encoding) {
            case Encoding.numerical:
                if (delimiter == undefined) {
                    delimiter = ',';
                }
                return Sequence.fromNumbers((data.trim().split(delimiter)).map(Number));
            case Encoding.script:
                if (!script) {
                    throw new Error("Script is required for script encoding");
                }
                return script.scriptToWord(delimiter != undefined ? data.trim().split(delimiter).join('') : data.trim());

            case Encoding.encoded_string:
                return new Word(delimiter != undefined ? data.split(delimiter).join('') : data);
            default:
                throw new Error("Invalid encoding");
        }
    }
    static write(filename: string, sequence: Sequence, encoding: Encoding = Encoding.encoded_string, script?: Script, delimiter?: string) {
        let data: string;
        switch (encoding) {
            case Encoding.numerical:
                if (delimiter == undefined) {
                    delimiter = ',';
                }
                data = sequence.toNumbers().join(delimiter);
                break;
            case Encoding.script:
                if (!script) {
                    throw new Error("Script is required for script encoding");
                }
                data = delimiter != undefined ? script.wordToScript(Word.fromSequence(sequence)).split("").join(delimiter) : script.wordToScript(Word.fromSequence(sequence));
                break;
            case Encoding.encoded_string:
                data = delimiter != undefined ? sequence.getEncodedString().split("").join(delimiter) : sequence.getEncodedString();
                break;
            default:
                throw new Error("Invalid encoding");
        }
        fs.writeFileSync(filename, data);
    }


}