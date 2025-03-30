using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    public class TicketMessage
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        [JsonIgnore] 
        public Ticket? Ticket { get; set; }
        public string Content { get; set; }

        
        public Account? Autor { get; set; }
        public int AutorId { get; set; }
        public DateTime SendDate { get; set; } = DateTime.Now;
    }
}
