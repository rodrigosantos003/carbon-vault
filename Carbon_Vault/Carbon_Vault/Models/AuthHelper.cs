﻿namespace Carbon_Vault.Models
{
    using Microsoft.IdentityModel.Tokens;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Security.Cryptography;
    using System.Text;

    /// <summary>
    /// A classe AuthHelper fornece funcionalidades para hashing de senhas
    /// verificação de credenciais e geração/validação de tokens JWT.
    /// </summary>
    public class AuthHelper
    {
        private const int SaltSize = 16; // Tamanho do salt em bytes
        private const int KeySize = 32; // Tamanho da chave em bytes
        private const int Iterations = 10000; // Número de iterações do PBKDF2

        /// <summary>
        /// Gera um hash da senha com salt
        /// </summary>
        /// <param name="password"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Verifica a senha com base no hash armazenado
        /// </summary>
        /// <param name="password"></param>
        /// <param name="hashedPassword"></param>
        /// <returns></returns>
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

        /// <summary>
        /// Gera um token JWT
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public static string GerarToken(Account account)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(Environment.GetEnvironmentVariable("JWT_KEY"));
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, account.Id.ToString()),
                    new Claim(ClaimTypes.Role, ((int)account.Role).ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }


        /// <summary>
        /// Valida um token JWT enviado no cabeçalho Authorization.
        /// Verifica se o token é válido e se pertence ao utilizador correspondente.
        /// </summary>
        /// <param name="Authorization"></param>
        /// <param name="userID"></param>
        /// <returns></returns>
        public static bool IsTokenValid(string Authorization, int userID)
        {
            if (string.IsNullOrEmpty(Authorization) || !Authorization.StartsWith("Bearer "))
                return false;

            var token = Authorization.Substring("Bearer ".Length).Trim();

            var claimsPrincipal = ValidateToken(token);

            if (claimsPrincipal == null) return false;

            var claimerID = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return claimerID == userID.ToString();
        }

        /// <summary>
        /// Valida a assinatura do token e retorna os claims do utilizador autenticado.
        /// </summary>
        /// <param name="token"></param>
        /// <returns>Retorna null se o token for inválido.</returns>
        /// <exception cref="Exception"></exception>
        private static ClaimsPrincipal ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(Environment.GetEnvironmentVariable("JWT_KEY"));

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                };

                return tokenHandler.ValidateToken(token, validationParameters, out _);
            }
            catch (SecurityTokenException)
            {
                return null;
            }
            catch (Exception ex)
            {
                throw new Exception("Error validating token: ", ex);
            }
        }
    }
}