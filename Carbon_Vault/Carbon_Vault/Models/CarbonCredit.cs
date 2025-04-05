namespace Carbon_Vault.Models
{
    using System.Text.Json.Serialization;

    /// <summary>
    /// Enumerado que define os diferentes estados de um crédito de carbono.
    /// </summary>
    public enum CreditStatus
    {
        Available, // Crédito disponível para venda.
        Sold, // Crédito já foi vendido.
        Expired // Crédito expirado e não pode mais ser utilizado.
    }

    /// <summary>
    /// A classe CarbonCredit representa um crédito de carbono dentro do sistema.
    /// Contém informações sobre sua origem, status e comprador.
    /// </summary>
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