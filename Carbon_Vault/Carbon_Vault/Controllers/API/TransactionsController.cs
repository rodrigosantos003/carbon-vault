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
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions([FromHeader] string Authorization, int accountID)
        {
            if (string.IsNullOrEmpty(Authorization) || !Authorization.StartsWith("Bearer "))
            {
                return Unauthorized();
            }

            var jwt = Authorization.Substring("Bearer ".Length).Trim();

            if (AuthHelper.IsTokenValid(jwt, accountID))
            {
                return Unauthorized();
            }

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
            if (string.IsNullOrEmpty(Authorization) || !Authorization.StartsWith("Bearer "))
            {
                return Unauthorized();
            }

            var jwt = Authorization.Substring("Bearer ".Length).Trim();

            if (AuthHelper.IsTokenValid(jwt, accountID))
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
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactionsByType(TransactionType type, int userID, [FromHeader] string Authorization)
        {
            if (!AuthHelper.IsTokenValid(Authorization, userID))
            {
                return Unauthorized("JWT inválido");
            }

            var transactions = await _context.Transactions.Select(t => new
            {
                t.Id,
                State = t.State.ToString(),
                t.Type,
                Project = _context.Projects.Where(p => p.Id == t.ProjectId).Select(p => p.Name).FirstOrDefault(),
                t.Date,
                t.BuyerId, t.SellerId
            }).Where(t => t.Type == type && (t.BuyerId == userID || t.SellerId == userID))
            .ToListAsync();

            if (!transactions.Any())
            {
                return NotFound("Nenhuma transação encontrada para este tipo.");
            }

            return Ok(transactions);
        }

    }
}
