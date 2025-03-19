using System.Text;
using Microsoft.EntityFrameworkCore;
using SiriBhuvalyaExtractor.Extractor;

namespace SiriBhuvalyaExtractor.WordMatcher;

public class WordMatch
{
    public static async Task ProcessSequence(List<string> letters, List<SanskritWord> words)
    {
        string currentWord = "";
        int startIndex = 0;

        Console.WriteLine("Processing sequence...");

        for (int i = 0; i < letters.Count; i++)
        {
            currentWord += letters[i].Replace("\"","");

            // Skip standalone half-letters (e.g., "्") unless preceded by a consonant and vowel
            if (currentWord.EndsWith("्") && i > 0 && !IsVowel(letters[i - 1]))
            {
                continue;
            }

            // Look up the current combined string in the database
            var matchingWord = words
                .FirstOrDefault(w => w.Word == currentWord);

            if (matchingWord != null)
            {
                // Update indices and print the found word
                // matchingWord.StartIndex = startIndex;
                // matchingWord.EndIndex = i;
                Console.WriteLine($"Found Word: {matchingWord.Word}, " +
                                  $"Meaning: {matchingWord.Gloss}, " +
                                  $"Indices: ({startIndex}, {i})");

                // Reset for the next word
                currentWord = "";
                startIndex = i + 1;
            }
        }
    }

    // Helper method to check if a letter is a vowel
    static bool IsVowel(string letter)
    {
        var vowels = new HashSet<string> { };
        foreach (var vowel in Constants.devnagri.Take(27).ToArray())
        {
            vowels.Add(vowel);
        }

        return vowels.Contains(letter);
    }
}