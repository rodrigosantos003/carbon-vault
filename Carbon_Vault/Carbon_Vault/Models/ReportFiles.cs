using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    public class ReportFiles
    {
        [Key]
        public int Id { get; set; }

        public string FileName { get; set; }

        public string FilePath { get; set; }

        public string FileType { get; set; }

        public DateTime UploadedAt { get; set; }

        public int ReportId { get; set; }

        [JsonIgnore]
        public Report Report { get; set; }
    }
}
