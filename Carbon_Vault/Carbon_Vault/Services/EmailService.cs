using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Carbon_Vault.Services
{
    public class EmailService : IEmailService
    {
        private const string EMAIL = "carbonvault.team@gmail.com";
        private readonly string _SMTP_CLIENT;
        private readonly string _SMTP_USERNAME;
        private readonly string _SMTP_PASSWORD;

        public EmailService(IConfiguration configuration)
        {
            _SMTP_CLIENT = Environment.GetEnvironmentVariable("SMTP_CLIENT");
            _SMTP_USERNAME = Environment.GetEnvironmentVariable("SMTP_USERNAME");
            _SMTP_PASSWORD = Environment.GetEnvironmentVariable("SMTP_PASSWORD");

            if (string.IsNullOrEmpty(_SMTP_PASSWORD))
            {
                throw new InvalidOperationException("SMTP password is not set in environment variables.");
            }
        }

        // Método original usando SMTP
        public void SendEmail(string receiver, string subject, string message)
        {
            var smtpClient = new SmtpClient(_SMTP_CLIENT)
            {
                Port = 587,
                Credentials = new NetworkCredential(_SMTP_USERNAME, _SMTP_PASSWORD),
                EnableSsl = true,
            };

            smtpClient.Send(EMAIL, receiver, subject, message);
        }

        public async Task SendEmailWithAttachment(string receiver, string subject, string message, string fileURL)
        {
            var client = new SendGridClient(_SMTP_PASSWORD);
            var from = new EmailAddress(EMAIL, "Carbon Vault");
            var to = new EmailAddress(receiver);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, message, null);

            using (var httpClient = new HttpClient())
            {
                try
                {
                    // Baixar a fatura como bytes de forma assíncrona
                    HttpResponseMessage response = await httpClient.GetAsync(fileURL);
                    response.EnsureSuccessStatusCode();

                    byte[] fileBytes = await response.Content.ReadAsByteArrayAsync();
                    string fileBase64 = Convert.ToBase64String(fileBytes);

                    // Adicionar anexo
                    msg.AddAttachment("file.pdf", fileBase64, "application/pdf");

                    // Enviar email
                    var sendGridResponse = await client.SendEmailAsync(msg);
                    Console.WriteLine($"Email enviado! Status: {sendGridResponse.StatusCode}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao baixar o ficheiro ou enviar email: {ex.Message}");
                }
            }
        }
    }
}
