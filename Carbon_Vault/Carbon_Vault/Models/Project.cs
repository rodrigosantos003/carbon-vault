using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    public enum ProjectStatus
    {
        Confirmed,
        OnReview,
        Denied
    }
    

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
        public ProjectStatus Status { get; set; }
        public Uri? ProjectUrl { get; set; }
        public string? ImageUrl { get; set; }

        // Relationship with CarbonCredit
        public ICollection<CarbonCredit> CarbonCredits { get; set; } = new List<CarbonCredit>();
        public DateTime CreatedAt { get; set; }

        // Relationship with User
        [JsonIgnore]
        public Account? Owner { get; set; }
        public int OwnerId { get; set; }

        // Relationship with documents
        public ICollection<ProjectFiles> Files { get; set; } = new List<ProjectFiles>();

    }
}
