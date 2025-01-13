using System.Net.Mail;
using System.Net;

namespace Carbon_Vault.Services
{
    public class EmailService : IEmailService
    {
        private const string _SMTP_CLIENT = "smtp.mailersend.net";
        private const string _SMTP_USERNAME = "MS_033jrn@trial-pq3enl6o59rl2vwr.mlsender.net";
        private const string _SMTP_PASSWORD = "eqZ5IugRxM7j92aE";

        public void SendEmail(string receiver, string subject, string message)
        {
            var smtpClient = new SmtpClient(_SMTP_CLIENT)
            {
                Port = 587,
                Credentials = new NetworkCredential(_SMTP_USERNAME, _SMTP_PASSWORD),
                EnableSsl = true,
            };

            smtpClient.Send("MS_033jrn@trial-pq3enl6o59rl2vwr.mlsender.net", receiver, subject, message);
        }
    }
}