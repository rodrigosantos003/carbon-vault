using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    // A classe ProjectType representa o tipo de um projeto de carbono dentro do sistema.
    public class ProjectType
    {
        public int Id { get; set; }
        public ProjectTypeEnum Type { get; set; }  // Armazena o enum

        [JsonIgnore]
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
