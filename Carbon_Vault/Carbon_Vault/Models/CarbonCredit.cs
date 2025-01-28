namespace Carbon_Vault.Models
{
    public class CarbonCredit
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }                
        public Project Project { get; set; }            
        public double Quantity { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string SerialNumber { get; set; }
        public string Certification { get; set; }
        public decimal Price { get; set; }
        public bool IsSold { get; set; }
        public string Buyer { get; set; }
        public string Status { get; set; }
    }

}
