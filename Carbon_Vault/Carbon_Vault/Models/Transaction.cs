using System.ComponentModel.DataAnnotations;

namespace Carbon_Vault.Models
{
    /// <summary>
    /// Enumerado que define os diferentes estados de uma transação no sistema.
    /// </summary>
    public enum TransactionState
    {
        Approved, //Concluido
        Rejected, //Rejeitado
        Pending   //Pendente
    }

    /// <summary>
    /// A classe Transaction representa uma transação entre um comprador e um vendedor no sistema.
    /// Contém informações sobre o comprador, vendedor, quantidade, preço total, estado da transação, e detalhes de pagamento.
    /// </summary>
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
        public double TotalPrice { get; set; }

        [Required]
        public string Date { get; set; }

        [Required]
        public TransactionState State { get; set; }

        // Identificador da sessão de checkout associada à transação (usado para processar o pagamento).
        public string CheckoutSession { get; set; }

        // Método de pagamento utilizado na transação
        public string PaymentMethod { get; set; }
    }
}