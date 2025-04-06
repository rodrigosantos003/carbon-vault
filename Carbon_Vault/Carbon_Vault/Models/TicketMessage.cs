using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    /// <summary>
    /// A classe TicketMessage representa uma mensagem associada a um ticket no sistema.
    /// Contém informações sobre o conteúdo da mensagem, o autor, e a data de envio.
    /// </summary>
    public class TicketMessage
    {
        public int Id { get; set; }
        public int TicketId { get; set; }

        // Relacionamento com o ticket associado à mensagem.
        [JsonIgnore]
        public Ticket? Ticket { get; set; }

        public string Content { get; set; }

        // Relacionamento com o autor da mensagem (utilizador que enviou a mensagem).
        public Account? Autor { get; set; }
        public int AutorId { get; set; }
        public DateTime SendDate { get; set; } = DateTime.Now;
    }
}