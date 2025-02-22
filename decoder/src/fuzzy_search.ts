import { devanagari_script } from "./script.js";
import { Word, Unit, Units } from "./sequence.js";

   // interface function editDistance(word1: Word, word2: Word): number;
  export interface DistanceCalculator {
    getDistance(word1: Word, word2: Word): number;
  }
  export class CustomEditDistance implements DistanceCalculator {  
    insert_map?: Map<Units, number>
    delete_map?: Map<Units, number>
    replace_map?: Map<Units, Map<Units, number>>
    constructor(insert_map?: Map<Units, number>, delete_map?: Map<Units, number>, replace_map?: Map<Units, Map<Units, number>>) {
      this.insert_map = insert_map ?? this.generateInsertMap();
      this.delete_map = delete_map ?? this.generateDeleteMap();
      this.replace_map = replace_map ?? this.generateReplaceMap();
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
        cost += this.insert_map.get(word2.unitAt(k).get()) ?? 1; // Use default cost of 1 if not in map
      }
      dp[0][j] = cost;
    }
    // If word2 is empty, the cost is the sum of deletion costs of characters in word1.
    for (let i = 0; i <= m; i++) {
      let cost = 0;
      for (let k = 0; k < i; k++) {
        cost += this.delete_map.get(word1.unitAt(k).get()) ?? 1;  // Use default cost of 1 if not in map
      }
      dp[i][0] = cost;
    }

    // Fill the dp array using dynamic programming:
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const unit1: Unit = word1.unitAt(i - 1);
        const unit2: Unit = word2.unitAt(j - 1);

        // Insertion:
        const insertCost = this.insert_map.get(unit2.get()) ?? 1;

        // Deletion:
        const deleteCost = this.delete_map.get(unit1.get()) ?? 1;

        // Replacement:
        let replaceCost;
        if (unit1.get() === unit2.get()) {
          replaceCost = 0; // No cost if characters are the same
        } else {
          const replaceMapForChar1 = this.replace_map.get(unit1.get());
          replaceCost = replaceMapForChar1 ? (replaceMapForChar1.get(unit2.get()) ?? 1) : 1;
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
    const insertMap = new Map<Units, number>();
    // Add custom insert costs here
    return insertMap;
  }

  generateDeleteMap(): Map<Units, number> {
    const deleteMap = new Map<Units, number>();
    // Add custom delete costs here
    return deleteMap;
  }

  generateReplaceMap(): Map<Units, Map<Units, number>> {
    const replaceMap = new Map<Units, Map<Units, number>>();
    // Add custom replace costs here
    return replaceMap;
  }

}


