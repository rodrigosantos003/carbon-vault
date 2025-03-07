using System.ComponentModel.DataAnnotations;

namespace Carbon_Vault.Models
{
    public enum TransactionState
    {
        Approved,
        Rejected,
        Pending
    }

    public enum TransactionType
    {
        Purchase,
        Sale
    }

    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        public int UserId { get; set; }

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
