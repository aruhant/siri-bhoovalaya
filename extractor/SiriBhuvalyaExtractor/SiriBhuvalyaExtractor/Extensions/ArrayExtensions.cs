namespace SiriBhuvalyaExtractor.Extensions;

public static class ArrayExtensions
{
    public static T[,] To2DArray<T>(this T[] source)
    {
        var len = source.Length;
        
        var rowLen = (int)Math.Sqrt(len);
        if(rowLen * rowLen != len)
            throw new ArgumentException("The source array is not a square matrix.");

        
        var array = Enumerable.Range(0, rowLen)
            .Select(i => source.Skip(i * rowLen).Take(rowLen).ToArray())
            .ToArray();
        return array.To2DArray();
    }
    public static T[,] To2DArray<T>(this T[][] source)
    {
        if (source == null || source.Length == 0)
            throw new ArgumentException("The source array is null or empty.");

        // You could add more checks to ensure all rows have the same length
        int rows = source.Length;
        int cols = source[0].Length;
        T[,] result = new T[rows, cols];

        for (int i = 0; i < rows; i++)
        {
            if (source[i].Length != cols)
                throw new ArgumentException("All rows must have the same length.");

            for (int j = 0; j < cols; j++)
            {
                result[i, j] = source[i][j];
            }
        }

        return result;
    }
}