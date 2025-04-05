using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Carbon_Vault.Controllers.API
{
    /// <summary>
    /// Controller para gerenciar transações no sistema Carbon Vault.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;

        public TransactionsController(Carbon_VaultContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Verifica se uma transação existe com base no ID fornecido.
        /// </summary>
        /// <param name="id">ID da transação.</param>
        /// <returns>Verdadeiro se a transação existir, falso caso contrário.</returns>
        private bool TransactionExists(int id)
        {
            return _context.Transactions.Any(t => t.Id == id);
        }

        /// <summary>
        /// Obtém todas as transações.
        /// </summary>
        /// <returns>Lista de todas as transações.</returns>
        [HttpGet]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
        {
            return await _context.Transactions.ToListAsync();
        }

        /// <summary>
        /// Obtém uma transação pelo ID.
        /// </summary>
        /// <param name="id">ID da transação.</param>
        /// <returns>A transação correspondente ou erro 404 se não encontrada.</returns>
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

        /// <summary>
        /// Cria uma nova transação.
        /// </summary>
        /// <param name="transaction">Objeto da transação.</param>
        /// <returns>A transação criada.</returns>
        [HttpPost]
        public async Task<IActionResult> PostTransaction(Transaction transaction)
        {
            transaction.State = TransactionState.Pending;

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTransaction", transaction);
        }

        /// <summary>
        /// Atualiza uma transação existente.
        /// </summary>
        /// <param name="id">ID da transação.</param>
        /// <param name="transaction">Dados da transação atualizados.</param>
        /// <param name="Authorization">Token de autenticação.</param>
        /// <param name="accountID">ID da conta autenticada.</param>
        /// <returns>Resposta de sucesso ou erro correspondente.</returns>
        [HttpPut("{id}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<IActionResult> PutTransaction(int id, Transaction transaction)
        {
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

        /// <summary>
        /// Exclui uma transação pelo ID.
        /// </summary>
        /// <param name="id">ID da transação.</param>
        /// <param name="Authorization">Token de autenticação.</param>
        /// <param name="userID">ID do utilizador autenticado.</param>
        /// <returns>Resposta de sucesso ou erro correspondente.</returns>
        [HttpDelete("{id}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return Ok();
        }

        /// <summary>
        /// Obtém todas as transações de um determinado tipo associadas a um utilizador.
        /// </summary>
        /// <param name="type">Tipo da transação (0 para compras, 1 para vendas).</param>
        /// <param name="userID">ID do utilizador.</param>
        /// <returns>Lista de transações filtradas pelo tipo especificado.</returns>
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
                t.BuyerId,
                t.SellerId
            }).Where(t => type == 0 ? t.BuyerId == userID : t.SellerId == userID)
            .ToListAsync();

            if (!transactions.Any())
            {
                return NotFound(new { message = "Nenhuma transação encontrada para este tipo." });
            }

            return Ok(transactions);
        }

        /// <summary>
        /// Obtém os detalhes de uma transação específica.
        /// </summary>
        /// <param name="id">ID da transação.</param>
        /// <param name="userID">ID do utilizador autenticado.</param>
        /// <returns>Detalhes da transação ou erro caso não seja encontrada.</returns>
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

        /// <summary>
        /// Obtém os dados de transações realizadas na semana atual e na semana anterior.
        /// </summary>
        /// <returns>Dados agregados das transações por semana.</returns>
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