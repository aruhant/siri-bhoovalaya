// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Text;
// using System.Threading.Tasks;
// using SiriBhuvalyaExtractor.Databases;
// using SiriBhuvalyaExtractor.WordMatcher;
//
// /// <summary>
// /// Sanskrit word processor using vector database for efficient word extraction
// /// </summary>
// public class SanskritWordProcessor
// {
//     private readonly IVectorDatabase _vectorDatabase;
//     private readonly Dictionary<string, string> _vowelToMatraMap;
//     private readonly HashSet<string> _vowels;
//     private readonly HashSet<string> _consonants;
//     private readonly int _maxWordLength;
//
//     /// <summary>
//     /// Constructor that initializes the processor with necessary components
//     /// </summary>
//     public SanskritWordProcessor(IVectorDatabase vectorDatabase, List<SanskritWord> dictionary)
//     {
//         _vectorDatabase = vectorDatabase ?? throw new ArgumentNullException(nameof(vectorDatabase));
//
//         if (dictionary == null || dictionary.Count == 0)
//             throw new ArgumentException("Dictionary cannot be null or empty", nameof(dictionary));
//
//         // Initialize character sets
//         _vowelToMatraMap = GetVowelToMatraMapping();
//         _vowels = new HashSet<string>(GetSanskritVowels());
//         _consonants = new HashSet<string>(GetSanskritConsonants());
//
//         // Calculate maximum word length from the dictionary
//         _maxWordLength = dictionary.Max(word => word.Word.Length);
//
//         // Populate the vector database with dictionary words if needed
//         InitializeVectorDatabase(dictionary);
//     }
//
//     /// <summary>
//     /// Populates the vector database with dictionary words and their embeddings
//     /// </summary>
//     private void InitializeVectorDatabase(List<SanskritWord> dictionary)
//     {
//         // This would be called if the database needs initialization
//         // The implementation depends on the specific vector database being used
//         foreach (var word in dictionary)
//         {
//             // Create an embedding for each word and store it in the database
//             // The embedding could be based on the characters, phonetic properties, or other features
//             var embedding = GenerateEmbedding(word.Word);
//             _vectorDatabase.AddWordEmbedding(word.Word, embedding);
//         }
//
//         // Build any necessary indices
//         _vectorDatabase.BuildIndices();
//     }
//
//     /// <summary>
//     /// Generates an embedding vector for a Sanskrit word
//     /// </summary>
//     private float[] GenerateEmbedding(string word)
//     {
//         // This is a simplified example - actual embedding generation would be more sophisticated
//         // and tailored to Sanskrit's linguistic features
//
//         // Create a feature vector based on character frequencies and positions
//         var embedding = new float[128]; // Example dimension
//
//         // Extract features from the word that would be relevant for matching
//         // For example: letter frequencies, consonant-vowel patterns, etc.
//
//         // Populate the embedding vector...
//
//         // Normalize the embedding
//         float magnitude = (float)Math.Sqrt(embedding.Sum(x => x * x));
//         if (magnitude > 0)
//         {
//             for (int i = 0; i < embedding.Length; i++)
//             {
//                 embedding[i] /= magnitude;
//             }
//         }
//
//         return embedding;
//     }
//
//     /// <summary>
//     /// Finds all possible valid Sanskrit words that can be formed from the given list of letters
//     /// using vector database for efficient matching
//     /// </summary>
//     public List<string> FindSanskritWords(List<string> letters)
//     {
//         if (letters == null || letters.Count == 0)
//             return new List<string>();
//
//         List<string> result = new List<string>();
//         HashSet<int> usedIndices = new HashSet<int>();
//
//         // Generate letter combinations and query the vector database
//         FindWordCombinations(letters, result, usedIndices, 0);
//
//         return result;
//     }
//
//     /// <summary>
//     /// Recursively finds word combinations from the letter sequence
//     /// </summary>
//     private void FindWordCombinations(List<string> letters, List<string> result,
//         HashSet<int> globalUsedIndices, int startIndex)
//     {
//         // If we've reached the end or used all letters, return
//         if (startIndex >= letters.Count || globalUsedIndices.Count == letters.Count)
//             return;
//
//         // Try generating words starting at each position
//         for (int i = startIndex; i < letters.Count; i++)
//         {
//             // Skip already used indices
//             if (globalUsedIndices.Contains(i))
//                 continue;
//
//             // Generate potential words starting at this position
//             List<WordCandidate> candidates = GenerateWordCandidates(letters, i, globalUsedIndices);
//
//             foreach (var candidate in candidates)
//             {
//                 // Query the vector database to find matching words
//                 List<string> matchingWords = QueryVectorDatabase(candidate.WordForm);
//
//                 if (matchingWords.Count > 0)
//                 {
//                     foreach (var word in matchingWords)
//                     {
//                         // Add the found word to the result
//                         result.Add(word);
//
//                         // Mark used indices
//                         foreach (int index in candidate.UsedIndices)
//                         {
//                             globalUsedIndices.Add(index);
//                         }
//
//                         // Recursively find more words with remaining letters
//                         FindWordCombinations(letters, result, globalUsedIndices, i + 1);
//
//                         // Backtrack
//                         result.RemoveAt(result.Count - 1);
//                         foreach (int index in candidate.UsedIndices)
//                         {
//                             globalUsedIndices.Remove(index);
//                         }
//                     }
//                 }
//             }
//         }
//     }
//
//     /// <summary>
//     /// Generates possible word candidates starting at the given index
//     /// </summary>
//     private List<WordCandidate> GenerateWordCandidates(List<string> letters, int startIndex,
//         HashSet<int> globalUsedIndices)
//     {
//         List<WordCandidate> candidates = new List<WordCandidate>();
//         StringBuilder currentWord = new StringBuilder();
//         List<int> currentIndices = new List<int>();
//
//         // Generate word candidates by combining letters with proper vowel-matra transformation
//         GenerateWordFormsHelper(letters, startIndex, globalUsedIndices, currentWord,
//             currentIndices, candidates);
//
//         return candidates;
//     }
//
//     /// <summary>
//     /// Helper method to recursively generate Sanskrit word forms
//     /// </summary>
//     private void GenerateWordFormsHelper(List<string> letters, int index, HashSet<int> globalUsedIndices,
//         StringBuilder currentWord, List<int> currentIndices,
//         List<WordCandidate> candidates)
//     {
//         // Stop if word exceeds maximum length
//         if (currentWord.Length > _maxWordLength)
//             return;
//
//         // Add current word as a candidate if not empty
//         if (currentWord.Length > 0)
//         {
//             candidates.Add(new WordCandidate
//             {
//                 WordForm = currentWord.ToString(),
//                 UsedIndices = new List<int>(currentIndices)
//             });
//         }
//
//         // Base case: end of letter list
//         if (index >= letters.Count)
//             return;
//
//         // Skip used indices
//         if (globalUsedIndices.Contains(index))
//         {
//             GenerateWordFormsHelper(letters, index + 1, globalUsedIndices, currentWord,
//                 currentIndices, candidates);
//             return;
//         }
//
//         string letter = letters[index];
//         int initialLength = currentWord.Length;
//         int initialIndicesCount = currentIndices.Count;
//
//         // Case 1: Letter is a consonant
//         if (_consonants.Contains(letter))
//         {
//             // If next letter is a vowel, combine with matra
//             if (index + 1 < letters.Count && _vowels.Contains(letters[index + 1]) &&
//                 !globalUsedIndices.Contains(index + 1))
//             {
//                 // Get the base consonant without virama
//                 string baseConsonant = letter.EndsWith("्") ? letter.Substring(0, letter.Length - 1) : letter;
//                 string vowel = letters[index + 1];
//
//                 if (currentWord.Length + baseConsonant.Length + (vowel != "अ" ? 1 : 0) <= _maxWordLength)
//                 {
//                     // Append consonant + vowel matra
//                     currentWord.Append(baseConsonant);
//                     currentIndices.Add(index);
//
//                     if (vowel != "अ" && _vowelToMatraMap.TryGetValue(vowel, out string matra))
//                     {
//                         currentWord.Append(matra);
//                     }
//
//                     currentIndices.Add(index + 1);
//
//                     // Add this as a candidate
//                     candidates.Add(new WordCandidate
//                     {
//                         WordForm = currentWord.ToString(),
//                         UsedIndices = new List<int>(currentIndices)
//                     });
//
//                     // Continue with next letters
//                     GenerateWordFormsHelper(letters, index + 2, globalUsedIndices, currentWord,
//                         currentIndices, candidates);
//
//                     // Backtrack
//                     currentWord.Length = initialLength;
//                     currentIndices.RemoveRange(initialIndicesCount, currentIndices.Count - initialIndicesCount);
//                 }
//             }
//
//             // Try consonant with virama
//             if (currentWord.Length + letter.Length <= _maxWordLength)
//             {
//                 currentWord.Append(letter);
//                 currentIndices.Add(index);
//
//                 // Add this as a candidate
//                 candidates.Add(new WordCandidate
//                 {
//                     WordForm = currentWord.ToString(),
//                     UsedIndices = new List<int>(currentIndices)
//                 });
//
//                 // Continue with next letter
//                 GenerateWordFormsHelper(letters, index + 1, globalUsedIndices, currentWord,
//                     currentIndices, candidates);
//
//                 // Backtrack
//                 currentWord.Length = initialLength;
//                 currentIndices.RemoveRange(initialIndicesCount, currentIndices.Count - initialIndicesCount);
//             }
//         }
//         // Case 2: Letter is a vowel
//         else if (_vowels.Contains(letter))
//         {
//             if (currentWord.Length + letter.Length <= _maxWordLength)
//             {
//                 currentWord.Append(letter);
//                 currentIndices.Add(index);
//
//                 // Add this as a candidate
//                 candidates.Add(new WordCandidate
//                 {
//                     WordForm = currentWord.ToString(),
//                     UsedIndices = new List<int>(currentIndices)
//                 });
//
//                 // Continue with next letter
//                 GenerateWordFormsHelper(letters, index + 1, globalUsedIndices, currentWord,
//                     currentIndices, candidates);
//
//                 // Backtrack
//                 currentWord.Length = initialLength;
//                 currentIndices.RemoveRange(initialIndicesCount, currentIndices.Count - initialIndicesCount);
//             }
//         }
//         // Case 3: Other characters
//         else
//         {
//             if (currentWord.Length + letter.Length <= _maxWordLength)
//             {
//                 currentWord.Append(letter);
//                 currentIndices.Add(index);
//
//                 // Add this as a candidate
//                 candidates.Add(new WordCandidate
//                 {
//                     WordForm = currentWord.ToString(),
//                     UsedIndices = new List<int>(currentIndices)
//                 });
//
//                 // Continue with next letter
//                 GenerateWordFormsHelper(letters, index + 1, globalUsedIndices, currentWord,
//                     currentIndices, candidates);
//
//                 // Backtrack
//                 currentWord.Length = initialLength;
//                 currentIndices.RemoveRange(initialIndicesCount, currentIndices.Count - initialIndicesCount);
//             }
//         }
//
//         // Skip this letter and try the next one
//         GenerateWordFormsHelper(letters, index + 1, globalUsedIndices, currentWord,
//             currentIndices, candidates);
//     }
//
//     /// <summary>
//     /// Queries the vector database for words matching the given word form
//     /// </summary>
//     private List<string> QueryVectorDatabase(string wordForm)
//     {
//         // Generate an embedding for the query word form
//         float[] queryEmbedding = GenerateEmbedding(wordForm);
//
//         // Perform vector similarity search
//         List<string> matchingWords = _vectorDatabase.FindSimilarWords(
//             queryEmbedding,
//             similarityThreshold: 0.85f, // Adjust threshold as needed
//             maxMatches: 5 // Limit number of results
//         );
//
//         // Filter results for exact matches if needed
//         return matchingWords.Where(word => IsExactMatch(wordForm, word)).ToList();
//     }
//
//     /// <summary>
//     /// Determines if the word form exactly matches a dictionary word
//     /// </summary>
//     private bool IsExactMatch(string wordForm, string dictionaryWord)
//     {
//         // This can be a simple equality check or a more sophisticated matching algorithm
//         return wordForm == dictionaryWord;
//     }
//
//
//     /// <summary>
//     /// Returns a set of Sanskrit vowels from the character set
//     /// </summary>
//     private HashSet<string> GetSanskritVowels()
//     {
//         return new HashSet<string>
//         {
//             "अ", "आ", "आा", "इ", "ई", "ईी", "उ", "ऊ", "ऊू", "ऋ", "ॠ", "ॠॄ",
//             "ए", "एा", "एाा", "ऐ", "ऐो", "ऐोो", "ओ", "ओो", "ओोो",
//             "औ", "औौ", "औौौ", "ऍ", "ऑ", "ऎ", "ऒ", "ऌ", "ॡ"
//         };
//     }
//
//     /// <summary>
//     /// Returns a set of Sanskrit consonants from the character set
//     /// </summary>
//     private HashSet<string> GetSanskritConsonants()
//     {
//         return new HashSet<string>
//         {
//             "क्", "ख्", "ग्", "घ्", "ङ्", "च्", "छ्", "ज्", "झ्", "ञ्",
//             "ट्", "ठ्", "ड्", "ढ्", "ण्", "त्", "थ्", "द्", "ध्", "न्",
//             "प्", "फ्", "ब्", "भ्", "म्", "य्", "र्", "ल्", "व्", "श्",
//             "ष्", "स्", "ह्", "क़्", "ख़्", "ग़्", "ज़्", "ड़्", "ढ़्",
//             "फ़्", "य़्", "ऴ्", "ऩ्", "ऱ्", "ळ्"
//         };
//     }
//
//     /// <summary>
//     /// Returns a mapping from vowels to their corresponding matras (vowel marks)
//     /// </summary>
//     private Dictionary<string, string> GetVowelToMatraMapping()
//     {
//         return new Dictionary<string, string>
//         {
//             // Basic vowels to matra mapping
//             { "अ", "" }, // No visible matra for 'a'
//             { "आ", "ा" }, // ā
//             { "आा", "ा" }, // ā (alternate)
//             { "इ", "ि" }, // i
//             { "ई", "ी" }, // ī
//             { "ईी", "ी" }, // ī (alternate)
//             { "उ", "ु" }, // u
//             { "ऊ", "ू" }, // ū
//             { "ऊू", "ू" }, // ū (alternate)
//             { "ऋ", "ृ" }, // ṛ
//             { "ॠ", "ॄ" }, // ṝ
//             { "ॠॄ", "ॄ" }, // ṝ (alternate)
//             { "ऌ", "ॢ" }, // ḷ
//             { "ॡ", "ॣ" }, // ḹ
//             { "ए", "े" }, // e
//             { "एा", "े" }, // e (alternate)
//             { "एाा", "े" }, // e (alternate)
//             { "ऐ", "ै" }, // ai
//             { "ऐो", "ै" }, // ai (alternate)
//             { "ऐोो", "ै" }, // ai (alternate)
//             { "ओ", "ो" }, // o
//             { "ओो", "ो" }, // o (alternate)
//             { "ओोो", "ो" }, // o (alternate)
//             { "औ", "ौ" }, // au
//             { "औौ", "ौ" }, // au (alternate)
//             { "औौौ", "ौ" }, // au (alternate)
//             { "ऍ", "ॅ" }, // ê
//             { "ऑ", "ॉ" }, // ô
//             { "ऎ", "ॆ" }, // ĕ
//             { "ऒ", "ॊ" }, // ŏ
//
//             // Special cases
//             { "ळु", "ु" }, // ḷu
//             { "ळू", "ू" } // ḷū
//         };
//     }
//
//     /// <summary>
//     /// Class to represent a word candidate with its used indices
//     /// </summary>
//     public class WordCandidate
//     {
//         public string WordForm { get; set; } // The actual word string
//         public List<int> UsedIndices { get; set; } // Indices of letters used
//     }
// }