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
using System.Globalization;
using Stripe;
using Microsoft.Identity.Client;
using Stripe.FinancialConnections;
using System.Diagnostics.Tracing;

namespace Carbon_Vault.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;
        private readonly string _secretKey;
        private readonly IEmailService _emailService;
        private readonly string _frontendBaseUrl;

        public AccountsController(Carbon_VaultContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _secretKey = configuration["AppSettings:TokenSecretKey"];
            _emailService = emailService;
            _frontendBaseUrl = Environment.GetEnvironmentVariable("CLIENT_URL");
        }

        private bool AccountExists(string email)
        {
            return _context.Account.Any(a => a.Email == email);
        }

        private bool AccountExists(int id)
        {
            return _context.Account.Any(a => a.Id == id);
        }

        // GET: api/Accounts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Models.Account>>> GetAccounts([FromHeader] string Authorization, int userID)
        {
            if (!AuthHelper.IsTokenValid(Authorization, userID))
            {
                return Unauthorized(new { message = "JWT inválido." });
            }

            return await _context.Account.ToListAsync();
        }

        // GET: api/Accounts/users
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<Models.Account>>> GetUserAccounts()
        {
            var accounts = await _context.Account
                                 .Select(a => new
                                 {
                                     a.Id,
                                     a.Name,
                                     a.Email,
                                     Role = a.Role.ToString(), // Converte o enum para string
                                     CreatedAt = a.CreatedAt.ToString(),
                                 })
                                 .ToListAsync();

            if (!accounts.Any())
            {
                return NotFound(new { message = "Nenhuma conta de utilizador encontrada." });
            }

            return Ok(accounts);
        }

        // GET: api/Accounts/admins
        [HttpGet("admins")]
        public async Task<ActionResult<IEnumerable<Models.Account>>> GetAdminAccounts()
        {
            var accounts = await _context.Account
                                         .Where(a => a.Role == Models.AccountType.Admin)
                                         .ToListAsync();

            if (!accounts.Any())
            {
                return NotFound(new { message = "Nenhuma conta de administrador encontrada." });
            }

            return accounts;
        }


        // GET: api/Accounts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Models.Account>> GetAccount(int id)
        {
            var account = await _context.Account.FindAsync(id);

            if (account == null)
            {
                return NotFound(new { message = "Conta não encontrada." });
            }

            return account;
        }

        // PUT: api/Accounts/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAccount(int id, Models.Account account, [FromHeader] string Authorization)
        {
            if (!AuthHelper.IsTokenValid(Authorization, id))
            {
                return Unauthorized(new { message = "JWT inválido." });
            }

            if (id != account.Id)
            {
                return BadRequest(new { message = "Pedido inválido." });
            }

            account.State = AccountState.Active;

            _context.Entry(account).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AccountExists(id))
                {
                    return NotFound(new { message = "Conta não encontrada." });
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Conta atualizada com sucesso." });
        }

        // POST: api/Accounts
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Models.Account>> PostAccount(Models.Account account)
        {
            if (AccountExists(account.Email))
                return BadRequest(new { message = "Já existe uma conta com o e-mail fornecido." });

            account.State = AccountState.Pending;
            account.Password = AuthHelper.HashPassword(account.Password);

            _context.Account.Add(account);
            await _context.SaveChangesAsync();

            // Generate secure token
            var token = GenerateConfirmationToken(account.Id);
            var confirmationLinkBack = $"{Request.Scheme}://{Request.Host}/api/Accounts/Confirm?token={token}";
            var confirmationLink = $"{_frontendBaseUrl}confirm-account?token={token}";


            // Send confirmation link via email
            await _emailService.SendEmail(account.Email,
                "Carbon Vault - Confirmar conta",
                $"Por favor confirme a sua conta clicando neste link: {confirmationLink}",
                null);

            return CreatedAtAction("GetAccount", new { id = account.Id }, account);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(int id, [FromHeader] string Authorization, int userID)
        {
            if (!AuthHelper.IsTokenValid(Authorization, userID))
            {
                return Unauthorized(new { message = "JWT inválido." });
            }

            var account = await _context.Account.FindAsync(id);
            if (account == null)
            {
                return NotFound();
            }

            _context.Account.Remove(account);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Conta eliminada com sucesso." });
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

            if (account.State != AccountState.Active)
            {
                return Unauthorized(new { message = "Account is not active." });
            }

            account.LastLogin = DateTime.UtcNow;
            _context.Account.Update(account);
            await _context.SaveChangesAsync();

            var token = AuthHelper.GerarToken(account.Id);

            return Ok(new
            {
                message = "Login successful.",
                token
            });
        }

        // GET: api/Account/NewPassword?email=:
        [HttpGet("NewPassword")]
        public async Task<IActionResult> NewPassword([FromQuery] string email)
        {
            var account = await _context.Account.FirstOrDefaultAsync(a => a.Email == email);

            if (account == null)
                return NotFound(new { message = "Account not found." });

            account.State = AccountState.Pending;
            _context.Entry(account).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            // Generate secure token
            var token = GenerateConfirmationToken(account.Id);
            var confirmationLink = $"{_frontendBaseUrl}recover-password?token={token}";

            // Send confirmation link via email
            await _emailService.SendEmail(account.Email,
                "Carbon Vault - Nova Palavra-Passe",
                $"Por favor recupere a sua palavra-passe clicando neste link: {confirmationLink}",
                null);

            return Ok(new
            {
                message = "Link de recuperação enviado com sucesso"
            });
        }

        public static string Base64UrlEncode(byte[] input)
        {
            return Convert.ToBase64String(input)
                .TrimEnd('=') // Remove padding
                .Replace('+', '-') // URL-safe
                .Replace('/', '_');
        }

        public static byte[] Base64UrlDecode(string input)
        {
            string fixedInput = input.Replace('-', '+').Replace('_', '/');

            // Re-adiciona o padding se necessário
            switch (fixedInput.Length % 4)
            {
                case 2: fixedInput += "=="; break;
                case 3: fixedInput += "="; break;
            }

            return Convert.FromBase64String(fixedInput);
        }


        public string GenerateConfirmationToken(int userId)
        {
            var secretKey = _secretKey;
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss"); // Formato fixo para evitar problemas de parsing
            var payload = $"{userId}:{timestamp}";

            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));

                string base64Hash = Base64UrlEncode(hash);
                string base64Payload = Base64UrlEncode(Encoding.UTF8.GetBytes(payload));

                return $"{base64Hash}.{base64Payload}"; // Usa "." em vez de ":" para evitar conflitos na decodificação
            }
        }

        private int? ValidateConfirmationToken(string token)
        {
            var secretKey = _secretKey;
            var parts = token.Split('.'); // Alterado de ':' para '.'

            if (parts.Length != 2)
            {
                Console.WriteLine("Token format is invalid.");
                return null;
            }

            var hashPart = parts[0];
            var payloadPart = parts[1];

            try
            {
                // Decodifica o payload corretamente
                var payloadBytes = Base64UrlDecode(payloadPart);
                var payload = Encoding.UTF8.GetString(payloadBytes);

                // Verifica o hash
                using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey)))
                {
                    var computedHash = hmac.ComputeHash(payloadBytes);
                    var computedHashString = Base64UrlEncode(computedHash);

                    if (computedHashString != hashPart)
                    {
                        Console.WriteLine("Hash validation failed.");
                        return null;
                    }
                }

                // Processa o payload (ID do utilizador e timestamp)
                var payloadParts = payload.Split(':', 2);
                if (payloadParts.Length != 2)
                {
                    Console.WriteLine("Payload format is invalid.");
                    return null;
                }

                if (!int.TryParse(payloadParts[0], out var userId))
                {
                    Console.WriteLine("User ID parsing failed.");
                    return null;
                }

                // Opcional: validar o timestamp para evitar tokens expirados
                if (!DateTime.TryParseExact(payloadParts[1], "yyyyMMddHHmmss",
                                            CultureInfo.InvariantCulture,
                                            DateTimeStyles.None,
                                            out var tokenTimestamp))
                {
                    Console.WriteLine("Timestamp parsing failed.");
                    return null;
                }

                var tokenAge = DateTime.UtcNow - tokenTimestamp;
                if (tokenAge > TimeSpan.FromHours(24)) // Exemplo: expira após 24h
                {
                    Console.WriteLine("Token has expired.");
                    return null;
                }

                return userId;
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

        // POST: api/Accounts/SetPassword
        [HttpPost("SetPassword")]
        public async Task<IActionResult> SetPassword([FromQuery] string token, [FromBody] ResetPasswordModel model)
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

        [HttpGet("ValidateNIF")]
        public async Task<IActionResult> ValidateNIF([FromQuery] string nif)
        {
            if (string.IsNullOrEmpty(nif))
            {
                return BadRequest(new { message = "NIF is required." });
            }


            var apiKey = Environment.GetEnvironmentVariable("NIF_KEY");
            var apiUrl = $"https://www.nif.pt/?json=1&q={nif}&key={apiKey}";

            using (var httpClient = new HttpClient())
            {
                try
                {

                    var response = await httpClient.GetAsync(apiUrl);

                    if (!response.IsSuccessStatusCode)
                    {
                        return StatusCode((int)response.StatusCode, new { message = "Error communicating with the NIF API." });
                    }


                    var responseContent = await response.Content.ReadAsStringAsync();
                    return Ok(responseContent);
                }
                catch (Exception ex)
                {

                    return StatusCode(500, new { message = "An error occurred while validating the NIF.", error = ex.Message });
                }
            }
        }

        [HttpGet("UserStatistics")]
        public async Task<IActionResult> GetUserStatistics(DateTime startDate, DateTime endDate)
        {
            if (startDate >= endDate)
            {
                return BadRequest(new { message = "Invalid date range: startDate must be earlier than endDate." });
            }


            int totalUsers = await _context.Account.CountAsync();


            int usersInPeriod = await _context.Account
                .Where(a => a.CreatedAt >= startDate && a.CreatedAt <= endDate)
                .CountAsync();


            double growthPercentage = usersInPeriod > 0
                ? ((double)(totalUsers - usersInPeriod) / usersInPeriod) * 100
                : 100;

            return Ok(new
            {
                TotalUsers = totalUsers,
                UsersInPeriod = usersInPeriod,
                GrowthPercentage = growthPercentage
            });
        }

        [HttpGet("UserActivePeriod")]
        public async Task<IActionResult> GetUserActivePeriode(DateTime startDate, DateTime endDate)
        {
            if (startDate >= endDate)
            {
                return BadRequest(new { message = "Invalid date range: startDate must be earlier than endDate." });
            }

            var usersLoggedInPeriod = await _context.Account
                .Where(a => a.LastLogin >= startDate && a.LastLogin <= endDate)
                .ToListAsync();

            int morningUsers = usersLoggedInPeriod.Count(a => a.LastLogin.TimeOfDay >= TimeSpan.FromHours(5) && a.LastLogin.TimeOfDay < TimeSpan.FromHours(12));
            int afternoonUsers = usersLoggedInPeriod.Count(a => a.LastLogin.TimeOfDay >= TimeSpan.FromHours(12) && a.LastLogin.TimeOfDay < TimeSpan.FromHours(18));
            int nightUsers = usersLoggedInPeriod.Count(a => a.LastLogin.TimeOfDay >= TimeSpan.FromHours(18) || a.LastLogin.TimeOfDay < TimeSpan.FromHours(5));



            return Ok(new
            {
                MorningUsers = morningUsers,
                AfternoonUsers = afternoonUsers,
                NightUsers = nightUsers
            });
        }

        public async Task<ActionResult<IEnumerable<Models.Account>>> GetAccountsTest()
        {
            return await _context.Account.ToListAsync();
        }



        /*** STRIPE CONNECT ACCOUNT ***/
        [HttpPatch("stripe/{accountId}")]
        public async Task<IActionResult> UpdateStripeAccountId(int accountId)
        {
            var account = await _context.Account.FindAsync(accountId);

            if (account == null)
            {
                return NotFound();
            }



            return NoContent(); // 204 No Content on success
        }

        private async Task CreateStripeAccount(Models.Account acc)
        {
            var options = new AccountCreateOptions
            {
                Country = "PT",
                Email = acc.Email,
                Controller = new AccountControllerOptions
                {
                    Fees = new AccountControllerFeesOptions { Payer = "application" },
                    Losses = new AccountControllerLossesOptions { Payments = "application" },
                    StripeDashboard = new AccountControllerStripeDashboardOptions
                    {
                        Type = "express",
                    },
                },
                Capabilities = new AccountCapabilitiesOptions
                {
                    CardPayments = new AccountCapabilitiesCardPaymentsOptions { Requested = true },
                    Transfers = new AccountCapabilitiesTransfersOptions { Requested = true }
                },
                ExternalAccount = new AccountBankAccountOptions
                {
                    Country = "PT",
                    Currency = "eur",
                    AccountNumber = "PT50000201231234567890154",
                }
            };

            var accountService = new Stripe.AccountService();
            Stripe.Account connectedAccount = accountService.Create(options);

            acc.StripeAccountId = connectedAccount.Id;

            await _context.SaveChangesAsync();
        }

        [HttpPost("transfer")]
        public Task<IActionResult> MakeTransfer()
        {
            // The connected account's Stripe account ID (replace with the actual account ID)
            string connectedAccountId = "acct_1R57s5Q8h21W01mg";

            // Create the transfer
            var transferOptions = new TransferCreateOptions
            {
                Amount = 1000, // Amount in cents (e.g., $10.00)
                Currency = "eur", // Currency of the transfer
                Destination = connectedAccountId, // The connected account ID
            };

            var transferService = new TransferService();
            try
            {
                Console.WriteLine("Entrou!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                // Create the transfer to the connected account
                Transfer transfer = transferService.Create(transferOptions);
                Console.WriteLine($"Transfer created successfully! Transfer ID: {transfer.Id}");
            }
            catch (StripeException e)
            {
                // Handle Stripe errors
                Console.WriteLine($"Stripe error: {e.Message}");
            }

            return Task.FromResult<IActionResult>(Ok());
        }

        [HttpGet("stripeAccV1/{id}")]
        public async Task<IActionResult> GetUserStripeAccount(int id)
        {
            var account = await _context.Account.FindAsync(id);

            if (account == null)
            {
                return NotFound();
            }

            if (account.StripeAccountId == "Undefined")
            {
                await CreateStripeAccount(account);
            }
            //else
            //{
            //    var accountServiceAux = new Stripe.AccountService();
            //    var stripeAccountAux = accountServiceAux.Get(account.StripeAccountId);
            //    accountServiceAux.Delete(stripeAccountAux.Id);

            //    await CreateStripeAccount(account);
            //}

            var accountUpdateOptions = new AccountUpdateOptions
            {
                BusinessType = "individual", // Change to "company" if it's a business

                Individual = new AccountIndividualOptions
                {
                    FirstName = "Jane",
                    LastName = "Doe",
                    Email = "jane.doe@example.com",
                    Address = new AddressOptions
                    {
                        Line1 = "123 Residential St",
                        City = "Home City",
                        Country = "PT",
                        PostalCode = "2839-001"
                    },
                    Dob = new DobOptions
                    {
                        Day = 1,
                        Month = 1,
                        Year = 1980
                    }
                },

                BusinessProfile = new AccountBusinessProfileOptions
                {
                    Mcc = "5734",
                    Url = "https://www.yourbusiness.com"
                },

                TosAcceptance = new AccountTosAcceptanceOptions
                {
                    Date = DateTime.UtcNow,
                    Ip = "192.168.1.1"
                }
            };

            var accountService = new Stripe.AccountService();
            var stripeAccount = accountService.Get(account.StripeAccountId);

            var updatedAccount = accountService.Update(stripeAccount.Id, accountUpdateOptions);

            //accountService.Delete(stripeAccount.Id);
            //MakePayout(stripeAccount.Id);

            return Ok();
        }

        [HttpGet("stripeAcc/{id}")]
        public async Task<IActionResult> UserStripeAccount(int id)
        {
            var account = await _context.Account.FindAsync(id);

            if (account == null)
            {
                return NotFound();
            }

            var accountService = new Stripe.AccountService();

            // If the user doesn't have a Stripe account, create one
            if (string.IsNullOrEmpty(account.StripeAccountId) || account.StripeAccountId == "Undefined")
            {
                var accountCreateOptions = new AccountCreateOptions
                {
                    Type = "express", // Use "custom" if using Custom Connect accounts
                    Country = "PT", // User's country
                    Email = "jane.doe@example.com", // Change dynamically based on user
                    Capabilities = new AccountCapabilitiesOptions
                    {
                        CardPayments = new AccountCapabilitiesCardPaymentsOptions { Requested = true },
                        Transfers = new AccountCapabilitiesTransfersOptions { Requested = true }
                    }
                };

                var stripeAccount = accountService.Create(accountCreateOptions);
                account.StripeAccountId = stripeAccount.Id;
                await _context.SaveChangesAsync();
            }

            // Generate Stripe onboarding link
            var accountLinkService = new AccountLinkService();
            var accountLinkOptions = new AccountLinkCreateOptions
            {
                Account = account.StripeAccountId, // The user's Stripe account ID
                RefreshUrl = "https://google.com", // If the user session expires
                ReturnUrl = "https://google.pt", // Where to send user after onboarding
                Type = "account_onboarding"
            };

            var accountLink = accountLinkService.Create(accountLinkOptions);

            // Return onboarding link so frontend can redirect the user
            return Ok(new { onboardingUrl = accountLink.Url });
        }


        public void MakePayout(string accountId)
        {
            var payoutService = new PayoutService();
            var payoutOptions = new PayoutCreateOptions
            {
                Amount = 5000, // Amount in cents (e.g., €50.00)
                Currency = "EUR",
            };

            var payout = payoutService.Create(payoutOptions, new RequestOptions
            {
                StripeAccount = accountId, // Specify the connected account ID
            });
        }

        [HttpGet("stripeTransaction/{id}")]
        public async Task<IActionResult> GetUserStripeTransaction(int id)
        {
            var result = await GetUserStripeAccount(id);

            if (result is NotFoundResult)
            {
                return NotFound();
            }

            if (result is OkObjectResult okResult)
            {
                var stripeAccount = okResult.Value as Stripe.Account;

                if (stripeAccount != null)
                {
                    var transferService = new TransferService();
                    var transferOptions = new TransferCreateOptions
                    {
                        Amount = 5000,
                        Currency = "eur",
                        Destination = stripeAccount.Id,
                    };

                    var transfer = transferService.Create(transferOptions);

                    return Ok(new { Message = "Stripe account retrieved successfully", transfer });
                }
            }

            return BadRequest("Unable to retrieve Stripe account");
        }
    }
}
