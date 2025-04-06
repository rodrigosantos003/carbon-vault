namespace Carbon_Vault.Models
{
    /// <summary>
    /// A classe LoginModel representa os dados necessários para autenticação de um utilizador no sistema.
    /// </summary>
    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}