namespace SiriBhuvalyaExtractor.Extractor;

using System.Diagnostics;
using System.Text;

public class WarnsdorffHamiltonianPathFinder
{
    private readonly ToroidalGridHologram hologram;
    private readonly int[,] gridValues;
    private readonly int rows;
    private readonly int cols;
    private readonly Random random = new Random(42);

    // Updated constraints based on your requirements
    private readonly int maxConsecutiveVowels = 2;
    private readonly int maxConsecutiveConsonants = 2;
    private readonly int maxAttempts = 10000;
    int numberOfConsonants => maxConsecutiveConsonants;
    public WarnsdorffHamiltonianPathFinder(ToroidalGridHologram hologram, int[,] gridValues)
    {
        this.hologram = hologram;
        this.gridValues = gridValues;
        this.rows = gridValues.GetLength(0);
        this.cols = gridValues.GetLength(1);
    }

    public List<List<Vertex>> FindMultipleHamiltonianPaths(int pathCount = 100, int timeoutSeconds = 300)
    {
        var stopwatch = Stopwatch.StartNew();
        var random = new Random();
        var foundPaths = new List<List<Vertex>>();
        var pathHashes = new HashSet<string>(); // To track unique paths

        Console.WriteLine($"Starting search for {pathCount} Hamiltonian paths using Warnsdorff's algorithm...");

        int attempts = 0;
        int maxAttempts = 100000; // Set a reasonable limit to prevent infinite loops

        while (foundPaths.Count < pathCount &&
               attempts < maxAttempts &&
               stopwatch.Elapsed.TotalSeconds < timeoutSeconds)
        {
            attempts++;

            // Pick a random starting vertex
            Vertex startVertex = hologram.Vertices[random.Next(hologram.Vertices.Count)];

            var path = new List<Vertex> { startVertex };
            var visited = new HashSet<Vertex> { startVertex };

            int consecutiveVowels = IsVowel(startVertex) ? 1 : 0;
            int consecutiveConsonants = IsConsonant(startVertex) ? 1 : 0;
            bool deadEnd = false;

            // Try to build a complete path
            while (path.Count < hologram.Vertices.Count && !deadEnd)
            {
                Vertex current = path[path.Count - 1];

                // Get all unvisited neighbors that don't violate constraints
                var validNeighbors = GetAllDiagonalNeighbors(current)
                    .Where(n => !visited.Contains(n))
                    .ToList();

                // Filter out neighbors that would violate consecutive constraints
                var constraintFilteredNeighbors = new List<Vertex>();

                foreach (var n in validNeighbors)
                {
                    int newConsecutiveVowels = IsVowel(n) ? (IsVowel(current) ? consecutiveVowels + 1 : 1) : 0;

                    int newConsecutiveConsonants =
                        IsConsonant(n) ? (IsConsonant(current) ? consecutiveConsonants + 1 : 1) : 0;

                    if (newConsecutiveVowels <= maxConsecutiveVowels && newConsecutiveConsonants <= numberOfConsonants)
                    {
                        constraintFilteredNeighbors.Add(n);
                    }
                }

                if (constraintFilteredNeighbors.Count == 0)
                {
                    // Dead end, this attempt failed
                    deadEnd = true;
                    continue;
                }

                // Introduce controlled randomness for diversity of paths
                if (constraintFilteredNeighbors.Count > 1)
                {
                    // Sort neighbors by degree (number of their unvisited neighbors)
                    constraintFilteredNeighbors = constraintFilteredNeighbors
                        .OrderBy(n => GetAllDiagonalNeighbors(n).Count(nn => !visited.Contains(nn)))
                        .ToList();

                    // Select from top candidates with some randomness
                    int selectionPool = Math.Min(3, constraintFilteredNeighbors.Count);
                    double randomFactor = random.NextDouble();

                    // More randomness in early paths to explore diverse solutions
                    // Less randomness in later paths to ensure we find valid paths
                    double randomThreshold = 0.3 * (1.0 - (double)foundPaths.Count / pathCount);

                    int pickIndex;
                    if (randomFactor < randomThreshold)
                    {
                        // Pick randomly from top candidates
                        pickIndex = random.Next(selectionPool);
                    }
                    else
                    {
                        // Follow Warnsdorff's rule (pick vertex with fewest next options)
                        pickIndex = 0;
                    }

                    Vertex next = constraintFilteredNeighbors[pickIndex];

                    // Update path and state
                    path.Add(next);
                    visited.Add(next);

                    // Update consecutive counts
                    consecutiveVowels = IsVowel(next) ? (IsVowel(current) ? consecutiveVowels + 1 : 1) : 0;

                    consecutiveConsonants =
                        IsConsonant(next) ? (IsConsonant(current) ? consecutiveConsonants + 1 : 1) : 0;
                }
                else
                {
                    // Only one valid neighbor, add it
                    Vertex next = constraintFilteredNeighbors[0];

                    // Update path and state
                    path.Add(next);
                    visited.Add(next);

                    // Update consecutive counts
                    consecutiveVowels = IsVowel(next) ? (IsVowel(current) ? consecutiveVowels + 1 : 1) : 0;

                    consecutiveConsonants =
                        IsConsonant(next) ? (IsConsonant(current) ? consecutiveConsonants + 1 : 1) : 0;
                }
            }

            // Check if we found a complete path
            if (path.Count == hologram.Vertices.Count)
            {
                // Generate a hash for the path to check uniqueness
                string pathHash = GeneratePathHash(path);

                if (!pathHashes.Contains(pathHash))
                {
                    pathHashes.Add(pathHash);
                    foundPaths.Add(new List<Vertex>(path));

                    Console.WriteLine($"Found unique Hamiltonian path #{foundPaths.Count} " +
                                      $"(attempt {attempts}, time: {stopwatch.Elapsed.TotalSeconds}s)");

                    // Early reporting to show progress
                    if (foundPaths.Count % 10 == 0)
                    {
                        Console.WriteLine($"Found {foundPaths.Count}/{pathCount} paths " +
                                          $"({stopwatch.Elapsed.TotalSeconds}s elapsed)");
                    }
                }
            }

            // Occasional status update
            if (attempts % 1000 == 0)
            {
                Console.WriteLine($"Made {attempts} attempts, found {foundPaths.Count} paths " +
                                  $"({stopwatch.Elapsed.TotalSeconds}s elapsed)");
            }
        }

        stopwatch.Stop();
        Console.WriteLine($"Search completed in {stopwatch.Elapsed.TotalSeconds} seconds");
        Console.WriteLine($"Found {foundPaths.Count}/{pathCount} unique Hamiltonian paths " +
                          $"after {attempts} attempts");

        return foundPaths;
    }

// Helper method to generate a hash for a path
    private string GeneratePathHash(List<Vertex> path)
    {
        // We'll use a simple hash that captures the sequence of vertices
        // For added uniqueness, we'll hash both forward and backward directions
        var forwardBuilder = new StringBuilder();
        var backwardBuilder = new StringBuilder();

        for (int i = 0; i < path.Count; i++)
        {
            forwardBuilder.Append($"{path[i].Row},{path[i].Col}|");
            backwardBuilder.Append($"{path[path.Count - 1 - i].Row},{path[path.Count - 1 - i].Col}|");
        }

        string forward = forwardBuilder.ToString();
        string backward = backwardBuilder.ToString();

        // Use the lexicographically smaller representation as the canonical form
        return string.Compare(forward, backward) < 0 ? forward : backward;
    }

    public List<Vertex> FindHamiltonianPathWarnsdorff(int timeoutSeconds = 120)
    {
        var stopwatch = Stopwatch.StartNew();
        Console.WriteLine("Starting Warnsdorff's algorithm search...");

        // Try multiple starting positions
        var random = new Random();
        for (int attempt = 0; attempt < maxAttempts && stopwatch.Elapsed.TotalSeconds < timeoutSeconds; attempt++)
        {
            // Pick a random starting vertex
            Vertex startVertex = hologram.Vertices[random.Next(hologram.Vertices.Count)];

            var path = new List<Vertex> { startVertex };
            var visited = new HashSet<Vertex> { startVertex };

            int consecutiveVowels = IsVowel(startVertex) ? 1 : 0;
            int consecutiveConsonants = IsConsonant(startVertex) ? 1 : 0;

            // Try to build a complete path
            while (path.Count < hologram.Vertices.Count)
            {
                Vertex current = path[path.Count - 1];

                // Get all unvisited neighbors that don't violate constraints
                var validNeighbors = GetAllDiagonalNeighbors(current)
                    .Where(n => !visited.Contains(n))
                    .ToList();

                // Filter out neighbors that would violate consecutive constraints
                validNeighbors = validNeighbors.Where(n =>
                {
                    int newConsecutiveVowels = IsVowel(n) ? (IsVowel(current) ? consecutiveVowels + 1 : 1) : 0;

                    int newConsecutiveConsonants =
                        IsConsonant(n) ? (IsConsonant(current) ? consecutiveConsonants + 1 : 1) : 0;

                    return newConsecutiveVowels <= maxConsecutiveVowels && newConsecutiveConsonants <= this.numberOfConsonants;
                }).ToList();

                if (validNeighbors.Count == 0)
                {
                    // Dead end, this attempt failed
                    break;
                }

                // Sort neighbors by degree (number of their unvisited neighbors)
                validNeighbors = validNeighbors
                    .OrderBy(n => GetAllDiagonalNeighbors(n).Count(nn => !visited.Contains(nn)))
                    .ToList();

                // Pick the neighbor with fewest unvisited neighbors (Warnsdorff's rule)
                Vertex next = validNeighbors[0];

                // Update path and state
                path.Add(next);
                visited.Add(next);

                // Update consecutive counts
                consecutiveVowels = IsVowel(next) ? (IsVowel(current) ? consecutiveVowels + 1 : 1) : 0;

                consecutiveConsonants = IsConsonant(next) ? (IsConsonant(current) ? consecutiveConsonants + 1 : 1) : 0;

                if (path.Count % 100 == 0)
                {
                    Console.WriteLine(
                        $"Attempt {attempt + 1}: Path length so far: {path.Count}/{hologram.Vertices.Count}");
                }
            }

            // Check if we found a complete path
            if (path.Count == hologram.Vertices.Count)
            {
                Console.WriteLine($"Found Hamiltonian path in {stopwatch.Elapsed.TotalSeconds} seconds!");
                return path;
            }

            Console.WriteLine($"Attempt {attempt + 1} failed, reached {path.Count}/{hologram.Vertices.Count} vertices");
        }

        stopwatch.Stop();
        Console.WriteLine($"Search completed in {stopwatch.Elapsed.TotalSeconds} seconds");
        Console.WriteLine("No Hamiltonian path found");

        return new List<Vertex>();
    }

    public List<List<Vertex>> FindAllHamiltonianPaths(int timeoutSeconds = 120)
    {
        var allPaths = new HashSet<string>();
        var pathsList = new List<List<Vertex>>();
        var stopwatch = Stopwatch.StartNew();

        Console.WriteLine("Starting search for Hamiltonian paths with consecutive constraints...");

        // Use iterative approach with consecutive constraint awareness
        IterativeConsecutiveConstrainedSearch(allPaths, pathsList, stopwatch, timeoutSeconds);

        stopwatch.Stop();
        Console.WriteLine($"Search completed in {stopwatch.Elapsed.TotalSeconds} seconds");
        Console.WriteLine($"Found {pathsList.Count} unique Hamiltonian paths");

        return pathsList;
    }
  
    private void IterativeConsecutiveConstrainedSearch(HashSet<string> allPaths, List<List<Vertex>> pathsList,
        Stopwatch stopwatch, int timeoutSeconds)
    {
        // Priority queue for A* search
        var openSet = new PriorityQueue<ConsecutiveSearchState, int>();
        var closedSet = new HashSet<string>();

        
        // Try multiple starting positions for better coverage
        var random = new Random();
        var startingVertices = new List<Vertex>();

        // Select a diverse set of starting vertices
        for (int i = 0; i < Math.Min(10, hologram.Vertices.Count); i++)
        {
            startingVertices.Add(hologram.Vertices[random.Next(hologram.Vertices.Count)]);
        }

        foreach (var startVertex in startingVertices)
        {
            // Track consecutive vowels/consonants rather than total
            var initialConsecutiveVowels = IsVowel(startVertex) ? 1 : 0;
            var initialConsecutiveConsonants = IsConsonant(startVertex) ? 1 : 0;

            var initialState = new ConsecutiveSearchState(
                new List<Vertex> { startVertex },
                new HashSet<Vertex> { startVertex },
                initialConsecutiveVowels,
                initialConsecutiveConsonants
            );

            // Priority based on how many vertices we've visited
            openSet.Enqueue(initialState, hologram.Vertices.Count - 1);

            int stateCount = 0;

            while (openSet.Count > 0 && stopwatch.Elapsed.TotalSeconds < timeoutSeconds)
            {
                stateCount++;
                if (stateCount % 100000 == 0)
                {
                    Console.WriteLine($"Explored {stateCount} states, queue size: {openSet.Count}");
                }

                var state = openSet.Dequeue();

                // Check if we've found a Hamiltonian path
                if (state.Visited.Count == hologram.Vertices.Count)
                {
                    string pathHash = GetPathHash(state.Path);
                    if (!allPaths.Contains(pathHash))
                    {
                        allPaths.Add(pathHash);
                        pathsList.Add(new List<Vertex>(state.Path));
                        Console.WriteLine($"Found unique Hamiltonian path!");
                        return; // Found one path, exit
                    }

                    continue;
                }

                // Skip if we've already explored an equivalent state
                string stateKey = GetConsecutiveStateKey(state);
                if (closedSet.Contains(stateKey)) continue;
                closedSet.Add(stateKey);

                // Get current vertex
                var current = state.Path[state.Path.Count - 1];

                // Consider diagonal neighbors for toroidal grid
                foreach (var neighbor in GetAllDiagonalNeighbors(current))
                {
                    // Skip visited neighbors
                    if (state.Visited.Contains(neighbor)) continue;

                    // Check and update consecutive vowel/consonant counts
                    int newConsecutiveVowels =
                        IsVowel(neighbor) ? (IsVowel(current) ? state.ConsecutiveVowels + 1 : 1) : 0;

                    int newConsecutiveConsonants = IsConsonant(neighbor)
                        ? (IsConsonant(current) ? state.ConsecutiveConsonants + 1 : 1)
                        : 0;

                    // Skip if constraints would be violated
                    if (newConsecutiveVowels > maxConsecutiveVowels || newConsecutiveConsonants > this.numberOfConsonants)
                        continue;

                    // Create new state
                    var newPath = new List<Vertex>(state.Path) { neighbor };
                    var newVisited = new HashSet<Vertex>(state.Visited) { neighbor };

                    var newState = new ConsecutiveSearchState(
                        newPath,
                        newVisited,
                        newConsecutiveVowels,
                        newConsecutiveConsonants
                    );

                    // Priority - prefer states that have visited more vertices
                    int priority = hologram.Vertices.Count - newVisited.Count;
                    openSet.Enqueue(newState, priority);
                }
            }

            // Clear for next starting vertex
            openSet.Clear();
            closedSet.Clear();

            if (stopwatch.Elapsed.TotalSeconds >= timeoutSeconds)
            {
                Console.WriteLine("Search timeout reached.");
                break;
            }
        }
    }

// Get all diagonal neighbors in a toroidal grid
    private List<Vertex> GetAllDiagonalNeighbors(Vertex vertex)
    {
        var neighbors = new List<Vertex>();

        // Assuming the grid dimensions are known
        int width = (int)Math.Sqrt(hologram.Vertices.Count);
        int height = width;

        // Get diagonal neighbors (NE, SE, SW, NW)
        // All 8 directions: N, NE, E, SE, S, SW, W, NW
        int[] dx = { 0, 1, 1, 1, 0, -1, -1, -1 };
        int[] dy = { -1, -1, 0, 1, 1, 1, 0, -1 };

        for (int i = 0; i < 8; i++)
        {
            // Calculate neighbor coordinates with wrapping for toroidal grid
            int newRow = (vertex.Row + dy[i] + height) % height;
            int newCol = (vertex.Col + dx[i] + width) % width;

            // Find the vertex at these coordinates
            var neighbor = hologram.Vertices.FirstOrDefault(v => v.Row == newRow && v.Col == newCol);

            if (neighbor != null)
            {
                neighbors.Add(neighbor);
            }
        }

        return neighbors;
    }

    private string GetConsecutiveStateKey(ConsecutiveSearchState state)
    {
        // Create a key that identifies this state uniquely
        // We only care about current position, consecutive counts, and visited vertices
        var current = state.Path[state.Path.Count - 1];
        return
            $"{current.Row},{current.Col}|{state.ConsecutiveVowels}|{state.ConsecutiveConsonants}|{state.Visited.Count}";
    }

// Define a state class for consecutive constraints
    private class ConsecutiveSearchState
    {
        public List<Vertex> Path { get; }
        public HashSet<Vertex> Visited { get; }
        public int ConsecutiveVowels { get; }
        public int ConsecutiveConsonants { get; }

        public ConsecutiveSearchState(List<Vertex> path, HashSet<Vertex> visited,
            int consecutiveVowels, int consecutiveConsonants)
        {
            Path = path;
            Visited = visited;
            ConsecutiveVowels = consecutiveVowels;
            ConsecutiveConsonants = consecutiveConsonants;
        }

        // For deep copying if needed
        public ConsecutiveSearchState Clone()
        {
            return new ConsecutiveSearchState(
                new List<Vertex>(Path),
                new HashSet<Vertex>(Visited),
                ConsecutiveVowels,
                ConsecutiveConsonants
            );
        }
    }


    private void AnalyzeGrid()
    {
        int vowelCount = 0;
        int consonantCount = 0;
        int specialCount = 0;

        foreach (var vertex in hologram.Vertices)
        {
            if (IsVowel(vertex)) vowelCount++;
            else if (IsConsonant(vertex)) consonantCount++;
            else specialCount++;
        }

        Console.WriteLine(
            $"Grid analysis: {vowelCount} vowels, {consonantCount} consonants, {specialCount} special characters");
        Console.WriteLine($"Total vertices: {hologram.Vertices.Count}");

        if (vowelCount > maxConsecutiveVowels || consonantCount > this.numberOfConsonants)
        {
            Console.WriteLine("WARNING: Grid contains more vowels/consonants than allowed in path!");
            Console.WriteLine("A Hamiltonian path is only possible if:");
            Console.WriteLine("- The grid has AT MOST 2 vowel cells");
            Console.WriteLine("- The grid has AT MOST 4 consonant cells");
            Console.WriteLine("- All other cells are special characters");
        }
    }

    private void ImprovedIterativeSearch(HashSet<string> allPaths, List<List<Vertex>> pathsList,
        Stopwatch stopwatch, int timeoutSeconds)
    {
        // Find all vowel and consonant vertices
        var vowelVertices = hologram.Vertices.Where(IsVowel).ToList();
        var consonantVertices = hologram.Vertices.Where(IsConsonant).ToList();

        // If there are more than constraints allow, a Hamiltonian path is impossible
        if (vowelVertices.Count > maxConsecutiveVowels || consonantVertices.Count > this.numberOfConsonants)
        {
            Console.WriteLine("No Hamiltonian path possible with given constraints.");
            return;
        }

        // Use bi-directional search starting from special characters
        var specialVertices = hologram.Vertices.Where(IsSpecial).ToList();

        // If no special characters, try starting from any vertex
        var startVertices = specialVertices.Count > 0 ? specialVertices : hologram.Vertices.ToList();

        // Try to find a path starting from each special character
        foreach (var startVertex in startVertices)
        {
            if (stopwatch.Elapsed.TotalSeconds >= timeoutSeconds)
            {
                Console.WriteLine("Search timeout reached.");
                break;
            }

            // Use A* search with heuristic prioritizing paths that visit vowels/consonants early
            if (FindPathWithAStar(startVertex, vowelVertices, consonantVertices, allPaths, pathsList))
            {
                // Found at least one path
                break;
            }
        }
    }

    private bool FindPathWithAStar(Vertex startVertex, List<Vertex> vowelVertices, List<Vertex> consonantVertices,
        HashSet<string> allPaths, List<List<Vertex>> pathsList)
    {
        // Priority queue for A* search
        var openSet = new PriorityQueue<SearchState, int>();
        var closedSet = new HashSet<string>();
        

        var initialVisited = new HashSet<Vertex> { startVertex };
        var initialPath = new List<Vertex> { startVertex };
        int initialVowelCount = IsVowel(startVertex) ? 1 : 0;
        int initialConsonantCount = IsConsonant(startVertex) ? 1 : 0;

        var initialState = new SearchState(
            initialPath,
            initialVisited,
            initialVowelCount,
            initialConsonantCount,
            0
        );

        // Calculate priority - prefer paths that visit vowels/consonants early
        int initialPriority = CalculateHeuristic(initialState, vowelVertices, consonantVertices);
        openSet.Enqueue(initialState, initialPriority);

        int stateCount = 0;

        while (openSet.Count > 0)
        {
            stateCount++;
            if (stateCount % 10000 == 0) Console.WriteLine($"Explored {stateCount} states");

            var state = openSet.Dequeue();

            // Check if we've found a Hamiltonian path
            if (state.Visited.Count == hologram.Vertices.Count)
            {
                string pathHash = GetPathHash(state.Path);
                if (!allPaths.Contains(pathHash))
                {
                    allPaths.Add(pathHash);
                    pathsList.Add(new List<Vertex>(state.Path));
                    Console.WriteLine(
                        $"Found unique Hamiltonian path with {state.VowelCount} vowels and {state.ConsonantCount} consonants");
                    return true;
                }

                continue;
            }

            // Skip if we've already explored an equivalent state
            string stateKey = GetStateKey(state);
            if (closedSet.Contains(stateKey)) continue;
            closedSet.Add(stateKey);

            // Get current vertex
            var current = state.Path[state.Path.Count - 1];

            // Explore all valid neighbors
            foreach (var neighbor in hologram.OutNeighbors[current])
            {
                // Skip visited neighbors
                if (state.Visited.Contains(neighbor)) continue;

                // Check vowel/consonant constraints
                int newVowelCount = state.VowelCount;
                int newConsonantCount = state.ConsonantCount;

                if (IsVowel(neighbor))
                {
                    newVowelCount++;
                    if (newVowelCount > maxConsecutiveVowels) continue; // Skip if too many vowels
                }
                else if (IsConsonant(neighbor))
                {
                    newConsonantCount++;
                    if (newConsonantCount > this.numberOfConsonants) continue; // Skip if too many consonants
                }

                // Create new state
                var newPath = new List<Vertex>(state.Path) { neighbor };
                var newVisited = new HashSet<Vertex>(state.Visited) { neighbor };

                var newState = new SearchState(
                    newPath,
                    newVisited,
                    newVowelCount,
                    newConsonantCount,
                    0
                );

                // Calculate priority for A* search
                int priority = CalculateHeuristic(newState, vowelVertices, consonantVertices);
                openSet.Enqueue(newState, priority);
            }
        }

        return false;
    }

    private int CalculateHeuristic(SearchState state, List<Vertex> vowelVertices, List<Vertex> consonantVertices)
    {
        // For A* search, we want to prioritize paths that:
        // 1. Visit vowel/consonant vertices early
        // 2. Have potential to reach all remaining vertices

        // How many vertices remain to be visited
        int remaining = hologram.Vertices.Count - state.Visited.Count;

        // How many vowels/consonants remain to be visited
        int vowelsToVisit = Math.Min(maxConsecutiveVowels - state.VowelCount,
            vowelVertices.Count(v => !state.Visited.Contains(v)));
        int consonantsToVisit = Math.Min(numberOfConsonants - state.ConsonantCount,
            consonantVertices.Count(v => !state.Visited.Contains(v)));

        // Prioritize paths that have visited most vertices and have visited
        // most of the required vowels/consonants
        return remaining - (vowelsToVisit + consonantsToVisit) * 10;
    }

    private string GetStateKey(SearchState state)
    {
        // Create a unique key for the state to detect duplicates
        var current = state.Path[state.Path.Count - 1];
        return
            $"{current.Row},{current.Col}|{state.VowelCount}|{state.ConsonantCount}|{string.Join(",", state.Visited.Select(v => $"{v.Row},{v.Col}"))}";
    }

    
// SearchState and helper methods same as before

    private void IterativeConstrainedSearch(HashSet<string> allPaths, List<List<Vertex>> pathsList,
        int maxRetries, Stopwatch stopwatch, int timeoutSeconds)
    {
        // Stack-based iterative implementation
        var stack = new Stack<SearchState>();
        Random random = new Random();

        for (int retry = 0; retry < maxRetries && stopwatch.Elapsed.TotalSeconds < timeoutSeconds; retry++)
        {
            // Clear stack for new attempt
            stack.Clear();

            // Choose a starting vertex
            var startVertex = hologram.Vertices[random.Next(hologram.Vertices.Count)];

            // Initialize search state
            var initialVisited = new HashSet<Vertex> { startVertex };
            var initialPath = new List<Vertex> { startVertex };
            int initialVowelCount = IsVowel(startVertex) ? 1 : 0;
            int initialConsonantCount = IsConsonant(startVertex) ? 1 : 0;

            stack.Push(new SearchState(
                initialPath,
                initialVisited,
                initialVowelCount,
                initialConsonantCount,
                0 // neighborIndex
            ));

            int stateCount = 0;

            while (stack.Count > 0)
            {
                stateCount++;

                // Check timeout periodically
                if (stateCount % 10000 == 0)
                {
                    if (stopwatch.Elapsed.TotalSeconds >= timeoutSeconds)
                    {
                        Console.WriteLine("Search timeout reached.");
                        break;
                    }
                }

                var state = stack.Pop();

                // If we've visited all vertices, check if we've found a path
                if (state.Visited.Count == hologram.Vertices.Count)
                {
                    string pathHash = GetPathHash(state.Path);
                    if (!allPaths.Contains(pathHash))
                    {
                        allPaths.Add(pathHash);
                        pathsList.Add(new List<Vertex>(state.Path));
                        Console.WriteLine(
                            $"Found unique Hamiltonian path #{allPaths.Count} with {state.VowelCount} vowels and {state.ConsonantCount} consonants");

                        // Optional: Break after finding first path to improve performance
                        // break;

                        // Optional: Break after finding a certain number of paths
                        if (allPaths.Count >= 10) break;
                    }

                    continue;
                }

                // Get current vertex
                var current = state.Path[state.Path.Count - 1];

                // Get unvisited neighbors
                var neighbors = hologram.OutNeighbors[current]
                    .Where(n => !state.Visited.Contains(n))
                    .ToList();

                // Process the next neighbor
                if (state.NeighborIndex < neighbors.Count)
                {
                    // Push current state with incremented neighbor index
                    stack.Push(new SearchState(
                        state.Path,
                        state.Visited,
                        state.VowelCount,
                        state.ConsonantCount,
                        state.NeighborIndex + 1
                    ));

                    // Get the next neighbor
                    var neighbor = neighbors[state.NeighborIndex];

                    // Check if adding this neighbor would violate constraints
                    bool isVowel = IsVowel(neighbor);
                    bool isConsonant = IsConsonant(neighbor);

                    int newVowelCount = state.VowelCount + (isVowel ? 1 : 0);
                    int newConsonantCount = state.ConsonantCount + (isConsonant ? 1 : 0);

                    // Skip if constraints would be violated
                    if ((isVowel && newVowelCount > maxConsecutiveVowels) || (isConsonant && newConsonantCount > this.numberOfConsonants))
                    {
                        continue;
                    }

                    // Create new state with this neighbor
                    var newPath = new List<Vertex>(state.Path) { neighbor };
                    var newVisited = new HashSet<Vertex>(state.Visited) { neighbor };

                    stack.Push(new SearchState(
                        newPath,
                        newVisited,
                        newVowelCount,
                        newConsonantCount,
                        0 // Reset neighbor index
                    ));
                }
            }

            // Status update
            if (retry % 100 == 0 && retry > 0)
            {
                Console.WriteLine($"Completed {retry} retries, found {allPaths.Count} paths so far.");
            }

            // Break early if we've found at least one path
            if (allPaths.Count > 0)
            {
                break;
            }
        }
    }

// Helper class to represent search state for iterative algorithm
    private class SearchState
    {
        public List<Vertex> Path { get; }
        public HashSet<Vertex> Visited { get; }
        public int VowelCount { get; }
        public int ConsonantCount { get; }
        public int NeighborIndex { get; }

        // public SearchState(List<Vertex> path, HashSet<Vertex> visited,
        //     int vowelCount, int consonantCount, int neighborIndex)
        // {
        //     Path = path;
        //     Visited = visited;
        //     VowelCount = vowelCount;
        //     ConsonantCount = consonantCount;
        //     NeighborIndex = neighborIndex;
        // }

        // Create deep copies to avoid state mutation issues
        public SearchState(List<Vertex> path, HashSet<Vertex> visited,
            int vowelCount, int consonantCount, int neighborIndex)
        {
            Path = new List<Vertex>(path);
            Visited = new HashSet<Vertex>(visited);
            VowelCount = vowelCount;
            ConsonantCount = consonantCount;
            NeighborIndex = neighborIndex;
        }
    }

// Helper methods for vowel/consonant checking
    private bool IsVowel(Vertex vertex)
    {
        int value = vertex.Value;
        return value >= 1 && value <= 27;
    }

    private bool IsConsonant(Vertex vertex)
    {
        int value = vertex.Value;
        return value >= 28 && value <= 60;
    }

    private bool IsSpecial(Vertex vertex)
    {
        int value = vertex.Value;
        return value >= 61 && value <= 64;
    }

// Helper method to get path hash
    public string GetPathHash(List<Vertex> path)
    {
        return string.Join("-", path.Select(v => $"{v.Row},{v.Col}"));
    }
}