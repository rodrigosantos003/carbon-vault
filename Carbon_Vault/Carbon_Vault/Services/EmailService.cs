using System.Net.Mail;
using System.Net;

namespace Carbon_Vault.Services
{
    public class EmailService : IEmailService
    {
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
                throw new InvalidOperationException("SMTP password is not set in appsettings.json.");
            }
        }

        public void SendEmail(string receiver, string subject, string message)
        {
            var smtpClient = new SmtpClient(_SMTP_CLIENT)
            {
                Port = 587,
                Credentials = new NetworkCredential(_SMTP_USERNAME, _SMTP_PASSWORD),
                EnableSsl = true,
            };

            smtpClient.Send("carbonvault.team@gmail.com", receiver, subject, message);
        }
    }
}