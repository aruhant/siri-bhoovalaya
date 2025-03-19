using System.ComponentModel;
using System.Runtime.InteropServices;

namespace SiriBhuvalyaExtractor.Extractor;

public class SentenceList
{
    [Description("List of Sentences")]
    public List<Sentence> Sentences { get; set; }
}
public class Sentence
{
    [Description("List of Extracted Words")]
    public List<WordItem> Words { get; set; }
    [Description("Sentence Text")]
    public string SentenceText { get; set; }
    [Description("Meaning of the sentence in English")]
    public string Meaning { get; set; }
}

public class WordItem
{
    [Description("Extracted Word")]
    public string Word { get; set; }
    [Description("Start Index of the word")]
    public int StartIndex { get; set; }
    [Description("End Index of the word")]
    public int EndIndex { get; set; }
}