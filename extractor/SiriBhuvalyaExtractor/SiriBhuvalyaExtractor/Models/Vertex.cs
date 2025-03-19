namespace SiriBhuvalyaExtractor.Extractor;

/// <summary>
/// Represents a vertex in a grid with row and column coordinates
/// </summary>
public class Vertex : IEquatable<Vertex>
{
    public int Value { get; set; }
    public int Row { get; }
    public int Col { get; }
    public bool IsVowel => Value >= 1 && Value <= 27;
    public bool IsConsonant => Value >= 28 && Value <= 60;
    public bool IsSpecial => Value >= 61 && Value <= 64;
    
    public Vertex(int row, int col)
    {
        Row = row;
        Col = col;
    }
    
    public override bool Equals(object obj)
    {
        return obj is Vertex vertex && Equals(vertex);
    }
    
    public bool Equals(Vertex other)
    {
        if (other is null)
            return false;
            
        return Row == other.Row && Col == other.Col;
    }
    
    public override int GetHashCode()
    {
        return HashCode.Combine(Row, Col);
    }
    
    public override string ToString()
    {
        return $"({Row},{Col})";
    }
}

/// <summary>
/// Represents a grid-based hologram with toroidal (wraparound) connectivity
/// </summary>
public class ToroidalGridHologram
{
    public int Value { get; set; }
    public static int GridSize { get; } = 9;
    /// <summary>
    /// All vertices in the grid
    /// </summary>
    public List<Vertex> Vertices { get; } = new List<Vertex>();
    
    /// <summary>
    /// Adjacency list representation of the graph
    /// </summary>
    public Dictionary<Vertex, List<Vertex>> OutNeighbors { get; } = new Dictionary<Vertex, List<Vertex>>();
    
    /// <summary>
    /// Optional initial vertex to start pathfinding from
    /// </summary>
    public Vertex InitialVertex { get; set; }
    
    /// <summary>
    /// Initializes a toroidal grid with the specified dimensions
    /// </summary>
    public void InitializeGrid(int rows, int cols, bool includeDiagonal = true)
    {
        // Clear any existing data
        Vertices.Clear();
        OutNeighbors.Clear();
        
        // Create all vertices
        for (int r = 0; r < rows; r++)
        {
            for (int c = 0; c < cols; c++)
            {
                var vertex = new Vertex(r, c);
                Vertices.Add(vertex);
                OutNeighbors[vertex] = new List<Vertex>();
            }
        }
        
        // Connect vertices
        foreach (var vertex in Vertices)
        {
            // Get all neighbors (with toroidal wraparound)
            for (int dr = -1; dr <= 1; dr++)
            {
                for (int dc = -1; dc <= 1; dc++)
                {
                    // Skip self
                    if (dr == 0 && dc == 0) continue;
                    
                    // Skip diagonals if not included
                    if (!includeDiagonal && Math.Abs(dr) == 1 && Math.Abs(dc) == 1) continue;
                    
                    // Calculate neighbor coordinates with wraparound
                    int nr = (vertex.Row + dr + rows) % rows;
                    int nc = (vertex.Col + dc + cols) % cols;
                    
                    // Find the neighbor vertex
                    var neighbor = GetVertex(nr, nc);
                    if (neighbor != null)
                    {
                        OutNeighbors[vertex].Add(neighbor);
                    }
                }
            }
        }
    }
    
    /// <summary>
    /// Gets a vertex at the specified coordinates
    /// </summary>
    public Vertex GetVertex(int row, int col)
    {
        return Vertices.Find(v => v.Row == row && v.Col == col);
    }
    
    /// <summary>
    /// Sets the initial vertex for pathfinding
    /// </summary>
    public void SetInitialVertex(int row, int col)
    {
        InitialVertex = GetVertex(row, col);
    }
}