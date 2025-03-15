using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    public class ProjectFiles
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; } 
        public DateTime UploadedAt { get; set; }
        public int ProjectId { get; set; }
        [JsonIgnore]
        public Project Project { get; set; }
    }
}
