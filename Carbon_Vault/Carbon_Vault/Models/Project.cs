namespace Carbon_Vault.Models
{
    public enum ProjectType
    {
        Reforestation,         // Projetos de reflorestamento
        RenewableEnergy,       // Energia renovável (solar, eólica, hídrica)
        WasteManagement,       // Gerenciamento de resíduos (biogás, reciclagem)
        EnergyEfficiency,      // Eficiência energética (retrofitting de edifícios)
        Agriculture,           // Agricultura sustentável (redução de emissões)
        OceanConservation,     // Conservação dos oceanos (Agregação de carbono marinho)
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

        // Relacionamento com CarbonCredit
        public ICollection<CarbonCredit> CarbonCredits { get; set; } = new List<CarbonCredit>();
    }

}
