using System.ComponentModel.DataAnnotations;

namespace Carbon_Vault.Models
{
    public enum TransactionState
    {
        Approved, //Concluido
        Rejected,//Rejeitado
        Pending//Pendente
    }

    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        public int BuyerId { get; set; }
        public int SellerId { get; set; }

        public int ProjectId { get; set; }

        [Required]
        public string BuyerName { get; set; }

        [Required]
        public string SellerName { get; set; }
        [Required]
        public string ProjectName { get; set; }
        [Required]
        public string ProjectDescription { get; set; }
        [Required]
        public string ProjectCertifier { get; set; }
        [Required]
        public string ProjectLocation { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public double TotalPrice { get; set; }

        [Required]
        public string Date { get; set; }

        [Required]
        public TransactionState State { get; set; }

        public string CheckoutSession { get; set; }

        public string PaymentMethod { get; set; }
    }
}
