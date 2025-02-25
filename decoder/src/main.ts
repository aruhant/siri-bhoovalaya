import { Chakra } from "./chakra.js";
import { Sequence2D,  Unit,  Word } from "./sequence.js";
import { Logger } from "./utils/logger.js";
import { 
  BandhaFile} from "./bandha.js";

// const program = require('commander');
import { Command } from 'commander';
import { devanagari_script, kannada_script } from "./script.js";
import * as fs from 'fs';
import * as path from 'path';
import { Encoding, SequenceFile, WordFile } from "./file_processor.js";
import { BrahmiCustomEditDistance } from "./fuzzy_search.js";
import { segmentStringWithEditDistanceCost } from "./word_break.js";
import { BKTree } from "./BK_tree.js";



interface ProgramOptions {
  chakra?: string;
  bandha?: string;
  dictionary?: string;
  output?: string;
}

const program = new Command();

program
  .option('-c, --chakra <chakra>', 'Chakra file')
  .option('-b, --bandha <bandha>', 'Bandha file')
  .option('-d, --dictionary <dictionary>', 'Dictionary file')
  .option('-o, --output <output>', 'Output file');

program.parse(process.argv);

const options: ProgramOptions = program.opts();

if (options.chakra) {
  Logger.infoBr(`Chakra file: ${options.chakra}`);
}
if (options.bandha) {
  Logger.infoBr(`Bandha file: ${options.bandha}`);
}
if (options.dictionary) {
  Logger.infoBr(`Dictionary file: ${options.dictionary}`);
} 
if (options.output) {
  Logger.info
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


let script = kannada_script;
/*
let word = Word.fromNumbers([43,1,  13, 3, 30, 13, 4, 62,40, 54,3])
Logger.info(script.wordToScript(word));
//Logger.info(script.sequenceToScript(word));

Logger.info(script.scriptToWord("अ...खीkख्घoआाकोो...तळश").toString());
Logger.info(script.scriptToWord("तळााग्ळिःड्राा").toString());
*/
// now kannada
/*
script = kannada_script;
let word2 = Word.fromNumbers([43,1,  13, 3, 30, 13, 4, 62,40, 54,3])
Logger.info(kannada_script.wordToScript(word2));
//Logger.info(script.sequenceToScript(word));

Logger.info(kannada_script.scriptToWord("ಅ...ಖೀkಖ್ಘoಆಾಕೋೋ...ತಳಶ").toString());
Logger.info(kannada_script.scriptToWord("ತಳಾಗ್ಳಿಃಡ್ರಾಾ").toString());
debugger;
for (let i = 1; i<=64;i++){
  let u = new Unit(i);
  Logger.info(u.toNumber().toString());
  Logger.info(u.toEncodedString());
  Logger.info(" ");
}
*/



/*
const dictionaryContent = fs.readFileSync('./data/dictionary.txt', 'utf-8');
const words = dictionaryContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

const encodedWords = words.map(word => devanagari_script.scriptToWord(word));
const decodedWords = encodedWords.map(word => devanagari_script.wordToScript(word));

// compare the original words with the decoded words
const mismatches = words.map((word, index) => {
  if (word !== decodedWords[index]) {
    return { original: word, decoded: decodedWords[index] };
  }
}).filter(Boolean);

// print the mismatches
if (mismatches.length > 0) {
  Logger.infoBr("Mismatches:");
  mismatches.forEach((mismatch: any) => {
    Logger.info(`${mismatch.original} -> ${mismatch.decoded}`);
  });
}
  */


// Read lexicon words from file

//const lexiconWords: Word[] = WordFile.readList(options.dictionary, Encoding.script, kannada_script).sort(()=>Math.random()-0.5);
//const dictionary = new BKTree(new CustomEditDistance(), lexiconWords);
const dictionary = BKTree.fromFile(options.dictionary, new BrahmiCustomEditDistance());
let chakra = new Chakra(new Sequence2D(SequenceFile.readLine(options.chakra, Encoding.numerical)));
let bandha = BandhaFile.readPairSeperatedBandha(options.bandha);
//Logger.info(bandha.toString());
let result = bandha.apply(chakra);
//Logger.info(result.toString());
//Logger.info(script.sequenceToScript(result).join(" "));
//console.log(devanagari_script);
dictionary.printTree();

const segmentationResult = segmentStringWithEditDistanceCost(result, dictionary);

console.log("Segmentation Result:", segmentationResult.map(word => script.wordToScript(word)).join(" "));


// for dictionary.options, tell me how many words are of each length
/*
if (options.dictionary) {
  // group words by length
  const words = WordFile.readList(options.dictionary, Encoding.script, script);
  const wordsByLength: { [key: number]: Word[] } = {};
  words.forEach(word => {
    const length = word.length();
    if (!wordsByLength[length]) {
      wordsByLength[length] = [];
    }
    wordsByLength[length].push(word);
  }
  );
  // print how many words are of each length
  Logger.infoBr("Words by length:");
  Object.keys(wordsByLength).forEach(length => {
    Logger.info(`${length}: ${wordsByLength[length].length}`);
  });
  if (wordsByLength[0][0].toEncodedString() === ''){
    Logger.info("Empty word found");
  }
}
  */