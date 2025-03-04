namespace Carbon_Vault.Services
{
    public interface IEmailService
    {
        Task SendEmail(string receiver, string subject, string message, string? attachmentURL);
    }

}
