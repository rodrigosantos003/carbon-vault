using NuGet.Protocol.Plugins;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    // Enumerado que define os diferentes estados de uma conta no sistema.
    public enum AccountState
    {
        Pending = 0, // A conta foi criada, mas ainda está pendente de ativação.
        Active = 1, // A conta está ativa e pode ser utilizada normalmente.
        Inactive = 2, // A conta está inativa e não pode ser utilizada até ser reativada.
    }

    // Enumerado que define os diferentes tipos de conta existentes no sistema.
    public enum AccountType
    {
        User = 0, // Conta padrão para utilizadores comuns.
        Admin = 1, // Conta com permissões administrativas para gerir o sistema.
        Evaluator = 2, // Conta de um avaliador, responsável por verificar e validar projetos.
        Support = 3, // Conta de suporte técnico para auxiliar os utilizadores.

    }

    // A classe Account representa um utilizador dentro do sistema Carbon Vault.Contém informações 
    //essenciais como nome, email, password, e dados financeiros, além de relacionamentos com 
    //outras entidades do sistema.
    public class Account
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]

        public string Password { get; set; }

        [Required]
        [StringLength(9)]
        public string Nif { get; set; }
        public AccountState State { get; set; } = AccountState.Inactive;
        public AccountType Role { get; set; } = AccountType.User;
        public DateTime CreatedAt { get; set; }
        public DateTime LastLogin { get; set; }
        public string Iban { get; set; } = "";

        // Relationship with Projects
        public ICollection<Project> Projects { get; set; } = new List<Project>();

        // Relationship with Tickets
        [JsonIgnore]
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

        // Relationship with Reports
        public ICollection<Report> Reports { get; set; } = new List<Report>();
    }
}
