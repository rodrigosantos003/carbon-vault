namespace Carbon_Vault.Models
{
    using System.Text.Json.Serialization;
    public enum CreditStatus
    {
        Available,
        Sold,
        Expired
    }
    public class CarbonCredit
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        [JsonIgnore]
        public Project Project { get; set; }            
        public DateTime IssueDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string SerialNumber { get; set; }
        public string Certification { get; set; }
        public decimal Price { get; set; }
        public bool IsSold { get; set; }
        public Account? Buyer { get; set; }
        public int? BuyerId { get; set; }
        public CreditStatus Status { get; set; }
    }

}
