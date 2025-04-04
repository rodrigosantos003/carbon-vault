using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    // Enumerado que define os diferentes estados de um ticket no sistema.
    public enum TicketState
    {
        Open,
        Closed
    }

    // Enumerado que define as prioridades de um ticket.
    public enum TicketPriority
    {
        Alta,
        Media,
        Baixa
    }

    // Enumerado que define as categorias de um ticket.
    public enum TicketCategory
    {
        Compra,
        Venda,
        Transacoes,
        Relatorios,
        Outros
    }

    // Classe que representa um ticket de suporte ou solicitação de ajuda dentro do sistema.
    // Contém informações sobre o título, descrição, categoria, prioridade, estado e mensagens associadas.
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

        // Relacionamento com o autor do ticket (utilizador que abriu o ticket).
        [JsonIgnore]
        public Account? Author { get; set; }
        public int AuthorId { get; set; }

        public ICollection<TicketMessage> Messages { get; set; } = new List<TicketMessage>();
        public string Reference { get; set; } = Guid.NewGuid().ToString();
    }
}
