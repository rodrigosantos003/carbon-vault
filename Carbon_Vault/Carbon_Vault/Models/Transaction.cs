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

        [Required]
        public int ProjectId { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public string Date { get; set; }

        [Required]
        public TransactionState State { get; set; }

        public string CheckoutSession { get; set; }

        public string PaymentMethod { get; set; }
    }
}
