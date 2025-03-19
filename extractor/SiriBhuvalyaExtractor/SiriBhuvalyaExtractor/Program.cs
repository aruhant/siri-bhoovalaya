// See https://aka.ms/new-console-template for more information


using System.Diagnostics;
using System.Text;
using SiriBhuvalyaExtractor.AI;
using SiriBhuvalyaExtractor.Databases;
using SiriBhuvalyaExtractor.Extensions;
using SiriBhuvalyaExtractor.Extractor;
using SiriBhuvalyaExtractor.WordMatcher;

static void InitializeToroidalGrid(ToroidalGridHologram hologram, int[,] gridValues)
{
    int rows = gridValues.GetLength(0);
    int cols = gridValues.GetLength(1);

    // Set up vertices and their connections
    for (int i = 0; i < rows; i++)
    {
        for (int j = 0; j < cols; j++)
        {
            // Add the vertex to the hologram
            var vertex = new Vertex(i, j);
            vertex.Value = gridValues[i, j];
            hologram.Vertices.Add(vertex);

            // Create empty neighbor list
            if (!hologram.OutNeighbors.ContainsKey(vertex))
            {
                hologram.OutNeighbors[vertex] = new List<Vertex>();
            }
        }
    }

    // Connect each vertex to its 8 neighbors (orthogonal + diagonal)
    foreach (var vertex in hologram.Vertices)
    {
        int row = vertex.Row;
        int col = vertex.Col;

        // Connect to all 8 neighbors (with wraparound for toroidal grid)
        for (int dr = -1; dr <= 1; dr++)
        {
            for (int dc = -1; dc <= 1; dc++)
            {
                // Skip self
                if (dr == 0 && dc == 0) continue;

                // Calculate neighbor coordinates with wraparound
                int nr = (row + dr + rows) % rows;
                int nc = (col + dc + cols) % cols;

                // Find the neighbor vertex
                var neighbor = hologram.Vertices.FirstOrDefault(v => v.Row == nr && v.Col == nc);

                if (neighbor != null)
                {
                    hologram.OutNeighbors[vertex].Add(neighbor);
                }
            }
        }
    }
}

//
/// <summary>
/// Verify the Hamiltonian cycle
/// </summary>
static bool VerifyCycle(List<Vertex> cycle, int[,] gridValues)
{
    Console.WriteLine($"Cycle length: {cycle.Count}");
    //Console.WriteLine($"Unique vertices: {cycle.Count(v => v.SegmentLevel != 0 && v.SegmentLevel != ToroidalGridHologram.GridSize * ToroidalGridHologram.GridSize).ToString()}");

    // Verify phonetic constraints
    bool valid = true;
    int maxConsecutiveVowels = 0;
    int currentConsecutiveVowels = 0;
    int maxConsecutiveConsonants = 0;
    int currentConsecutiveConsonants = 0;

    for (int i = 0; i < cycle.Count; i++)
    {
        if (cycle[i].IsVowel)
        {
            currentConsecutiveVowels++;
            currentConsecutiveConsonants = 0;
            maxConsecutiveVowels = Math.Max(maxConsecutiveVowels, currentConsecutiveVowels);
        }
        else if (cycle[i].IsConsonant)
        {
            currentConsecutiveConsonants++;
            currentConsecutiveVowels = 0;
            maxConsecutiveConsonants = Math.Max(maxConsecutiveConsonants, currentConsecutiveConsonants);
        }
        // Special characters reset both counts
        else if (cycle[i].IsSpecial)
        {
            currentConsecutiveVowels = 0;
            currentConsecutiveConsonants = 0;
        }
    }

    if (maxConsecutiveVowels > 3)
    {
        Console.WriteLine($"ERROR: Vowel constraint violated: {maxConsecutiveVowels} consecutive vowels");
        valid = false;
    }

    if (maxConsecutiveConsonants > 4)
    {
        Console.WriteLine($"ERROR: Consonant constraint violated: {maxConsecutiveConsonants} consecutive consonants");
        valid = false;
    }

    // Verify adjacency in the toroidal grid
    for (int i = 0; i < cycle.Count - 1; i++)
    {
        Vertex current = cycle[i];
        Vertex next = cycle[i + 1];

        // if (current.SegmentLevel == 0 || next.SegmentLevel == ToroidalGridHologram.GridSize * ToroidalGridHologram.GridSize)
        //     continue; // Skip the initial and final vertices

        bool isAdjacent = IsAdjacent(current.Row, current.Col, next.Row, next.Col);
        if (!isAdjacent)
        {
            Console.WriteLine($"ERROR: Non-adjacent vertices at position {i}: {current} -> {next}");
            valid = false;
        }
    }

    if (valid)
    {
        Console.WriteLine("All constraints verified successfully!");
        Console.WriteLine("Sample of the path (first 20 vertices):");
        // var sb = new StringBuilder();
        // var sb2 = new StringBuilder();
        // var random = new Random();
        //sb2.AppendLine("\r\n\r\n");
        for (int i = 0; i < cycle.Count - 1; i++)
        {
            string type = cycle[i].IsVowel ? "Vowel" :
                cycle[i].IsConsonant ? "Consonant" : "Special";
            Console.WriteLine($"{i}: {cycle[i]} ({type})");
            // sb2.AppendLine($"{cycle[i].Row},{cycle[i].Col},");
            // sb.Append($"\"{decoder.devnagri[cycle[i].Value - 1]}\",");
        }

        // var fileName = $"sample{random.Next()}.txt";
        //
        // File.WriteAllText(fileName, sb.ToString());
        // File.AppendAllText(fileName, sb2.ToString());
    }

    return valid;
}

/// <summary>
/// Check if two cells are adjacent in the toroidal grid (including diagonals)
/// </summary>
static bool IsAdjacent(int row1, int col1, int row2, int col2)
{
    int gridSize = ToroidalGridHologram.GridSize;

    // Calculate minimum distance with wrapping in horizontal direction
    int dCol = Math.Min(
        Math.Abs(col1 - col2), // Direct distance
        gridSize - Math.Abs(col1 - col2) // Wrapped distance
    );

    // Calculate minimum distance with wrapping in vertical direction
    int dRow = Math.Min(
        Math.Abs(row1 - row2), // Direct distance
        gridSize - Math.Abs(row1 - row2) // Wrapped distance
    );

    // Adjacent if at most one step in each direction (including diagonals)
    // But exclude the case where we're comparing a cell with itself
    return dRow <= 1 && dCol <= 1 && !(dRow == 0 && dCol == 0);
}

//var context = new SanskritDbContext();
//var words = context.SanskritWords.ToList();

// List<SanskritWord> dictionary = new List<SanskritWord>();
//                                      foreach (var word in words)
//                                      {
//                                          var x = Encoding.UTF8.GetString(word.Synset);
//                                          var y = Encoding.UTF8.GetString(word.Gloss);
//                                          var wds = x.Split(",").ToList();
//                                          foreach (var wd in wds)
//                                          {
//                                              dictionary.Add(new SanskritWord(){Word = wd,Gloss = y});
//                                          }
//                                      }
//                                      SanskritWordProcessor wordExtractor =
//                                          new SanskritWordProcessor(new SanskritCharacterMatcher(), dictionary);
if (args.Length == 0)
{
    Console.WriteLine("Usage: SiriBhuvalyaExtractor <filename> <output-folder>");
}
else
{
    
    var chakra = File.ReadAllText(args[0])
        .Split("\r\n, \t".ToArray(),StringSplitOptions.RemoveEmptyEntries)
        .Select(s=>s.Trim())
        .Select(int.Parse).ToArray();

   

    var outputFolder =args.Length == 1? "output": args[1];
    
    if (!Directory.Exists(outputFolder))
        Directory.CreateDirectory(outputFolder);

    var hologram = new ToroidalGridHologram(); // Initialize with your grid

    var gridValues = chakra.To2DArray();

   
    // Configure the hologram to allow diagonal movement
    InitializeToroidalGrid(hologram, gridValues);

    var solver2 = new WarnsdorffHamiltonianPathFinder(hologram, gridValues);

    HashSet<string> seen = new HashSet<string>();
    while (true)
    {
        try
        {
            var solution = solver2.FindHamiltonianPathWarnsdorff();
            // // var solutions = solver.FindLimitedHamiltonianPaths(1);
            var x = solver2.GetPathHash(solution);
            if (!seen.Add(x))
            {
                //var solution = solutions.First();
                Console.WriteLine("Solution found:");
                Console.WriteLine($"Path length: {solution.Count}");
                Console.WriteLine($"Complete cycle: {solution.First().Equals(solution.Last())}");

                if (VerifyCycle(solution, gridValues))
                {

                    // Print the solution
                    StringBuilder path = new StringBuilder();
                    StringBuilder path2 = new StringBuilder();
                    StringBuilder path3 = new StringBuilder();
                    path3.Append("\r\n\r\nKannada: \r\n");
                    path.Append("\r\n\r\nPath: ");
                    foreach (var vertex in solution)
                    {
                        path.Append($"({vertex.Row},{vertex.Col}):{gridValues[vertex.Row, vertex.Col]} -> ");
                        path2.Append($"\"{Constants.devnagri[gridValues[vertex.Row, vertex.Col] - 1]}\",");
                        path3.Append(
                            $"\"{Constants.kannadaScriptCharacters[gridValues[vertex.Row, vertex.Col] - 1]}\",");
                    }

                    var random = new Random();
                    var fileName = Path.Combine(outputFolder, $"sample{random.Next()}.txt");
                    File.WriteAllText(fileName, path2.ToString());
                    File.AppendAllText(fileName, path3.ToString());


                    
                    // wordExtractor.FindSanskritWords(
                    //     path2.ToString().Split(",".ToCharArray(), StringSplitOptions.RemoveEmptyEntries).Select(s=>s.Replace("\"","")).ToList());
                    try
                    {
                        var aiProcess = new AIProcessor();
                        var sentences = await aiProcess.Process(path2.ToString().Split(",").ToList());
                    
                    
                        File.AppendAllText(fileName,"\r\n\r\n"+
                            string.Join("\r\n",
                                sentences.Select(s => $"{s.SentenceText}\r\n{s.Meaning}\r\n{JoinWords(s)}\r\n\r\n")));
                    }
                    catch
                    {
                        
                    }

                    File.AppendAllText(fileName, path.ToString());
                    Console.WriteLine(path.ToString().TrimEnd(' ', '-', '>'));
                    // var strings = path2.ToString().Split(",");
                    // WordMatch.ProcessSequence(strings.ToList(), words2);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }
    
    static string JoinWords(Sentence sentence)
    {
        return string.Join(",",
            sentence.Words.Select(w => $"{w.Word}: {w.StartIndex} - {w.EndIndex}"));
    }
}