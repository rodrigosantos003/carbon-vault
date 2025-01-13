namespace Carbon_Vault.Models
{
    using System.Security.Cryptography;

    public class AuthHelper
    {
        public static string HashPassword(string password)
        {
            using (var hmac = new HMACSHA256())
            {
                var hashedPassword = Convert.ToBase64String(hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password)));
                return hashedPassword;
            }
        }

        public static bool VerifyPassword(string password, string hashedPassword)
        {
            var hashToVerify = HashPassword(password);
            return hashToVerify == hashedPassword;
        }
    }
}
