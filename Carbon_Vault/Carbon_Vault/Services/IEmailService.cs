namespace Carbon_Vault.Services
{
    public interface IEmailService
    {
        void SendEmail(string receiver, string subject, string message);
    }
}
