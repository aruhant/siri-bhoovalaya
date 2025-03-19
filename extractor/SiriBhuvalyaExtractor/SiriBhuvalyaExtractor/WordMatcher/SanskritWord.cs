using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SiriBhuvalyaExtractor.WordMatcher;

[Table("synset_table")]
public class SynsetWords
{
    [Key]
    [Column("synset_id")]
    public int SynsetId { get; set; }
    [Column("synset")]
    public byte[] Synset { get; set; }
    [Column("gloss")]
    public byte[] Gloss { get; set; }
    [Column("category")]
    public string Category { get; set; }
}