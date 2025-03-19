namespace SiriBhuvalyaExtractor.Databases;

public class SanskritCharacterMatcher : IVectorDatabase
{
    private readonly Dictionary<string, string[]> _wordsDictionary = new Dictionary<string, string[]>();
    private readonly Dictionary<string, List<string>> _characterToWordsMap = new Dictionary<string, List<string>>();
    
    /// <summary>
    /// Adds a word to the dictionary by splitting it into characters
    /// (ignores the embedding parameter to match the interface)
    /// </summary>
    public void AddWordEmbedding(string word, float[] embedding)
    {
        // Split the word into Sanskrit characters
        string[] characters = SplitIntoSanskritCharacters(word);
        _wordsDictionary[word] = characters;
        
        // Index each character to enable lookup
        foreach (string character in characters)
        {
            if (!_characterToWordsMap.ContainsKey(character))
            {
                _characterToWordsMap[character] = new List<string>();
            }
            
            if (!_characterToWordsMap[character].Contains(word))
            {
                _characterToWordsMap[character].Add(word);
            }
        }
    }
    
    /// <summary>
    /// No additional indexing required
    /// </summary>
    public void BuildIndices()
    {
        // No additional work needed
    }
    
    /// <summary>
    /// Finds words containing the characters from the input word
    /// </summary>
    public List<string> FindSimilarWords(float[] queryEmbedding, float similarityThreshold, int maxMatches)
    {
        // We'll replace this with a direct string parameter in a real implementation
        string queryWord = _currentQueryWord;
        
        // Get the characters in the query word
        string[] queryCharacters = SplitIntoSanskritCharacters(queryWord);
        
        // Find all words that contain some of these characters
        Dictionary<string, int> candidateWords = new Dictionary<string, int>();
        
        foreach (string character in queryCharacters)
        {
            if (_characterToWordsMap.ContainsKey(character))
            {
                foreach (string word in _characterToWordsMap[character])
                {
                    if (!candidateWords.ContainsKey(word))
                    {
                        candidateWords[word] = 0;
                    }
                    candidateWords[word]++;
                }
            }
        }
        
        // Calculate match percentages
        List<(string Word, float Score)> scoredCandidates = new List<(string, float)>();
        
        foreach (var entry in candidateWords)
        {
            string word = entry.Key;
            int matchCount = entry.Value;
            string[] wordChars = _wordsDictionary[word];
            
            // Calculate percentage of word characters that match the query
            float score = (float)matchCount / wordChars.Length;
            
            // If we have the exact same characters (permutation), give highest score
            if (queryCharacters.Length == wordChars.Length && matchCount == wordChars.Length)
            {
                score = 1.0f;
            }
            
            if (score >= similarityThreshold)
            {
                scoredCandidates.Add((word, score));
            }
        }
        
        // Return the top matches
        return scoredCandidates
            .OrderByDescending(x => x.Score)
            .Take(maxMatches)
            .Select(x => x.Word)
            .ToList();
    }
    
    // Temporary property to store the current query word - in a real implementation,
    // this would be passed as a parameter to FindSimilarWords
    private string _currentQueryWord;
    
    /// <summary>
    /// Set the current query word for matching
    /// </summary>
    public void SetQueryWord(string word)
    {
        _currentQueryWord = word;
    }
    
    /// <summary>
    /// Splits a Sanskrit word into its constituent characters
    /// </summary>
    private string[] SplitIntoSanskritCharacters(string word)
    {
        List<string> result = new List<string>();
        
        for (int i = 0; i < word.Length; )
        {
            // Handle consonant clusters with virama
            if (i + 2 < word.Length && 
                IsConsonant(word[i]) && 
                IsVirama(word[i + 1]) && 
                IsConsonant(word[i + 2]))
            {
                // Get the entire conjunct consonant
                int endIndex = i + 2;
                while (endIndex + 1 < word.Length && 
                       IsVirama(word[endIndex]) && 
                       IsConsonant(word[endIndex + 1]))
                {
                    endIndex += 2;
                }
                
                result.Add(word.Substring(i, endIndex - i + 1));
                i = endIndex + 1;
            }
            // Handle consonant with vowel mark
            else if (i + 1 < word.Length && 
                     IsConsonant(word[i]) && 
                     IsVowelMark(word[i + 1]))
            {
                // Find the end of the vowel mark sequence
                int endIndex = i + 1;
                while (endIndex + 1 < word.Length && 
                       (IsVowelMark(word[endIndex + 1]) || 
                        IsAnusvaraOrVisarga(word[endIndex + 1])))
                {
                    endIndex++;
                }
                
                result.Add(word.Substring(i, endIndex - i + 1));
                i = endIndex + 1;
            }
            // Handle independent vowel or consonant
            else
            {
                result.Add(word.Substring(i, 1));
                i++;
            }
        }
        
        return result.ToArray();
    }
    
    /// <summary>
    /// Checks if a character is a Sanskrit consonant
    /// </summary>
    private bool IsConsonant(char c)
    {
        // Range of Sanskrit consonants (approximate)
        return (c >= '\u0915' && c <= '\u0939');
    }
    
    /// <summary>
    /// Checks if a character is a virama (halant)
    /// </summary>
    private bool IsVirama(char c)
    {
        return c == '\u094D'; // DEVANAGARI SIGN VIRAMA
    }
    
    /// <summary>
    /// Checks if a character is a vowel mark (matra)
    /// </summary>
    private bool IsVowelMark(char c)
    {
        // Range of Sanskrit vowel marks
        return (c >= '\u093E' && c <= '\u094C') || c == '\u0962' || c == '\u0963';
    }
    
    /// <summary>
    /// Checks if a character is anusvara or visarga
    /// </summary>
    private bool IsAnusvaraOrVisarga(char c)
    {
        return c == '\u0902' || c == '\u0903';
    }
}