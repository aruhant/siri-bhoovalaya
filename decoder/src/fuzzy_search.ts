import { BrahmiLikeScript, devanagari_script } from "./script.js";
import { Word, Unit, Units } from "./sequence.js";
import { Logger } from "./utils/logger.js";

// interface function editDistance(word1: Word, word2: Word): number;
export interface DistanceCalculator {
  getDistance(word1: Word, word2: Word): number;
}
export class BrahmiDistanceCalculator implements DistanceCalculator {
  insert_map?: Map<Units, number>
  delete_map?: Map<Units, number>
  replace_map?: Map<Units, Map<Units, number>>
  DEFAULT_INSERT_COST: number;
  DEFAULT_DELETE_COST: number;
  DEFAULT_REPLACE_COST: number;

  constructor(insert_map?: Map<Units, number>, delete_map?: Map<Units, number>, replace_map?: Map<Units, Map<Units, number>>, DEFAULT_INSERT_COST: number = 1, DEFAULT_DELETE_COST: number = 1, DEFAULT_REPLACE_COST: number = 1.4) {
    this.insert_map = insert_map ?? this.generateInsertMap();
    this.delete_map = delete_map ?? this.generateDeleteMap();
    this.replace_map = replace_map ?? this.generateReplaceMap();
    this.DEFAULT_INSERT_COST = DEFAULT_INSERT_COST;
    this.DEFAULT_DELETE_COST = DEFAULT_DELETE_COST;
    this.DEFAULT_REPLACE_COST = DEFAULT_REPLACE_COST;
  }
  getDistance(word1: Word, word2: Word): number {
    const m = word1.length();
    const n = word2.length();

    // Initialize a 2D array to store distances. dp[i][j] will hold the edit distance between word1[0...i-1] and word2[0...j-1].
    const dp: number[][] = [];
    for (let i = 0; i <= m; i++) {
      dp[i] = [];
      for (let j = 0; j <= n; j++) {
        dp[i][j] = 0;
      }
    }

    // Initialize base cases:
    // If word1 is empty, the cost is the sum of insertion costs of characters in word2.
    for (let j = 0; j <= n; j++) {
      let cost = 0;
      for (let k = 0; k < j; k++) {
        cost += this.insert_map.get(word2.unitAt(k).get()) ?? this.DEFAULT_INSERT_COST;  // Use default cost of 1 if not in map
      }
      dp[0][j] = cost;
    }
    // If word2 is empty, the cost is the sum of deletion costs of characters in word1.
    for (let i = 0; i <= m; i++) {
      let cost = 0;
      for (let k = 0; k < i; k++) {
        cost += this.delete_map.get(word1.unitAt(k).get()) ?? this.DEFAULT_DELETE_COST;  // Use default cost of 1 if not in map
      }
      dp[i][0] = cost;
    }

    // Fill the dp array using dynamic programming:
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const unit1: Unit = word1.unitAt(i - 1);
        const unit2: Unit = word2.unitAt(j - 1);

        // Insertion:
        const insertCost = this.insert_map.get(unit2.get()) ?? this.DEFAULT_INSERT_COST;

        // Deletion:
        const deleteCost = this.delete_map.get(unit1.get()) ?? this.DEFAULT_DELETE_COST;

        // Replacement:
        let replaceCost;
        if (unit1.get() === unit2.get()) {
          replaceCost = 0; // No cost if characters are the same
        } else {
          const replaceMapForChar1 = this.replace_map.get(unit1.get());
          replaceCost = replaceMapForChar1 ? (replaceMapForChar1.get(unit2.get()) ?? this.DEFAULT_REPLACE_COST) : this.DEFAULT_REPLACE_COST;
        }

        dp[i][j] = Math.min(
          dp[i - 1][j] + deleteCost,       // Delete char1
          dp[i][j - 1] + insertCost,       // Insert char2
          dp[i - 1][j - 1] + replaceCost   // Replace char1 with char2 (or keep if they are equal)
        );
      }
    }

    return dp[m][n];
  }


  // Additional functions to generate the weight maps
  generateInsertMap(): Map<Units, number> {
    // define constants
    const A_COST = 0.2;
    const AM_COST = 0.5;
    const SPECIAL_COST = 0.3;
    const VOWEL_COST = 0.5;
    const CONSONANT_COST = 0.9;
    const script = devanagari_script; // this is the script chosen for convenient representation. this method can still be used for a word for any script
    // vowels minus unit_1 or अ 
    const vowels = BrahmiLikeScript.getVowelBlock().filter(unit => Unit.unitsToNumber(unit) !== 1);
    const consonants = BrahmiLikeScript.getConsonantBlock();
    // initial values
    const insertMap = new Map<Units, number>();
    const addCost = (units: Units[], cost: number) => {
      units.forEach(unit => insertMap.set(unit, cost));
    }
    // Add custom insert costs here
    addCost(vowels, VOWEL_COST);
    addCost(consonants, CONSONANT_COST);
    insertMap.set(script.sciptToUnits("अ"), A_COST);
    insertMap.set(script.sciptToUnits("ं"), AM_COST);
    insertMap.set(script.sciptToUnits("ः"), SPECIAL_COST);
    insertMap.set(script.sciptToUnits("..."), SPECIAL_COST);
    insertMap.set(script.sciptToUnits("::"), SPECIAL_COST);
    /*
    for (const [key, value] of insertMap.entries()) {
      Logger.debugObject(`Key: ${script.unitsToScript(key)}, Value: ${value}`);
    }
    */
    return insertMap;
  }

  generateDeleteMap(): Map<Units, number> {
    return this.generateInsertMap();
  }

  generateReplaceMap(): Map<Units, Map<Units, number>> {
    const script = devanagari_script; // this is the script chosen for convenient representation. this method can still be used for a word for any script
    const SAME_GROUP_VOWEL_COST = 0.2;
    const DIFF_GROUP_VOWEL_COST = 0.6;
    const CONSONANT_COST = 1;
    // these will be initialized directly in the map. they are commutative
    const LU_L_COST = 0.2
    const LOO_L_COST = 0.1
    const LU_LOO_COST = 0.1
    const L_L_COST = 0.2
    const AH_H_COST = 0.2
    const AM_N_COST = 0.2
    const AM_M_COST = 0.2
    const N_N_COST = 0.6
    const SH_SH_S_COST = 0.6
    const R_RI_COST = 0.6
    const Y_EI_COST = 0.6
    const replaceMap = new Map<Units, Map<Units, number>>();
    // Add custom replace costs here
    const consonants = BrahmiLikeScript.getConsonantBlock();
    const vowels = BrahmiLikeScript.getVowelBlock();
    // add each consonant to the map that maps to all other consonants
    consonants.forEach(consonant => {
      const replaceCosts = new Map<Units, number>();
      consonants.forEach(otherConsonant => {
        if (consonant !== otherConsonant) { replaceCosts.set(otherConsonant, CONSONANT_COST); }
      });
      replaceMap.set(consonant, replaceCosts);
    });
    vowels.forEach(vowel => {
      const replaceCosts = new Map<Units, number>();
      vowels.forEach(otherVowel => {
        if (vowel !== otherVowel) {
          if (BrahmiLikeScript.isSameVowelGroup(vowel, otherVowel)) {
            replaceCosts.set(otherVowel, SAME_GROUP_VOWEL_COST);
          } else {
            replaceCosts.set(otherVowel, DIFF_GROUP_VOWEL_COST);
          }
        }
      });
      replaceMap.set(vowel, replaceCosts);
    });
    replaceMap.set(script.sciptToUnits("ल्"), replaceMap.get(script.sciptToUnits("ल्"))?.set(script.sciptToUnits("ळ्"), L_L_COST));
    replaceMap.set(script.sciptToUnits("ळ्"), replaceMap.get(script.sciptToUnits("ळ्"))?.set(script.sciptToUnits("ल्"), L_L_COST));

    replaceMap.set(script.sciptToUnits("ळु"), new Map<Units, number>([[script.sciptToUnits("ळू"), LU_LOO_COST], [script.sciptToUnits("ळ्"), LU_L_COST]]));
    replaceMap.set(script.sciptToUnits("ळू"), new Map<Units, number>([[script.sciptToUnits("ळु"), LU_LOO_COST], [script.sciptToUnits("ळ्"), LOO_L_COST]]));
    replaceMap.set(script.sciptToUnits("ळ्"), replaceMap.get(script.sciptToUnits("ळ्"))?.set(script.sciptToUnits("ळु"), LU_L_COST));
    replaceMap.set(script.sciptToUnits("ळ्"), replaceMap.get(script.sciptToUnits("ळ्"))?.set(script.sciptToUnits("ळू"), LOO_L_COST));

    replaceMap.set(script.sciptToUnits("ह्"), replaceMap.get(script.sciptToUnits("ह्"))?.set(script.sciptToUnits("ः"), AH_H_COST));
    replaceMap.set(script.sciptToUnits("ः"), new Map<Units, number>([[script.sciptToUnits("ह्"), AH_H_COST]]));


    replaceMap.set(script.sciptToUnits("न्"), replaceMap.get(script.sciptToUnits("न्"))?.set(script.sciptToUnits("ं"), AM_N_COST));
    replaceMap.set(script.sciptToUnits("न्"), replaceMap.get(script.sciptToUnits("न्"))?.set(script.sciptToUnits("ङ्"), N_N_COST));
    replaceMap.set(script.sciptToUnits("न्"), replaceMap.get(script.sciptToUnits("न्"))?.set(script.sciptToUnits("ण्"), N_N_COST));

    replaceMap.set(script.sciptToUnits("ं"), new Map<Units, number>([[script.sciptToUnits("न्"), AM_N_COST], [script.sciptToUnits("ङ्"), N_N_COST], [script.sciptToUnits("ण्"), N_N_COST], [script.sciptToUnits("म्"), AM_M_COST]]));

    replaceMap.set(script.sciptToUnits("म्"), replaceMap.get(script.sciptToUnits("म्"))?.set(script.sciptToUnits("ं"), AM_M_COST));

    replaceMap.set(script.sciptToUnits("ङ्"), replaceMap.get(script.sciptToUnits("ङ्"))?.set(script.sciptToUnits("न्"), N_N_COST));
    replaceMap.set(script.sciptToUnits("ङ्"), replaceMap.get(script.sciptToUnits("ङ्"))?.set(script.sciptToUnits("ं"), N_N_COST));
    replaceMap.set(script.sciptToUnits("ङ्"), replaceMap.get(script.sciptToUnits("ङ्"))?.set(script.sciptToUnits("ण्"), N_N_COST));
  
    replaceMap.set(script.sciptToUnits("ण्"), replaceMap.get(script.sciptToUnits("ण्"))?.set(script.sciptToUnits("न्"), N_N_COST));
    replaceMap.set(script.sciptToUnits("ण्"), replaceMap.get(script.sciptToUnits("ण्"))?.set(script.sciptToUnits("ं"), N_N_COST));
    replaceMap.set(script.sciptToUnits("ण्"), replaceMap.get(script.sciptToUnits("ण्"))?.set(script.sciptToUnits("ङ्"), N_N_COST));
    // next श् and ष् AND स्
    replaceMap.set(script.sciptToUnits("श्"), replaceMap.get(script.sciptToUnits("श्"))?.set(script.sciptToUnits("ष्"), SH_SH_S_COST));
    replaceMap.set(script.sciptToUnits("श्"), replaceMap.get(script.sciptToUnits("श्"))?.set(script.sciptToUnits("स्"), SH_SH_S_COST));

    replaceMap.set(script.sciptToUnits("ष्"), replaceMap.get(script.sciptToUnits("ष्"))?.set(script.sciptToUnits("श्"), SH_SH_S_COST));
    replaceMap.set(script.sciptToUnits("ष्"), replaceMap.get(script.sciptToUnits("ष्"))?.set(script.sciptToUnits("स्"), SH_SH_S_COST));

    replaceMap.set(script.sciptToUnits("स्"), replaceMap.get(script.sciptToUnits("स्"))?.set(script.sciptToUnits("ष्"), SH_SH_S_COST));
    replaceMap.set(script.sciptToUnits("स्"), replaceMap.get(script.sciptToUnits("स्"))?.set(script.sciptToUnits("श्"), SH_SH_S_COST));

    // next र् , "ऋ" , "ॠ" "ॠॄ", 
    replaceMap.set(script.sciptToUnits("र्"), replaceMap.get(script.sciptToUnits("र्"))?.set(script.sciptToUnits("ऋ"), R_RI_COST));
    replaceMap.set(script.sciptToUnits("र्"), replaceMap.get(script.sciptToUnits("र्"))?.set(script.sciptToUnits("ॠ"), R_RI_COST));
    replaceMap.set(script.sciptToUnits("र्"), replaceMap.get(script.sciptToUnits("र्"))?.set(script.sciptToUnits("ॠॄ"), R_RI_COST));

    replaceMap.set(script.sciptToUnits("ऋ"), replaceMap.get(script.sciptToUnits("ऋ"))?.set(script.sciptToUnits("र्"), R_RI_COST));
    replaceMap.set(script.sciptToUnits("ऋ"), replaceMap.get(script.sciptToUnits("ऋ"))?.set(script.sciptToUnits("ॠ"), R_RI_COST));
    replaceMap.set(script.sciptToUnits("ऋ"), replaceMap.get(script.sciptToUnits("ऋ"))?.set(script.sciptToUnits("ॠॄ"), R_RI_COST));

    replaceMap.set(script.sciptToUnits("ॠ"), replaceMap.get(script.sciptToUnits("ॠ"))?.set(script.sciptToUnits("र्"), R_RI_COST));
    replaceMap.set(script.sciptToUnits("ॠ"), replaceMap.get(script.sciptToUnits("ॠ"))?.set(script.sciptToUnits("ऋ"), R_RI_COST));
    replaceMap.set(script.sciptToUnits("ॠ"), replaceMap.get(script.sciptToUnits("ॠ"))?.set(script.sciptToUnits("ॠॄ"), R_RI_COST));

    replaceMap.set(script.sciptToUnits("ॠॄ"), replaceMap.get(script.sciptToUnits("ॠॄ"))?.set(script.sciptToUnits("र्"), R_RI_COST));
    replaceMap.set(script.sciptToUnits("ॠॄ"), replaceMap.get(script.sciptToUnits("ॠॄ"))?.set(script.sciptToUnits("ऋ"), R_RI_COST));
    replaceMap.set(script.sciptToUnits("ॠॄ"), replaceMap.get(script.sciptToUnits("ॠॄ"))?.set(script.sciptToUnits("ॠ"), R_RI_COST));

    replaceMap.set(script.sciptToUnits("य्"), replaceMap.get(script.sciptToUnits("य्"))?.set(script.sciptToUnits("ऐ"), Y_EI_COST));
    replaceMap.set(script.sciptToUnits("य्"), replaceMap.get(script.sciptToUnits("य्"))?.set(script.sciptToUnits("ऐो"), Y_EI_COST));
    replaceMap.set(script.sciptToUnits("य्"), replaceMap.get(script.sciptToUnits("य्"))?.set(script.sciptToUnits("ऐोो"), Y_EI_COST));
    replaceMap.set(script.sciptToUnits("ऐ"), replaceMap.get(script.sciptToUnits("ऐ"))?.set(script.sciptToUnits("य्"), Y_EI_COST));
    replaceMap.set(script.sciptToUnits("ऐो"), replaceMap.get(script.sciptToUnits("ऐो"))?.set(script.sciptToUnits("य्"), Y_EI_COST));
    replaceMap.set(script.sciptToUnits("ऐोो"), replaceMap.get(script.sciptToUnits("ऐोो"))?.set(script.sciptToUnits("य्"), Y_EI_COST));
    
    /*
    for (const [initial, replacementMap] of replaceMap.entries()) {
      const initialScript = script.unitsToScript(initial);
      for (const [replacement, cost] of replacementMap.entries()) {
        const replacementScript = script.unitsToScript(replacement);
        console.log(`Key: ${initialScript}, Value: ${replacementScript}, Cost: ${cost}`,);
      }
      console.log("__");
    }
    */
    return replaceMap;
  }

}

const c = new BrahmiDistanceCalculator();

