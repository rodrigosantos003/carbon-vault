using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    public enum TicketState
    {
        Open,
        Closed
    }

    public enum TicketPriority
    {
        Alta,
        Media,
        Baixa
    }

    public enum TicketCategory
    {
        Compra,
        Venda,
        Transacoes,
        Relatorios,
        Outros
    }

    public class Ticket
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TicketCategory Category { get; set; }
        public TicketPriority Priority { get; set; }
        public TicketState State { get; set; } = TicketState.Open;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? ReopenAt { get; set; } = DateTime.Now;

        [JsonIgnore]
        public Account? Author { get; set; }
        public int AuthorId { get; set; }

        public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();
        public string Reference { get; private set; } = Guid.NewGuid().ToString();
    }
}
