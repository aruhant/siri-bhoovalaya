using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Nodes;
using GenerativeAI;
using GenerativeAI.Core;
using GenerativeAI.Types;
using GenerativeAI.Utility;
using LangChain.Providers;
using LangChain.Providers.OpenRouter;
using SiriBhuvalyaExtractor.Extractor;

namespace SiriBhuvalyaExtractor.AI;

public class AIProcessor
{

    public async Task<List<Sentence>> Process(List<string> letters)
    {
        var model = new OpenRouterModel(new OpenRouterProvider(Environment.GetEnvironmentVariable("OPEN_ROUTER_API_KEY",EnvironmentVariableTarget.User)),OpenRouterModelIds.AnthropicClaude37Sonnet);
        //var model = new GenerativeModel(Environment.GetEnvironmentVariable("GOOGLE_API_KEY"),GoogleAIModels.Gemini2FlashLatest);

        // var prompt =
        //     $"Given a fixed sequence of Sanskrit letters, extract as many meaningful Sanskrit words as possible while maintaining the order of the letters. Each letter should be treated as half unless it is preceded by a vowel, which completes it. Once the words are extracted, construct grammatically correct and meaningful Sanskrit sentences using these words keeping the order they are generated in, ensuring that the sentences are coherent and poetic. Make sure the words are generated in the exact sequence they appear in the letter sequence, maintaining the integrity of the order. For each generated sentence: List the start and end indices of the words used in the sentence from the original sequence of letters. Provide the sentence in the generated form, ensuring it is grammatically correct and meaningful. Ensure each sentence is constructed step-by-step and the words used match the sequence of letters. Repeat this process for each sequence of words, providing the indices so that the sequence can be verified manually.\r\ndo the sentence creation for all the 729 letters.\r\n\r\n{string.Join(",", letters)}";

        var prompt =
            $"You are an AI designed to analyze a fixed sequence of Kannada letters. Your task is to extract as many meaningful Kannada words as possible while maintaining the exact order of the letters provided. Treat each consonant as a half-letter unless it is preceded by a vowel that completes it. Do not add any letters or words beyond what is explicitly given in the sequence. Once the words are extracted, construct grammatically correct, meaningful, and poetic Sanskrit sentences using these words in the order they are generated, ensuring coherence. For each sentence, provide:\n\nThe sentence in Sanskrit.\nIts meaning in English.\nThe start and end indices of the words used from the original sequence.\nProcess the entire sequence provided and present all sentences together as a single poem at the end. Here is the sequence of Sanskrit letters to analyze: [{string.Join(",",letters)}]. Do not deviate from the given instructions.";
        var json = JsonSerializer.Serialize((new SentenceList()).ToSchema());
        
        prompt = $"{prompt}\r\n\r\nOnly reply in following json: \r\n{json}";
        var request = new GenerateContentRequest();
        request.AddText(prompt);
        var chatRequest = new ChatRequest()
        {
            Messages = new []{new Message(prompt,MessageRole.Human)}
        };
        
        var sentences = new List<Sentence>();
        await foreach (var response in model.GenerateAsync(chatRequest))
        {
            var blocks= MarkdownExtractor.ExtractJsonBlocks(response.LastMessageContent);
            var items = blocks[0].ToObject<SentenceList>();
            sentences.AddRange(items.Sentences);
        }

        return sentences;
    }
}