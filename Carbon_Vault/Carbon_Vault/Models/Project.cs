using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    /// <summary>
    /// Enumerado que define os diferentes estados de um projeto no sistema.
    /// </summary>
    public enum ProjectStatus
    {
        Confirmed,
        OnReview,
        Denied
    }

    /// <summary>
    /// A classe Project representa um projeto de carbono dentro do sistema.
    /// Contém informações sobre o projeto, como nome, descrição, localização, entre outros.
    /// </summary>
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public ICollection<ProjectType> Types { get; set; } = new List<ProjectType>();

        public string Location { get; set; }
        public double CarbonCreditsGenerated { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Developer { get; set; }
        public string Certification { get; set; }
        public decimal? PricePerCredit { get; set; }
        public int CreditsForSale { get; set; }
        public ProjectStatus Status { get; set; }
        public Uri? ProjectUrl { get; set; }
        public string? ImageUrl { get; set; }

        public string benefits { get; set; }

        // Relationship with CarbonCredit
        public ICollection<CarbonCredit> CarbonCredits { get; set; } = new List<CarbonCredit>();
        public DateTime CreatedAt { get; set; }

        // Relationship with User
        [JsonIgnore]
        public Account? Owner { get; set; }
        public int OwnerId { get; set; }

        // Relationship with documents
        public ICollection<ProjectFiles> Files { get; set; } = new List<ProjectFiles>();

        public bool IsForSale { get; set; } = false;
    }
}