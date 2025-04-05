using System.ComponentModel.DataAnnotations;

namespace Carbon_Vault.Models
{
    /// <summary>
    /// A classe UserEmissions armazena as emissões de carbono de um utilizador relacionadas ao consumo de diferentes fontes de energia.
    /// A classe mantém registros de emissões de eletricidade, diesel e gasolina.
    /// Além disso, associa essas emissões ao identificador do utilizador correspondente.
    /// </summary>
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