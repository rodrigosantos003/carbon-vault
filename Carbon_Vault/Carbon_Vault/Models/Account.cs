using System.ComponentModel.DataAnnotations;

namespace Carbon_Vault.Models
{
    public enum AccountState
    {
        Pending = 0,
        Active = 1,
        Inactive = 2,
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
        public string Password { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public AccountState State { get; set; } = AccountState.Inactive;


    }
}
