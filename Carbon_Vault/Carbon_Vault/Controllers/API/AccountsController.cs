using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Data;
using Carbon_Vault.Models;
using System.Text;
using System.Security.Cryptography;
using Carbon_Vault.Services;
using Microsoft.IdentityModel.Tokens;

namespace Carbon_Vault.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;
        private readonly string _secretKey;
        private readonly IEmailService _emailService;

        public AccountsController(Carbon_VaultContext context, IConfiguration configuration , IEmailService emailService)
        {
            _context = context;
            _secretKey = configuration["AppSettings:TokenSecretKey"];
            _emailService = emailService;

        }

        // GET: api/Accounts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Account>>> GetAccount()
        {
            return await _context.Account.ToListAsync();
        }

        // GET: api/Accounts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Account>> GetAccount(int id)
        {
            var account = await _context.Account.FindAsync(id);

            if (account == null)
            {
                return NotFound();
            }

            return account;
        }

        // PUT: api/Accounts/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccount(int id, Account account)
        {
            if (id != account.Id)
            {
                return BadRequest();
            }

            _context.Entry(account).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AccountExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Accounts
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Account>> PostAccount(Account account)
        {
            account.State = AccountState.Pending;
            account.Password = AuthHelper.HashPassword(account.Password);

            _context.Account.Add(account);
            await _context.SaveChangesAsync();

            // Generate secure token
            var token = GenerateConfirmationToken(account.Id);
            var confirmationLink = $"{Request.Scheme}://{Request.Host}/api/Accounts/Confirm?token={token}";

            // Send confirmation link via email
            _emailService.SendEmail(account.Email, "Carbon Vault - Confirm your account", $"Please confirm your account by clicking the following link: {confirmationLink}");

            return CreatedAtAction("GetAccount", new { id = account.Id }, account);
        }

        // DELETE: api/Accounts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            var account = await _context.Account.FindAsync(id);
            if (account == null)
            {
                return NotFound();
            }

            _context.Account.Remove(account);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Accounts/Login
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginModel accountInput)
        {
            if (accountInput == null || string.IsNullOrEmpty(accountInput.Email) || string.IsNullOrEmpty(accountInput.Password))
            {
                return BadRequest(new { message = "Email and password are required." });
            }

            var account = await _context.Account
                .FirstOrDefaultAsync(a => a.Email == accountInput.Email);

            if (account == null || !AuthHelper.VerifyPassword(accountInput.Password, account.Password))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            return Ok(new
            {
                message = "Login successful.",
                userId = account.Id
            });
        }

        // PUT: api/Account/:id/ForgotPassword
        [HttpPut("{id}/ForgotPassword")]
        public async Task<IActionResult> ForgotPassword(int id)
        {
            var account = await _context.Account.FindAsync(id);

            if (account == null)
                return NotFound(new { message = "Account not found." });

            account.State = AccountState.Pending;
            _context.Entry(account).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            // Generate secure token
            var token = GenerateConfirmationToken(account.Id);
            var confirmationLink = $"{Request.Scheme}://{Request.Host}/api/Accounts/ResetPassword?token={token}";

            // Send confirmation link via email
            _emailService.SendEmail(account.Email, "Carbon Vault - Password recovery", $"Please recover your account by clicking the following link: {confirmationLink}");

            return Ok(new { message = "Password recovery link sent successfully" });
        }

        private string GenerateConfirmationToken(int userId)
        {
            var secretKey = _secretKey; 
            var payload = $"{userId}:{DateTime.UtcNow}";

            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
                var token = $"{Convert.ToBase64String(hash)}:{Convert.ToBase64String(Encoding.UTF8.GetBytes(payload))}";
                return token;
            }
        }
        private int? ValidateConfirmationToken(string token)
        {
            var secretKey = _secretKey;
            var parts = token.Split(':');

            if (parts.Length != 2)
            {
                Console.WriteLine("Token format is invalid.");
                return null;
            }

            var hashPart = parts[0];
            var payloadPart = parts[1];

            try
            {
                var payloadBytes = Convert.FromBase64String(payloadPart);
                var payload = Encoding.UTF8.GetString(payloadBytes);

                Console.WriteLine($"Decoded payload: {payload}");

                using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey)))
                {
                    var computedHash = hmac.ComputeHash(payloadBytes);
                    var computedHashString = Convert.ToBase64String(computedHash);

                    Console.WriteLine($"Expected hash: {computedHashString}");
                    Console.WriteLine($"Provided hash: {hashPart}");

                    if (computedHashString != hashPart)
                    {
                        Console.WriteLine("Hash validation failed.");
                        return null;
                    }
                }

                var payloadParts = payload.Split(':', 2);
                if (payloadParts.Length != 2)
                {
                    Console.WriteLine("Payload format is invalid.");
                    return null;
                }

                if (int.TryParse(payloadParts[0], out var userId))
                {
                    return userId;
                }
                else
                {
                    Console.WriteLine("User ID parsing failed.");
                    return null;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error validating token: {ex.Message}");
                return null;
            }
        }


        [HttpGet("Confirm")]
        public async Task<IActionResult> ConfirmAccount([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest(new { message = "Token is required." });
            }

            var userId = ValidateConfirmationToken(token);
            if (userId == null)
            {
                return BadRequest(new { message = "Invalid confirmation token." });
            }

            var account = await _context.Account.FindAsync(userId);

            if (account == null)
            {
                return NotFound(new { message = "Account not found." });
            }

            account.State = AccountState.Active;
            _context.Entry(account).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account confirmed successfully." });
        }

        // POST: api/Accounts/ResetPassword
        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetAccountPassword([FromQuery] string token, [FromBody] ResetPasswordModel model)
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest(new { message = "Token is required." });
            }

            var userId = ValidateConfirmationToken(token);
            if (userId == null)
            {
                return BadRequest(new { message = "Invalid confirmation token." });
            }

            var account = await _context.Account.FindAsync(userId);

            if (account == null)
            {
                return NotFound(new { message = "Account not found." });
            }

            if (string.IsNullOrEmpty(model.NewPassword) || string.IsNullOrEmpty(model.PasswordConfirmation))
            {
                return BadRequest(new { message = "Password and password confirmation are required." });
            }

            account.Password = AuthHelper.HashPassword(model.NewPassword);
            account.State = AccountState.Active;
            _context.Entry(account).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully." });
        }

        private bool AccountExists(int id)
        {
            return _context.Account.Any(e => e.Id == id);
        }
    }
}
