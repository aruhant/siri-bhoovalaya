interface EditDistanceFunction {
    (s1: string, s2: string): number;
  }
  
  class BKTreeNode {
    word: string;
    children: { [distance: number]: BKTreeNode[] };
  
    constructor(word: string) {
      this.word = word;
      this.children = {};
    }
  }
  
  export  class BKTree {
    private root: BKTreeNode | null = null;
    private editDistance: EditDistanceFunction;
  
    constructor(editDistanceFunction: EditDistanceFunction) {
      this.editDistance = editDistanceFunction;
    }
  
    add(word: string): void {
      if (!this.root) {
        this.root = new BKTreeNode(word);
        return;
      }
  
      let node = this.root;
      while (node) {
        const dist = this.editDistance(word, node.word);
        if (dist === 0) {
          return; // Word already exists
        }
  
        if (!node.children[dist]) {
          node.children[dist] = [new BKTreeNode(word)];
          return;
        } else {
          // Collision on distance, pick the first child.  Could use a more
          // sophisticated strategy here if desired.
          node = node.children[dist][0];
        }
      }
    }
  
      /**
     * Performs a partial match search on the BK-Tree.
     * @param word The string to search for.
     * @param maxEditDistance The maximum edit distance allowed.
     * @returns An array of strings that match the search criteria.
     */
      partialMatch(word: string, maxEditDistance: number): string[] {
          const results: string[] = [];
          const stack: { node: BKTreeNode; dist: number }[] = [];
  
          if (!this.root) {
              return results;
          }
  
        const initialDist = this.editDistance(this.root.word, word);
        stack.push({node: this.root, dist: initialDist});
  
  
          while (stack.length > 0) {
              const { node, dist } = stack.pop()!; // Non-null assertion
  
              if (dist <= maxEditDistance) {
                  results.push(node.word);
              }
  
              const minDistance = Math.max(0, dist - maxEditDistance);
              const maxDistance = dist + maxEditDistance;
  
              for (const edgeDistance in node.children) {
                  if (node.children.hasOwnProperty(edgeDistance)) {
                      const numEdgeDistance = parseInt(edgeDistance, 10);
                      if (numEdgeDistance >= minDistance && numEdgeDistance <= maxDistance) {
                        for (const childNode of node.children[numEdgeDistance]) {
                          const childDist = this.editDistance(childNode.word, word)
                          stack.push({node: childNode, dist: childDist});
                        }
  
                      }
                  }
              }
          }
  
          return results;
      }
  
  
    // Optional: A method to find the closest match (single best match)
    findClosest(word: string, maxEditDistance: number): { word: string; distance: number } | null {
      const results = this.partialMatch(word, maxEditDistance);
      if (results.length === 0) {
        return null;
      }
  
      let bestMatch = results[0];
      let minDistance = this.editDistance(bestMatch, word);
  
      for (const result of results) {
        const dist = this.editDistance(result, word);
        if (dist < minDistance) {
          minDistance = dist;
          bestMatch = result;
        }
      }
  
      return { word: bestMatch, distance: minDistance };
    }
  }
  
  
  // --- Example Usage ---
  
  // A basic Levenshtein distance function (for demonstration)
  function levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    const dp: number[][] = [];
  
    for (let i = 0; i <= m; i++) {
      dp[i] = [i];
    }
    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
    }
  
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1, // Deletion
            dp[i][j - 1] + 1, // Insertion
            dp[i - 1][j - 1] + 1 // Substitution
          );
        }
      }
    }
  
    return dp[m][n];
  }
  
  // Create a BK-Tree with the Levenshtein distance
  const bkTree = new BKTree(levenshteinDistance);
  
  // Add words to the tree
  const words = ["book", "co", "bot", "books", "cake", "boo", "cape" ,"cart", "boon", "cook", "bone"];
  for (const word of words) {
    bkTree.add(word);
  }
  
  // Perform a partial match search
  const searchWord = "bo";
  const maxDistance = 2;
  const matches = bkTree.partialMatch(searchWord, maxDistance);
  console.log(`Partial matches for "${searchWord}" (max distance ${maxDistance}):`, matches);
  
  const closest = bkTree.findClosest(searchWord, maxDistance)
  console.log("closest match", closest)

// Another example with a different set of words
const newWords = ["apple", "apply", "apples", "ape", "apex", "maple", "ample", "bppl","abpl","ppl","app","appl"];
const bkTreeNew = new BKTree(levenshteinDistance);

for (const word of newWords) {
    bkTreeNew.add(word);
}

const searchWordNew = "appl";
const maxDistanceNew = 1;
const matchesNew = bkTreeNew.partialMatch(searchWordNew, maxDistanceNew);
console.log(`Partial matches for "${searchWordNew}" (max distance ${maxDistanceNew}):`, matchesNew);

const closestNew = bkTreeNew.findClosest(searchWordNew, maxDistanceNew);
console.log("Closest match", closestNew);

//more examples with standard edit distance

const moreWords = ["hello", "help", "hell", "helmetS", "hero", "heron", "hill"];
const bkTreeMore = new BKTree(levenshteinDistance);

for (const word of moreWords) {
    bkTreeMore.add(word);
}

const searchWordMore = "hel";
const maxDistanceMore = 3;
const matchesMore = bkTreeMore.partialMatch(searchWordMore, maxDistanceMore);
console.log(`Partial matches for "${searchWordMore}" (max distance ${maxDistanceMore}):`, matchesMore);

const closestMore = bkTreeMore.findClosest(searchWordMore, maxDistanceMore);
console.log("Closest match", closestMore);




/*
  function customEditDistance(s1: string, s2: string): number {
      // This custom edit distance gives a cost of 1 for substitutions and
      // insertions at the beginning, and a cost of 2 for all other operations.
      if (s1.length === 0) return s2.length * 2;
      if (s2.length === 0) return s1.length * 2;  // or s1.length * 1 if we want cheap insertions at start
  
       if (s1[0] !== s2[0])
          return 1 + customEditDistance(s1.substring(1), s2.substring(1));
  
      const m = s1.length;
      const n = s2.length;
      const dp: number[][] = [];
  
      for (let i = 0; i <= m; i++) {
          dp[i] = [i * 2]; // Higher cost for deletions/insertions
      }
      for (let j = 0; j <= n; j++) {
          dp[0][j] = j * 2;
      }
      
      dp[0][0] = 0;
  
      for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
              if (s1[i - 1] === s2[j - 1]) {
                  dp[i][j] = dp[i - 1][j - 1];
              } else {
                  dp[i][j] = Math.min(
                      dp[i - 1][j] + 2,        // Deletion - cost of 2
                      dp[i][j - 1] + 2,        // Insertion - cost of 2
                      dp[i - 1][j - 1] + 1     // Substitution - cost of 1
                  );
              }
          }
      }
      return dp[m][n];
  }
  
  const bkTreeCustom = new BKTree(customEditDistance);
  for (const word of words) {
      bkTreeCustom.add(word);
  }
  const searchWord2 = "bot";
  const matches2 = bkTreeCustom.partialMatch(searchWord2, 3);
  console.log(`Partial matches for "${searchWord2}" (custom edit distance, max distance ${maxDistance}):`, matches2);
  const searchWord3 = "ook";
  const matches3 = bkTreeCustom.partialMatch(searchWord3, 3);
  console.log(`Partial matches for "${searchWord3}" (custom edit distance, max distance ${maxDistance}):`, matches3);
  */