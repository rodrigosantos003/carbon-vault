using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    // A classe ProjectFiles representa os ficheiros associados a um projeto de carbono no sistema.
    // Contém informações como nome, caminho, tipo e data de upload.
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
