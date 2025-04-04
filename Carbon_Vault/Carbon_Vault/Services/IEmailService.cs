namespace Carbon_Vault.Services
{
    // A interface IEmailService define o contrato para os serviços de envio de email.
    // Qualquer classe que implemente esta interface deve fornecer uma implementação para o envio de emails.
    public interface IEmailService
    {
        // Método assíncrono para enviar um email.
        Task SendEmail(string receiver, string subject, string message, string? attachmentURL);
    }
}
