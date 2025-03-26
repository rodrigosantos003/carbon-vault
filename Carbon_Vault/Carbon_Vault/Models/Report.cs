using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    public enum ReportState
    {
        Pending,
        Requested,
        Created
    }

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
