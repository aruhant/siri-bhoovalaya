import { Chakra } from "./chakra.js";
import { Sequence2D, Word } from "./sequence.js";
import { Logger } from "./utils/logger.js";
import { 
  BandhaFile} from "./bandha.js";

// const program = require('commander');
import { Command } from 'commander';
import { devanagari_script } from "./script.js";
import * as fs from 'fs';
import * as path from 'path';



interface ProgramOptions {
  chakra?: string;
  bandha?: string;
  script?: string;
}

const program = new Command();

program
  .option('-c, --chakra <chakra>', 'Chakra file')
  .option('-b, --bandha <bandha>', 'Bandha file')
  .option('-s, --script <script>', 'Script file');

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
let word = Word.fromNumbers([43,1,  13, 3, 30, 13, 4, 62,40, 54,3])
Logger.info(script.wordToScript(word));
//Logger.info(script.sequenceToScript(word));

Logger.info(script.scriptToWord("अ...खीkख्घoआाकोो...तळश").toString());
Logger.info(script.scriptToWord("तळााग्ळिःड्राा").toString());
*/


const dictionaryContent = fs.readFileSync('dictionary.txt', 'utf-8');
const words = dictionaryContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

const encodedWords = words.map(word => devanagari_script.scriptToWord(word));

fs.writeFileSync('encoded.txt', encodedWords.map(word => word.toString()).join('\n'), 'utf-8');
