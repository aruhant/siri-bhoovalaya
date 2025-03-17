/*
Copyright (C) 2025 Aruhant Mehta
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import { Chakra } from "./chakra.js";
import { Sequence, Sequence2D, Unit, Units, Word } from "./sequence.js";
import { Logger } from "./utils/logger.js";
import {
  BandhaFile
} from "./bandha.js";

// const program = require('commander');
import { Command } from 'commander';
import { BrahmiLikeScript, devanagari_script, kannada_script } from "./script.js";
import * as fs from 'fs';
import * as path from 'path';
import { Encoding, SequenceFile, WordFile } from "./file_processor.js";
import { BrahmiDistanceCalculator } from "./fuzzy_search.js";
import { Default_Segmenter } from "./word_break.js";
import { BKTree } from "./BK_tree.js";
import assert from "assert";
import { FindBestTree } from "./BK_tree_test.js";



interface ProgramOptions {
  chakra?: string;
  bandha?: string;
  dictionary?: string;
  output?: string;
  transposed?: string;
  partitioned?: string;
}

const program = new Command();

program
  .option('-c, --chakra <chakra>', 'Chakra file')
  .option('-b, --bandha <bandha>', 'Bandha file')
  .option('-d, --dictionary <dictionary>', 'Dictionary file')
  .option('-o, --output <output>', 'Output file')
  .option('-t, --transposed <transposed>', 'Transposed file')
  .option('-p, --partitioned <partitioned>', 'Partitioned file');

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
  Logger.infoBr(`Output file: ${options.output}`);
}
if (options.transposed) {
  Logger.infoBr(`Transposed file: ${options.transposed}`);
}
if (options.partitioned) {
  Logger.infoBr(`Partitioned file: ${options.partitioned}`);
}

function understandSangatya() {
  let verse = [

    "अ ष् ट् अ म् अ ह् आ प् र् आ त् इ ह् आ र् य् अ व् अ य् भ् अ व् अ द् इ न् द् अ",
    "अ ष् ट् अ ग् उ ण् अ न् ग् अ ळ ओो ळ ओो म् द् अ म्",
    "स् र् ष् ट् इ ग् ए म् अ न् ग् अ ळ अ प् अ र् य् आ य् अ द् इ न् इ त् अ",
    "अ ष् ट् अ म् अ ज् इ न् अ ग् ए र् अ ग् उ व् ए न् उ",
    "ट् अ ण् ए य् अ क् ओो ल् उ प् उ स् त् अ क् अ प् इ न् छ् अ प् आ त् र् ए य् अ",
    "अ व् अ त् र् अ द् आ क् अ म् अ न् ड् अ ल् अ द् अ",
    "न् अ व् अ क् आ र् अ म् अ न् त् र् अ स् इ द् इ ग् ए क् आ र् अ ण् अ व् ए न् द् उ",
    "भ् उ व् अ ल् अ य् अ द् ओ ळ उ प् एा ळ द् अ म् अ ह् इ म् आ",
    "ट् अ व् अ ण् ए य् ओ ळ अ क् ष् अ र् अ द् अ न् क् अ व् अ स् थ् आ प् इ स् इ",
    "द् अ व् अ य् अ व् अ व् अ द् ए म् ह् आ व् र् त् अ उ",
    "अ व् अ र् अ व् अ र् इ ग् ए त् अ क् अ श् अ क् त् इ ग् ए व् अ र् व् आ द् अ",
    "न् अ व् अ म् अ न् ग् अ ल् अ द् अ भ् उ व् अ ल् अ य् अ",
    "व् इ ह् अ व् आ ण् इ ओो म् क् आ र् अ द् अ त् इ श् अ य् अ व् इ ह् अ न् इ न् अ",
    "म् अ ह् आ व् ई र् अ व् आ ण् इ ए न् द् ए न् उ व् अ",
    "म् अ ह् इ म् ए य् अ म् न् ग् अ ल् अ प् र् आ भ् र् उ त् अ व् ए न् उ व् अ",
    "म् अ ह् अ स् इ ध् अ क् आ व् य् अ भ् ऊ व् अ ल् अ य् अ",
    "ह् अ क् अ उ द् व् इ स् अ म् य् ओो ग् अ द् ओ ळ अ ग् ए इ प् अ त् ए न् ट् उ",
    "प् र् अ क् अ ट् अ द् ओ ळ अ र् अ व् अ त् अ म् क् उ ड् ए",
    "स् अ क् अ ल् आ न् क् अ द् ओो ळ ब् इ ट् अ स् ओ न् ए य् ए ए न् ट् ए न् ट् उ",
    "स् अ क् अ ल् आ ग् अ म् अ एा ळ उ भ् अ न् ग् अ"
  ].map(line => line.trim());
  // define a function that takes a list of strings of space seperated letters. return a list of objects giving number of consonants, vowels, and special characters in each string
  function countLetters(verse: string[]): { consonants: number, vowels: number, special: number , total: number, hasv: number, dirgha: number,pluta: number, weightedTotal: number}[] {
    let result: { consonants: number, vowels: number, special: number , total: number, hasv: number, dirgha: number,pluta: number, weightedTotal: number}[] = [];
    for (const line of verse) {
      const values = { consonants: 0, vowels: 0, special: 0 , total: 0, hasv: 0, dirgha: 0,pluta: 0, weightedTotal: 0};
      for (const alphabet of line.split(" ")) {
        const alphabet_converted = devanagari_script.scriptToUnits(alphabet)!;
        if (BrahmiLikeScript.isConsonantBlock(alphabet_converted)) {
          values.consonants++;
          values.total++;
        }
        else if (BrahmiLikeScript.isVowelBlock(alphabet_converted) || BrahmiLikeScript.isLu(alphabet_converted)) {
          values.vowels++;
          values.total++;
          if (BrahmiLikeScript.isShortVowel(alphabet_converted)) {
            values.hasv++;
            values.weightedTotal+=1;
          }
          if (BrahmiLikeScript.isMediumVowel(alphabet_converted)) {
            values.dirgha++;
            values.weightedTotal+=2;
          }
          if (BrahmiLikeScript.isLongVowel(alphabet_converted)) {
            values.pluta++;
            values.weightedTotal+=3;
          }

        }
        else {
          values.special++;
          values.total++;
        }
      }
      result.push(values);
    }
    return result;
  }
  console.log(countLetters(verse).map(({ vowels, hasv, dirgha, pluta, weightedTotal }) => ({ vowels, hasv, dirgha, pluta, weightedTotal })));
  console.log(countLetters(verse))
}
function wordToScriptTests() {
  let script = devanagari_script;


  let word = Word.fromNumbers([43, 1, 13, 3, 30, 13, 4, 62, 40, 54, 3])
  Logger.info(script.wordToScript(word));
  //Logger.info(script.sequenceToScript(word));

  Logger.info(script.scriptToWord("अ...खीkख्घoआाकोो...तळश").toString());

  Logger.info(script.scriptToWord("तळााग्ळिःड्राा").toString());

  // now kannada

  script = kannada_script;
  let word2 = Word.fromNumbers([43, 1, 13, 3, 30, 13, 4, 62, 40, 54, 3])
  Logger.info(kannada_script.wordToScript(word2));
  //Logger.info(script.sequenceToScript(word));

  Logger.info(kannada_script.scriptToWord("ಅ...ಖೀkಖ್ಘoಆಾಕೋೋ...ತಳಶ").toString());
  Logger.info(kannada_script.scriptToWord("ತಳಾಗ್ಳಿಃಡ್ರಾಾ").toString());

  console.log(script.scriptToWord("ರ್").toString());
  console.log(script.scriptToWord("ರ್ಯ").toString());
  console.log(script.scriptToWord("ಅಷ್ಟಮಹಾಪ್ರಾತಿಹಾರ್ಯ್").toEncodedString());
  console.log(script.scriptToWord("ಅಷ್ಟಮಹಾಪ್ರಾತಿಹಾರ್ಯ").toEncodedString());
}




function dictionaryTests() {
  const dictionaryContent = fs.readFileSync('./data/dictionary.txt', 'utf-8');
  const words = dictionaryContent.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('#'));

  const encodedWords = words.map(word => devanagari_script.scriptToWord(word));
  const decodedWords = encodedWords.map(word => devanagari_script.wordToScript(word));

  // compare the original words with the decoded words
  const mismatches = words.map((word, index) => {
    if (word !== decodedWords[index]) {
      return { original: word, decoded: decodedWords[index] };
    }
    return null;
  }).filter(mismatch => mismatch !== null);

  // print the mismatches
  if (mismatches.length > 0) {
    Logger.infoBr("Mismatches:");
    mismatches.forEach((mismatch: any) => {
      Logger.info(`${mismatch.original} -> ${mismatch.decoded}`);
    });
  }
}



//Matched ಅಷ್ಟಮಹಾಪ್ರಾತಿಹಾರ್ಯವಯ್ಭವದಿ to ಅಷ್ಟಮಹಾಪ್ರತಿಹಾರ್ಯಗಳಲ್ಲಿ with distance 4.9







function decryptingAndPartioningTests() {
  const script = kannada_script;
  //const words = WordFile.readList(options.dictionary, Encoding.script, script).sort(() => Math.random() - 0.5);
  //const dictionary = new BKTree(new BrahmiDistanceCalculator(), words);
  const dictionary = BKTree.fromFile(options.dictionary, new BrahmiDistanceCalculator());
  console.log(dictionary.getStats());
  let chakra = new Chakra(new Sequence2D(SequenceFile.readLine(options.chakra, Encoding.numerical)));
  let bandha = BandhaFile.readPairSeperatedBandha(options.bandha);
  //Logger.info(bandha.toString());
  let result = bandha.apply(chakra);

  //Logger.info(result.toString());
  Logger.info(script.sequenceToScript(result).join(" "));
  //dictionary.printTree();

  const kannadaSegmenter = new Default_Segmenter(dictionary);
  //const word = Word.fromSequence(script.scriptToSequence("ಅ ಷ್ ಟ್ ಅ ಮ್ ಅ ಹ್ ಆ ಪ್ ರ್ ಆ ತ್ ಇ ಹ್ ಆ ರ್ ಯ್ ಅ ವ್ ಅ ಯ್ ಭ್ ಅ ವ್ ಅ ದ್ ಇ ನ್ ದ್ ಅ".split(" ")));
  //const word = Word.fromSequence(script.scriptToSequence("ಅ ಷ್ ಟ್ ಅ ಗ್ ಉ ಣ್ ಅ ನ್ ಗ್ ಅ ಳ್ ಓ ಳ್".split(" "))); // ಅಷ್ಟಗುಣ ನ್ಗಳೋಳ್
  //const word = Word.fromSequence(script.scriptToSequence("ಅ ಷ್ ಟ್ ಅ ಮ್ ಅ ಹ್ ಆ ಪ್ ರ್ ಆ ತ್ ಇ ಹ್ ಆ ರ್ ಯ್ ಅ ವ್ ಅ ಯ್ ಭ್ ಅ ವ್ ಅ ದ್ ಇ ನ್ ದ್ ಅ ಅ ಷ್ ಟ್ ಅ ಗ್ ಉ ಣ್ ಅ ನ್ ಗ್ ಅ ಳ್ ಓ ಳ್ ಓ ಮ್ ದ್ ಅ".split(" ")));
  // ಅ ಷ್ ಟ್ ಅ ಗ್ ಉ ಣ್ ಅ ನ್ ಗ್ ಅ ಳ್ ಓ ಳ್ ಓ ಮ್ ದ್ ಅ ಸ್ ರ್ ಷ್ ಟ್ ಇ ಗ್ ಎ ಮ್ ಅ ನ್ ಗ್ ಅ ಳ್ ಅ ಪ್ ಅ ರ್ ಯ್ ಆ ಯ್ ಅ ದ್ ಇ ನ್ ಇ ತ್ ಅ
  //const word = Word.fromSequence(script.scriptToSequence("ಅ ಷ್ ಟ್ ಅ ಮ್ ಅ ಹ್ ಆ ಪ್ ರ್ ಆ ತ್ ಇ ಹ್ ಆ ರ್ ಯ್ ಅ ವ್ ಅ ಯ್ ಭ್ ಅ ವ್ ಅ ದ್ ಇ ನ್ ದ್ ಅ ಅ ಷ್ ಟ್ ಅ ಗ್ ಉ ಣ್ ಅ ನ್ ಗ್ ಅ ಳ್ ಓ ಳ್ ಓ ಮ್ ದ್ ಅ ಮ್ ಸ್ ರ್ ಷ್ ಟ್ ಇ ಗ್ ಎ ಮ್ ಅ ನ್ ಗ್ ಅ ಳ್ ಅ ಪ್ ಅ ರ್ ಯ್ ಆ ಯ್ ಅ ದ್ ಇ ನ್ ಇ ತ್ ಅ ಅ ಷ್ ಟ್ ಅ ಮ್ ಅ ಜ್ ಇ ನ್ ಅ ಗ್ ಎ ರ್ ಅ ಗ್ ಉ ವ್ ಎ ನ್ ಉ".split(" ")));
  // ಟ್ ಅ ಣ್ ಎ ಯ್ ಅ ಕ್ ಓ ಲ್ ಉ ಪ್ ಉ ಸ್ ತ್ ಅ ಕ್ ಅ ಪ್ ಇ ನ್ ಛ್ ಅ ಪ್ ಆ ತ್ ರ್ ಎ ಯ್ ಅ ಅ ವ್ ಅ ತ್ ರ್ ಅ ದ್ ಆ ಕ್ ಅ ಮ್ ಅ ನ್ ಡ್ ಅ ಲ್ ಅ ದ್ ಅ ನ್ ಅ ವ್ ಅ ಕ್ ಆ ರ್ ಅ ಮ್ ಅ ನ್ ತ್ ರ್ ಅ ಸ್ ಇ ದ್ ಇ ಗ್ ಎ ಕ್ ಆ ರ್ ಅ ಣ್ ಅ ವ್ ಎ ನ್ ದ್ ಉ ಭ್ ಉ ವ್ ಅ ಲ್ ಅ ಯ್ ಅ ದ್ ಒ ಳ್ ಉ ಪ್ ಏ ಳ್ ದ್ ಅ ಮ್ ಅ ಹ್ ಇ ಮ್ ಆ
  const word = Word.fromSequence(script.scriptToSequence("ಅ ಷ್ ಟ್ ಅ ಗ್ ಉ ಣ್ ಅ ನ್ ಗ್ ಅ ಳ್ ಓ ಳ್ ಓ ಮ್ ದ್ ಅ ಸ್ ರ್ ಷ್ ಟ್ ಇ ಗ್ ಎ ಮ್ ಅ ನ್ ಗ್ ಅ ಳ್ ಅ".split(" ")));
  console.log("Word:", script.wordToScript(word));

  console.log("Word:", word.toNumbers());
  //console.log(script.wordToScript(  dictionary.closest_match(word, 3)?.word));
  const segmentationResult = kannadaSegmenter.segment(word);

  console.log("Segmentation Result:", segmentationResult.map(word => script.wordToScript(word)).join(" "));

}
//Segmentation Result: ಅಷ್ಟಮಹಾಪ್ರಾತಿಹಾರ್ಯವಯ್ಭವದಿ ನ್ ದ

//ಅಷ್ಟಗುಣನ್ಗಳ್ ಓಳ್ ಓಮ್ದ



function partitionSequence() {
  const script = kannada_script;
  let sequence = SequenceFile.readLine(options.transposed, Encoding.numerical, undefined, " ");
  sequence = script.scriptToWord("ಭನ್ಗ್ಅಕಮಲಗಳ್")
  Logger.log(script.sequenceToScript(sequence).join(" "));
  const kannadaSegmenter = new Default_Segmenter(BKTree.fromFile(options.dictionary, new BrahmiDistanceCalculator()));
  const segmentationResult = kannadaSegmenter.segment(Word.fromSequence(sequence));
  Logger.log(`Segmentation Result: ${segmentationResult.map(word => script.wordToScript(word)).join(" ")} `);
  WordFile.writeList(options.transposed.replace(".txt", "_segmented.txt"), segmentationResult, Encoding.script, script);
}

function reverseCheck() {
  const script = kannada_script;
  //const to_check: Word[] = ["ಅಷ್ಟಮಹಾ", "ಪ್ರಾತಿಹಾರ್ಯ್", "ಅವಯ್ಭವ್", "ಅದಿನ್", "ದಅಷ್ಟ", "ಗುಣನ್", "ಗಳೋಳೋ", "ಮ್ದಮ್", "ಸ್ರ್ಷ್ಟಿಗ್", "ಎಮನ್", "ಗಳ", "ಪರ್ಯಾಯ್", "ಅದಿನಿತ", "ಅಷ್ಟಮ", "ಜಿನ", "ಗೆರಗು", "ವೆನುಟ", "ಣೆಯ", "ಕೋಲು", "ಪುಸ್ತಕ", "ಪಿನ್ಛ್", "ಅಪಾತ್ರ್", "ಎಯಅವ", "ತ್ರದಾಕ", "ಮನ್ಡಲ", "ದನ", "ವಕಾರ", "ಮನ್ತ್ರ", "ಸಿದಿಗ್", "ಎಕಾರಣ್", "ಅವೆನ್ದು", "ಭುವ", "ಲಯ", "ದೊಳು", "ಪೇಳ್ದಮ", "ಹಿಮಾ", "ಟವಣೆಯ್", "ಒಳಕ್ಷ", "ರದನ್ಕ್", "ಅವಸ್ಥಾ", "ಪಿಸಿ", "ದವಯ", "ವವದ್", "ಎಮ್ಹಾವ್ರ್", "ತಉಅವರ", "ವರಿ", "ಗೆತಕ", "ಶಕ್ತಿ", "ಗೆವ", "ರ್ವಾದನ್", "ಅವಮನ್", "ಗಲದ", "ಭುವ", "ಲಯ", "ವಿಹ", "ವಾಣಿಓಮ್", "ಕಾರದ", "ತಿಶಯ", "ವಿಹನ್", "ಇನಮ", "ಹಾವೀ", "ರವಾಣ್", "ಇಎನ್ದೆ", "ನುವಮ", "ಹಿಮೆಯ", "ಮ್ನ್ಗಲ", "ಪ್ರಾಭ್ರುತ", "ವೆನು", "ವಮಹಸಿಧ್", "ಅಕಾವ್ಯ", "ಭೂವ", "ಲಯ", "ಹಕ", "ಉದ್ವಿಸ್", "ಅಮ್ಯೋ", "ಗದೊಳ", "ಗೆಇಪ", "ತೆನ್ಟು", "ಪ್ರಕಟ", "ದೊಳ", "ರವತ", "ಮ್ಕುಡೆ", "ಸಕಲಾ", "ನ್ಕದೋಳ್", "ಬಿಟ", "ಸೊನೆ", "ಯೆಎನ್", "ಟೆನ್ಟು", "ಸಕಲಾ", "ಗಮಏ", "ಳುಭನ್", "ಗಕಮಲ", "ಗಳೇಳು", "ಮುನ್ದ್", "ಅಕೆಪೋ", "ಗುತಿ", "ರ್ದಾಗ್", "ಅಕ್ರಮ", "ದೊಳ", "ಗೆರಡು", "ಕಾಲ್ನೂರು", "ತಮಲ್", "ಆನ್ಕಅ", "ಇದುಸೊನ್", "ಎಯುಆರು", "ಎರ್ಡ", "ಯ್ದುಕ", "ಮಲದ್", "ಅಗನ್ಧ", "ಭೂವ", "ಲಯ", "ಮ್ಮಹ್ರು", "ದಯ", "ದೊಳಾಕ", "ಮಲಗಳ್", "ಚಲಿ", "ಪಾಗ", "ವಿಮಲಾ", "ನ್ಕಗೆಲ್", "ಉವನ್", "ದವ", "ದುಸ", "ಮವನು", "ಬೆಸ", "ದೊಳು", "ಭಾಗಿಸೆ", "ಸೊನೆಯ", "ಕ್ರಮ", "ವಿಹ", "ಕಾವ್ಯ್ಭ್", "ಊವ್ಲಯ", "ಸಿರಿ", "ಭೂವ್ಲ್", "ಅಯಸಿ", "ಧಾನ್ತ", "ದಮ್ನ್ಗಲ್", "ಪಾಹುಢ್ವು"].map(word => script.scriptToWord(word));
  const to_check: Word[] = ["ವಯ್ಭವದಿನ್ದಅಷ್ಟಗು", "ಅಷ್ಟಗುಣನ್ಗಳೋಳೋಮ್", "ನ್ಗಳೋಳ್"].map(word => script.scriptToWord(word));
  const edit_distance = new BrahmiDistanceCalculator();
  console.log(edit_distance.getDistance(script.scriptToWord("ಅಷ್ಟಮಹಾಪ್ರಾತಿಹಾರ್ಯ್"), script.scriptToWord("ಅಷ್ಟಮಹಾಪ್ರಾತಿಹಾರ್ಯ")));


  const dict = WordFile.readList(options.dictionary, Encoding.script, script).sort(() => Math.random() - 0.5);
  const dictionary = new BKTree(new BrahmiDistanceCalculator(), dict);
  console.debug(dictionary.closest_match(script.scriptToWord("ಅಷ್ಟಮಹಾಪ್ರಾತಿಹಾರ್ಯ್"), 0.3)?.word);

  let cloestMatch: Word[] = [];
  for (const word of to_check) {
    if (word.length() <= 3) {
      let max_edit_distance = 0.5;
      let closest = dictionary.closest_match(word, max_edit_distance);
      if (closest == undefined) {
        Logger.info(`No match found for: ${script.wordToScript(word)}`);
        cloestMatch.push(word);
      }
      else {
        cloestMatch.push(closest?.word);

      }
    }
    else if (word.length() < 6) {
      let max_edit_distance = 2;
      let closest = dictionary.closest_match(word, max_edit_distance);
      cloestMatch.push(closest?.word);
    } else if (word.length() < 10) {
      let max_edit_distance = 3;
      let closest = dictionary.closest_match(word, max_edit_distance);
      cloestMatch.push(closest?.word);
    } else if (word.length() < 20) {
      let max_edit_distance = 4.5;
      let closest = dictionary.closest_match(word, max_edit_distance);
      cloestMatch.push(closest?.word);
    } else if (word.length() < 30) {
      let max_edit_distance = 5;
      let closest = dictionary.closest_match(word, max_edit_distance);
      cloestMatch.push(closest?.word);
    } else {
      let max_edit_distance = 6;
      let closest = dictionary.closest_match(word, max_edit_distance);
      cloestMatch.push(closest?.word);
    }
  }
  Logger.info(cloestMatch.map(word => script.wordToScript(word)).join(" "));
}

function dictionaryByLength() {
  const script = kannada_script;
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
    if (wordsByLength[0][0].toEncodedString() === '') {
      Logger.info("Empty word found");
    }
  }
  //Segmentation Result: ಅಷ್ಟಮಹಾಪ್ರಾತಿಹಾರ್ಯ ವಯ್ಭವದಿನ್ದಅಷ್ಟಗು ಣ ನ್ಗಳೋಳ್ ಓಮ್ದ

}

function correctPartitionedWords() {
  const words = WordFile.readList(options.partitioned, Encoding.script, kannada_script, "", "\n");
  //const words = ["ಭನ್ಗ್", "ಅಕಮಲಗಳ್", "ಏಳು", "ಮುನ್", "ಆದಕೆ"].map(word => kannada_script.scriptToWord(word));

  let correctedWords: Word[] = [];
  // if a word ends with a consonant and the next word is a vowel or special char, then merge the two words. note multiple words can be merged
  for (let i = 0; i < words.length - 1;) {
    const word = words[i];
    const nextWord = words[i + 1];
    const lastChar = word.unitAt(word.length() - 1).get()
    const firstChar = nextWord.unitAt(0).get();
    if (BrahmiLikeScript.isConsonantBlock(lastChar) && !BrahmiLikeScript.isConsonantBlock(firstChar)) {
      word.join(nextWord);
      // remove the next word and dont increment i so that the next word is checked
      words.splice(i + 1, 1);
    } else {
      correctedWords.push(word);
      i++;
    }
  }
  correctedWords.push(words[words.length - 1]);
  WordFile.writeList(options.partitioned.replace(".txt", "_corrected.txt"), correctedWords, Encoding.script, kannada_script);
  //Logger.info(correctedWords.map(word => kannada_script.wordToScript(word)).join(" "));
}

decryptingAndPartioningTests();
//reverseCheck();
//understandSangatya();
// check function BrhamiLikeScript.isHasvVowel
//partitionSequence();
// Segmentation Result: ಅಷ್ಟಗುಣನ್ಗಳೋಳೋಮ್ ದಮ್
//ಅಷ್ಟಗುಣಂಗಳಂ
// ಅಷ್ಟಗುಣ ನ್ಗಳೋಳ್ ಓ ಮ್ ದಮ್
//ಅವಯವದಿಂದಟೆಗುಂ ಅಷ್ಟಗುಣಂಗಳಂ ಂಗಳೊಳ್
// ಅಷ್ಟಮಹಾಪ್ರಾತಿಹಾರ್ಯ ವಯ್ಭವದಿನ್ದ ಅಷ್ಟ ಗು
//ಅಷ್ಟಗುಣನ್ಗಳ್ ಓಳ್ ಓಮ್ದ ಸ್ರ್ಷ್ಟಿಗೆ ಮನ್ಗಳ ಪರ್ಯಾಯದಿನ್ ಇತ
// Segmentation Result: ಅಷ್ಟಮ ಜಿನಗೆರ ಗುವ್ ಎನು
//  ಅಷ್ಟಮಹಾಪ್ರಾತಿಹಾರ್ಯ ವಯ್ಭವದಿನ್ದ ಅಷ್ಟಗುಣನ್ಗಳ್ ಓಳ್ ಓಮ್ದಮ್ ಸ್ರ್ಷ್ಟಿಗೆ ಮನ್ಗಳ ಪರ್ಯಾಯದಿನ್ ಇತ ಅಷ್ಟಮ ಜಿನಗೆರ ಗುವ್ ಎನು
// ಟಣೆಯ ಕೋಲು ಪುಸ್ತಕ ಪಿನ್ಛ ಪಾತ್ರೆಯ ಅವ ತ್ರದಾ ಕಮನ್ಡಲ ದನವ ಕಾರ ಮನ್ತ್ರ ಸಿದಿಗೆ ಕಾರಣ ವೆನ್ದು ಭುವಲಯದೊಳ್ ಉಪೇಳ್ದ ಮಹಿಮಾ
