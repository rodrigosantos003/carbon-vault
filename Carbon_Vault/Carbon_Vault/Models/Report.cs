using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    /// <summary>
    /// Enumerado que define os diferentes estados de um relatório dentro do sistema.
    /// </summary>
    public enum ReportState
    {
        Pending,
        Requested,
        Created
    }

    /// <summary>
    /// A classe Report representa um relatório criado por um utilizador no sistema.
    /// Contém informações sobre o estado do relatório, o utilizador que o criou, o texto associado e os arquivos relacionados.
    /// </summary>
    public class Report
    {
        [Key]
        public int Id { get; set; }

        [JsonIgnore]
        public Account? User { get; set; }

        [Required]
        public int UserID { get; set; }

        public DateTime LastUpdate { get; set; }

        public ReportState ReportState { get; set; }

        public string? Text { get; set; }

        public string? CheckoutSession { get; set; }

        // Relationship with documents
        public ICollection<ReportFiles> Files { get; set; } = new List<ReportFiles>();
    }
}