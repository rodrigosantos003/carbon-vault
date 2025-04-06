using NuGet.Protocol.Plugins;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Carbon_Vault.Models
{
    /// <summary>
    /// Enumerado que define os diferentes estados de uma conta no sistema.
    /// </summary>
    public enum AccountState
    {
        /// <summary>
        /// A conta foi criada, mas ainda está pendente de ativação.
        /// </summary>
        Pending = 0,

        /// <summary>
        /// A conta está ativa e pode ser utilizada normalmente.
        /// </summary>
        Active = 1,

        /// <summary>
        /// A conta está inativa e não pode ser utilizada até ser reativada.
        /// </summary>
        Inactive = 2,
    }

    /// <summary>
    /// Enumerado que define os diferentes tipos de conta existentes no sistema.
    /// </summary>
    public enum AccountType
    {
        /// <summary>
        /// Conta padrão para utilizadores comuns.
        /// </summary>
        User = 0,

        /// <summary>
        /// Conta com permissões administrativas para gerir o sistema.
        /// </summary>
        Admin = 1,

        /// <summary>
        /// Conta de um avaliador, responsável por verificar e validar projetos.
        /// </summary>
        Evaluator = 2,

        /// <summary>
        /// Conta de suporte técnico para auxiliar os utilizadores.
        /// </summary>
        Support = 3,

    }

    /// <summary>
    /// A classe Account representa um utilizador dentro do sistema Carbon Vault.Contém informações 
    /// essenciais como nome, email, password, e dados financeiros, além de relacionamentos com 
    /// outras entidades do sistema.
    /// </summary>
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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
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