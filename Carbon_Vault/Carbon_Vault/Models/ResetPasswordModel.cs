namespace Carbon_Vault.Models
{
    // A classe ResetPasswordModel é usada para representar os dados necessários para
    // realizar o processo de redefinição de senha de um utilizador no sistema.
    public class ResetPasswordModel
    {
        public string NewPassword { get; set; }
        public string PasswordConfirmation { get; set; }
    }
}
