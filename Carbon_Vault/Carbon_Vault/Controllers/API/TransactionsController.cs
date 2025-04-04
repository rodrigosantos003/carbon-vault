using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Carbon_Vault.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;

        public TransactionsController(Carbon_VaultContext context)
        {
            _context = context;
        }

        private bool TransactionExists(int id)
        {
            return _context.Transactions.Any(t => t.Id == id);
        }

        [HttpGet]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
        {
            return await _context.Transactions.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);

            if (transaction == null)
            {
                return NotFound();
            }

            return Ok(transaction);
        }

        [HttpPost]
        public async Task<IActionResult> PostTransaction(Transaction transaction)
        {
            transaction.State = TransactionState.Pending;

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTransaction", transaction);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTransaction(int id, Transaction transaction, [FromHeader] string Authorization, int accountID)
        {
            if (!AuthHelper.IsTokenValid(Authorization, accountID))
            {
                return Unauthorized();
            }

            if (id != transaction.Id)
            {
                return BadRequest();
            }

            _context.Entry(transaction).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TransactionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id, [FromHeader] string Authorization, int userID)
        {
            if (!AuthHelper.IsTokenValid(Authorization, userID))
            {
                return Unauthorized();
            }

            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("type/{type}/user/{userID}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactionsByType(int type, int userID)
        {
            var transactions = await _context.Transactions.Select(t => new
            {
                t.Id,
                State = t.State.ToString(),
                Project = _context.Projects.Where(p => p.Id == t.ProjectId).Select(p => p.Name).FirstOrDefault(),
                t.Date,
                t.BuyerId, t.SellerId
            }).Where(t => type == 0 ? t.BuyerId == userID : t.SellerId == userID)
            .ToListAsync();

            if (!transactions.Any())
            {
                return NotFound(new {message = "Nenhuma transação encontrada para este tipo."});
            }

            return Ok(transactions);
        }

        [HttpGet("details/{id}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<Transaction>> GetTransactionDetails(int id, [FromHeader] int userID)
        {
            var account = await _context.Account.FindAsync(userID);

            Console.WriteLine("###############################################");
            Console.WriteLine("ID: " + id);

            var transaction = await _context.Transactions
                .Where(t => t.Id == id && (t.BuyerId == userID || t.SellerId == userID || account.Role == AccountType.Admin))
                .Select(t => new
                {
                    t.Id,
                    Project = _context.Projects.Where(p => p.Id == t.ProjectId).Select(p => p.Name).FirstOrDefault(),
                    t.Date,
                    t.BuyerId,
                    t.SellerId,
                    t.TotalPrice,
                    buyerName = _context.Account.Where(a => a.Id == t.BuyerId).Select(a => a.Name).FirstOrDefault(),
                    sellerName = _context.Account.Where(a => a.Id == t.SellerId).Select(a => a.Name).FirstOrDefault(),
                    t.Quantity,
                    t.CheckoutSession,
                    t.PaymentMethod,
                    projectDescription = _context.Projects.Where(p => p.Id == t.ProjectId).Select(p => p.Description).FirstOrDefault(),
                    projectCertifier = _context.Projects.Where(p => p.Id == t.ProjectId).Select(p => p.Certification).FirstOrDefault(),
                    projectLocation = _context.Projects.Where(p => p.Id == t.ProjectId).Select(p => p.Location).FirstOrDefault(),
                })
                .FirstOrDefaultAsync();

            Console.WriteLine("Transaction: " + transaction);

            if (transaction == null)
            {
                return NotFound("Transação não encontrada.");
            }

            return Ok(transaction);
        }
        [HttpGet("weekly")]
        public IActionResult GetWeeklyTransactionData()
        {
            var now = DateTime.UtcNow;
            var startOfThisWeek = now.AddDays(-(int)now.DayOfWeek).Date; // Start of current week (Sunday)
            var startOfLastWeek = startOfThisWeek.AddDays(-7); // Start of previous week

            // Fetch all transactions (be mindful of the size of the data)
            var transactions = _context.Transactions
                .Select(t => new
                {
                    t.Id,
                    t.BuyerId,
                    t.SellerId,
                    t.ProjectId,
                    t.Quantity,
                    t.TotalPrice,
                    t.Date,
                    t.State,
                    t.CheckoutSession,
                    t.PaymentMethod
                })
                .ToList(); // Load all transactions in memory

            // Filter transactions for this week
            var transactionsThisWeek = transactions
                .Where(t => DateTime.TryParse(t.Date, out DateTime transactionDate) &&
                            transactionDate >= startOfThisWeek && transactionDate < startOfThisWeek.AddDays(7))
                .GroupBy(t => t.Date.Substring(0, 10)) // Group by the date part (YYYY-MM-DD)
                .Select(g => new
                {
                    Date = g.Key,
                    TotalQuantity = g.Sum(t => t.Quantity),
                    Transactions = g.ToList() // Include transactions for detailed export
                })
                .ToList();

            // Filter transactions for last week
            var transactionsLastWeek = transactions
                .Where(t => DateTime.TryParse(t.Date, out DateTime transactionDate) &&
                            transactionDate >= startOfLastWeek && transactionDate < startOfThisWeek)
                .GroupBy(t => t.Date.Substring(0, 10)) // Group by the date part (YYYY-MM-DD)
                .Select(g => new
                {
                    Date = g.Key,
                    TotalQuantity = g.Sum(t => t.Quantity),
                    Transactions = g.ToList() // Include transactions for detailed export
                })
                .ToList();

            // Prepare the result
            var result = new
            {
                thisWeek = transactionsThisWeek,
                lastWeek = transactionsLastWeek
            };

            return Ok(result);
        }
    }
}
