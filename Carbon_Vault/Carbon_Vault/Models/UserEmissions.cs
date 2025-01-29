using System.ComponentModel.DataAnnotations;

namespace Carbon_Vault.Models
{
    public class UserEmissions
    {
        [Key]
        public int Id { get; set; }

        public double electricity { get; set; } = 0.0;

        public double diesel { get; set; } = 0.0;

        public double petrol { get; set; } = 0.0;

        public int UserId { get; set; }
    }
}