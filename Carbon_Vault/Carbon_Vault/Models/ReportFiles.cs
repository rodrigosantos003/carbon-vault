using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    // A classe ReportFiles representa um ficheiro associado a um relatório dentro do sistema.
    // Contém informações como nome, caminho, tipo e data de upload.
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
