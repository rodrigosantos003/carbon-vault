namespace Carbon_Vault.Models
{
    using System.Security.Cryptography;

    public class AuthHelper
    {
        private const int SaltSize = 16; // Tamanho do salt em bytes
        private const int KeySize = 32; // Tamanho da chave em bytes
        private const int Iterations = 10000; // Número de iterações do PBKDF2

        // Gera um hash da senha com salt
        public static string HashPassword(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(SaltSize);

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
            var hash = pbkdf2.GetBytes(KeySize);

            var hashBytes = new byte[SaltSize + KeySize];
            Array.Copy(salt, 0, hashBytes, 0, SaltSize);
            Array.Copy(hash, 0, hashBytes, SaltSize, KeySize);

            return Convert.ToBase64String(hashBytes);
        }

        // Verifica a senha com base no hash armazenado
        public static bool VerifyPassword(string password, string hashedPassword)
        {
            var hashBytes = Convert.FromBase64String(hashedPassword);

            var salt = new byte[SaltSize];
            Array.Copy(hashBytes, 0, salt, 0, SaltSize);

            var originalHash = new byte[KeySize];
            Array.Copy(hashBytes, SaltSize, originalHash, 0, KeySize);

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
            var computedHash = pbkdf2.GetBytes(KeySize);

            return CryptographicOperations.FixedTimeEquals(originalHash, computedHash);
        }
    }

}
