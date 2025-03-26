using System.ComponentModel.DataAnnotations;

namespace Carbon_Vault.Models
{
    public enum AccountState
    {
        Pending = 0,
        Active = 1,
        Inactive = 2,
    }
    public enum AccountType
    {
        User = 0,
        Admin = 1,
        Evaluator = 2,
        Support = 3,

    }
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

        // Relationship with Projects
        public ICollection<Project> Projects { get; set; } = new List<Project>();

        // Relationship with Reports
        public ICollection<Report> Reports { get; set; } = new List<Report>();
    }
}
