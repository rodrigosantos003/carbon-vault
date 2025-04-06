namespace Carbon_Vault.Models
{
    /// <summary>
    /// A classe ResetPasswordModel é usada para representar os dados necessários para realizar o processo de redefinição de senha de um utilizador no sistema.
    /// </summary>
    public class ResetPasswordModel
    {
        public string NewPassword { get; set; }
        public string PasswordConfirmation { get; set; }
    }
}