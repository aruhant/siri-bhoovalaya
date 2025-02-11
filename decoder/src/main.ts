import { Chakra } from "./chakra.js";
import { Sequence2D, SequenceFile, Word } from "./sequence.js";
import { Logger } from "./utils/logger.js";
import { 
  BandhaFile} from "./bandha.js";

// const program = require('commander');
import { Command } from 'commander';
import { devanagari_script } from "./script.js";
import * as fs from 'fs';
import * as path from 'path';



interface ProgramOptions {
  output?: string;
  chakra?: string;
  bandha?: string;
  script?: string;
}

const program = new Command();

program
  .option('-c, --chakra <chakra>', 'Chakra file')
  .option('-b, --bandha <bandha>', 'Bandha file')
  .option('-s, --script <script>', 'Script file')
  .option('-o, --output <output>', 'Output file');

program.parse(process.argv);

const options: ProgramOptions = program.opts();

if (!options.chakra) {
  Logger.error("Chakra file is required");
  program.outputHelp();
  process.exit(1);
}


if (options.chakra) {
  Logger.infoBr(`Chakra file: ${options.chakra}`);
}
if (options.bandha) {
  Logger.infoBr(`Bandha file: ${options.bandha}`);
}
if (options.script) {
  Logger.infoBr(`Script file: ${options.script}`);
} 
if (options.output) {
  Logger.infoBr(`Output file: ${options.output}`);
}






/*
let chakra = new Chakra(new Sequence2D(SequenceFile.readNumerical(options.chakra)));
//Logger.info(chakra.toString());
//let bandha = BandhaGenerator.patternGenerator(27,1,1)
//BandhaFile.writePairSeperatedBandha("./data/chakra_bandha.txt", bandha);
let bandha = BandhaFile.readPairSeperatedBandha(options.bandha);
Logger.info(bandha.toString());
let result = bandha.apply(chakra);
Logger.info(result.toString());
//console.log(devanagari_script);
*/

/*
let script = devanagari_script;
let word = Word.fromNumbers([43,1,  13, 3, 30, 13, 4, 62,40, 54,3])
Logger.info(script.wordToScript(word));
//Logger.info(script.sequenceToScript(word));

Logger.info(script.scriptToWord("अ...खीkख्घoआाकोो...तंश").toString());
Logger.info(script.scriptToWord("तळााग्ळिःड्राा").toString());
//  now do हम​
Logger.info(script.scriptToWord("मह​").toString());


*/
const dictionaryContent = fs.readFileSync(options.script, 'utf-8');
const words = dictionaryContent.split(',').map(word => word.trim()).filter(word => word.length > 0);

const encodedWords = words.map(word => devanagari_script.scriptToWord(word));
const decodedWords = encodedWords.map(word => devanagari_script.wordToScript(word));

// compare words and decodedWords. if there is a mismatch, log the word and decodedWord and the word doesnt incluude one of the ignoreCharacters so as to not log the same error multiple times
for (let i = 0; i < words.length; i++) {
  if (words[i] !== decodedWords[i] && !words[i].split('').some(char => devanagari_script.ignoreCharacters.includes(char))) {
    Logger.warn(`Mismatch: ${words[i]} => ${decodedWords[i]}`);
  }
}

fs.writeFileSync(options.output, decodedWords.join(',\n'));
