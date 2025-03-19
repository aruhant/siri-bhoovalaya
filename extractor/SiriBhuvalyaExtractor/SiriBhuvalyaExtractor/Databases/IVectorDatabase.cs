namespace SiriBhuvalyaExtractor.Databases;

public interface IVectorDatabase
{
    void AddWordEmbedding(string word, float[] embedding);
    void BuildIndices();
    List<string> FindSimilarWords(float[] queryEmbedding, float similarityThreshold, int maxMatches);
}