using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Net.Http;
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

            if (string.IsNullOrEmpty(_SMTP_CLIENT) || string.IsNullOrEmpty(_SMTP_PASSWORD) || string.IsNullOrEmpty(_SMTP_USERNAME))
            {
                throw new InvalidOperationException("SMTP is not properly set in environment variables.");
            }
        }

        public async Task SendEmail(string receiver, string subject, string message, string? attachmentURL)
        {
            var client = new SendGridClient(_SMTP_PASSWORD);
            var from = new EmailAddress(EMAIL, "Carbon Vault");
            var to = new EmailAddress(receiver);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, null , message);

            if (!string.IsNullOrEmpty(attachmentURL))
            {
                var httpClient = new HttpClient();
                try
                {
                    HttpResponseMessage response = await httpClient.GetAsync(attachmentURL);
                    response.EnsureSuccessStatusCode();

                    byte[] fileBytes = await response.Content.ReadAsByteArrayAsync();
                    string fileBase64 = Convert.ToBase64String(fileBytes);

                    msg.AddAttachment("file.pdf", fileBase64, "application/pdf");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao baixar o ficheiro: {ex.Message}");
                    return;
                }
            }

            var sendGridResponse = await client.SendEmailAsync(msg);
            Console.WriteLine($"Email enviado! Status: {sendGridResponse.StatusCode}");
        }
    }
}
