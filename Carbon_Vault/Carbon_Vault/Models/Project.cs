namespace Carbon_Vault.Models
{
    public enum ProjectType
    {
        Poverty,        // No Poverty
        Hunger,         // Zero Hunger
        Health,         // Good health and well-being
        Education,      // Quality Education
        Gender,         // Gender Equality
        Water,          // Clean Water and sanitation
        Energy,         // Affordable and clean energy
        Work,           // Decent work and economic growth
        Industry,       // Industry, Innovation and Infrastructure
        Inequalities,   // Reduced inequalities
        Cities,         // Sustainable cities and communities
        Consumption,    // Resposible consumption and production
        ClimateAction,  // Climate action
        WaterLife,      // Life below water
        LandLife,       // Life on land
        Peace,          // Peace, justice and strong institutions
        Partnership,    // Partnership for the goals
    }
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
        public ProjectType Type { get; set; }
        public string Location { get; set; }
        public double CarbonCreditsGenerated { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Developer { get; set; }
        public string Certification { get; set; }
        public decimal PricePerCredit { get; set; }
        public ProjectStatus Status { get; set; }
        public string Benefits { get; set; }
        public Uri ProjectUrl { get; set; }
        public string ImageUrl { get; set; }

        // Relacionamento com CarbonCredit
        public ICollection<CarbonCredit> CarbonCredits { get; set; } = new List<CarbonCredit>();
    }

}
