using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace SiriBhuvalyaExtractor.WordMatcher;

public class SanskritDbContext : DbContext
{
    
    public DbSet<SynsetWords> SanskritWords { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Replace with your MySQL connection string
        string connectionString = $"Server=localhost;Database=sanskrit;User=root;Password={Environment.GetEnvironmentVariable("SQL_ROOT_PASSWORD",EnvironmentVariableTarget.User)};Allow User Variables=True;";
        
        optionsBuilder.UseMySQL(connectionString);
    }
}