namespace Carbon_Vault.Services
{
    /// <summary>
    /// A interface IEmailService define o contrato para os serviços de envio de email.
    /// Qualquer classe que implemente esta interface deve fornecer uma implementação para o envio de emails.
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Método assíncrono para enviar um email.
        /// </summary>
        /// <param name="receiver"></param>
        /// <param name="subject"></param>
        /// <param name="message"></param>
        /// <param name="attachmentURL"></param>
        /// <returns></returns>
        Task SendEmail(string receiver, string subject, string message, string? attachmentURL);
    }
}