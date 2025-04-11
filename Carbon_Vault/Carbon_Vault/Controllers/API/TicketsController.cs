using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Microsoft.AspNetCore.WebUtilities;
using Carbon_Vault.Services;

namespace Carbon_Vault.Controllers.API
{
    /// <summary>
    /// Controlador responsável pela gestão de tickets de suporte no Carbon Vault.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;
        private readonly IEmailService _emailService;
        private readonly string _frontendBaseUrl;

        /// <summary>
        /// Construtor do controlador de tickets.
        /// </summary>
        /// <param name="context">Contexto do banco de dados.</param>
        /// <param name="emailService">Serviço de envio de e-mails.</param>
        public TicketsController(Carbon_VaultContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
            _frontendBaseUrl = Environment.GetEnvironmentVariable("CLIENT_URL");
        }

        /// <summary>
        /// Obtém todos os tickets de suporte.
        /// </summary>
        /// <param name="Authorization">Token de autenticação.</param>
        /// <param name="userID">ID do utilizador autenticado.</param>
        /// <returns>Lista de tickets ou erro 401 se o utilizador não tiver permissão.</returns>
        // GET: api/Tickets
        [HttpGet]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets([FromHeader] int userID)
        {
            //Check if is an Admin or a support user
            var account = await _context.Account.FindAsync(userID);
            return account.Role is not AccountType.Admin and not AccountType.Support
                ? (ActionResult<IEnumerable<Ticket>>)Unauthorized()
                : (ActionResult<IEnumerable<Ticket>>)await _context.Tickets.ToListAsync();
        }

        /// <summary>
        /// Obtém os tickets de um utilizador específico.
        /// </summary>
        /// <param name="Authorization">Token de autenticação.</param>
        /// <param name="userID">ID do utilizador autenticado.</param>
        /// <param name="RequestedUserId">ID do utilizador cujos tickets serão consultados.</param>
        /// <returns>Lista de tickets do utilizador ou erro 401 se não autorizado.</returns>
        // GET: api/Tickets/user/5
        [HttpGet("Tickets/user/{RequestedUserId}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTicketUser([FromHeader] int userID, [FromRoute] int RequestedUserId)
        {
            var account = await _context.Account.FindAsync(userID);
            //Check if is an Admin or a support user or the user itself
            if (account.Role == AccountType.Admin || account.Role == AccountType.Support || userID == RequestedUserId)
            {
                return await _context.Tickets.Where(t => t.AuthorId == RequestedUserId).ToListAsync();
            }

            return Unauthorized();
        }

        /// <summary>
        /// Obtém um ticket específico pelo ID.
        /// </summary>
        /// <param name="id">ID do ticket.</param>
        /// <returns>O ticket correspondente ou erro 404 se não encontrado.</returns>
        // GET: api/Tickets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicket(int id)
        {
            var ticket = await _context.Tickets
        .Include(t => t.Messages)
        .ThenInclude(m => m.Autor)
        .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound();
            }

            return ticket;
        }

        /// <summary>
        /// Atualiza um ticket existente.
        /// </summary>
        /// <param name="id">ID do ticket a ser atualizado.</param>
        /// <param name="ticket">Objeto contendo os novos dados do ticket.</param>
        /// <returns>NoContent se a atualização for bem-sucedida ou erro 404 se o ticket não existir.</returns>
        // PUT: api/Tickets/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTicket(int id, Ticket ticket)
        {
            if (id != ticket.Id)
            {
                return BadRequest();
            }

            _context.Entry(ticket).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TicketExists(id))
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

        /// <summary>
        /// Cria um novo ticket de suporte.
        /// </summary>
        /// <param name="ticket">Objeto contendo os detalhes do ticket.</param>
        /// <param name="category">Categoria do ticket.</param>
        /// <returns>O ticket criado ou erro 400 se o ID do autor for inválido.</returns>
        // POST: api/Tickets
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Ticket>> PostTicket(Ticket ticket, [FromHeader] string category)
        {
            var newTicket = new Ticket
            {
                Title = ticket.Title,
                Description = ticket.Description,
                AuthorId = ticket.AuthorId,
                Category = GetTicketCategory(category),
                Priority = GetTicketPriority(category),
            };

            var author = await _context.Account.FindAsync(newTicket.AuthorId);
            if (author == null)
            {
                return BadRequest("Invalid AuthorId");
            }

            _context.Tickets.Add(newTicket);
            await _context.SaveChangesAsync();

            // Add a new ticket message to the ticket as the issue of the user submitted ticket
            TicketMessage ticketMessage = new TicketMessage
            {
                Content = newTicket.Description,
                SendDate = newTicket.CreatedAt,
                TicketId = newTicket.Id,
                Autor = author
            };

            _context.TicketMessages.Add(ticketMessage);
            await _context.SaveChangesAsync();

            var savedTicket = await _context.Tickets.FindAsync(newTicket.Id);


            var supportAccounts = await _context.Account
                                   .Where(a => a.Role == AccountType.Support)
                                   .ToListAsync();

           foreach (var supportAdmin in supportAccounts)
            {
                string supportTicketHtml = $@"
                <!DOCTYPE html>
                <html lang='en'>
                <head>
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Email Template</title>
                    <style>
                        body {{
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f4f4f4;
                        }}
                        .email-container {{
                            max-width: 600px;
                            margin: 20px auto;
                            background: #ffffff;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            overflow: hidden;
                        }}
                        .email-header {{
                            background: #4ea741;
                            color: #ffffff;
                            text-align: center;
                            padding: 20px;
                        }}
                        .email-body {{
                            padding: 20px;
                            color: #333333;
                            line-height: 1.6;
                        }}
                        .email-footer {{
                            background: #f4f4f4;
                            text-align: center;
                            padding: 10px;
                            font-size: 12px;
                            color: #777777;
                        }}
                        .button {{
                            display: inline-block;
                            padding: 10px 20px;
                            margin: 20px 0;
                            background: #4ea741;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 5px;
                        }}
                    </style>
                </head>
                <body>
                    <div class='email-container'>
                        <div class='email-header'>
                            <h1>Novo Ticket Recebido</h1>
                        </div>
                        <div class='email-body'>
                            <p>Olá,</p>
                            <p>Um novo ticket foi submetido:</p>
                            <p><strong>Referência:</strong> {savedTicket.Reference}</p>
                            <p><strong>Título:</strong> {savedTicket.Title}</p>
                            <p><strong>Categoria:</strong> {savedTicket.Category}</p>
                            <p><strong>Descrição:</strong></p>
                            <p>{savedTicket.Description}</p>
                            <a class='button' href='{_frontendBaseUrl}/support-manager/{savedTicket.Id}'>Visualizar Ticket</a>
                            <p>Atenciosamente,</p>
                            <p>Equipa de Suporte do Carbon Vault</p>
                        </div>
                        <div class='email-footer'>
                            <p>&copy; 2025 Carbon Vault. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>";

                await _emailService.SendEmail(
                    supportAdmin.Email,
                    "Novo Ticket Recebido",
                    supportTicketHtml,
                    null
                );
            }


            string ticketConfirmationHtml = $@"
                <!DOCTYPE html>
                <html lang='en'>
                <head>
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Email Template</title>
                    <style>
                        body {{
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f4f4f4;
                        }}
                        .email-container {{
                            max-width: 600px;
                            margin: 20px auto;
                            background: #ffffff;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            overflow: hidden;
                        }}
                        .email-header {{
                            background: #4ea741;
                            color: #ffffff;
                            text-align: center;
                            padding: 20px;
                        }}
                        .email-body {{
                            padding: 20px;
                            color: #333333;
                            line-height: 1.6;
                        }}
                        .email-footer {{
                            background: #f4f4f4;
                            text-align: center;
                            padding: 10px;
                            font-size: 12px;
                            color: #777777;
                        }}
                        .button {{
                            display: inline-block;
                            padding: 10px 20px;
                            margin: 20px 0;
                            background: #4ea741;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 5px;
                        }}
                    </style>
                </head>
                <body>
                    <div class='email-container'>
                        <div class='email-header'>
                            <h1>O seu Ticket Foi Recebido</h1>
                        </div>
                        <div class='email-body'>
                            <p>Olá {author.Name},</p>
                            <p>O seu ticket foi recebido com sucesso!</p>
                            <p><strong>Referência:</strong> {savedTicket.Reference}</p>
                            <p><strong>Título:</strong> {savedTicket.Title}</p>
                            <p><strong>Categoria:</strong> {savedTicket.Category}</p>
                            <p><strong>Descrição:</strong></p>
                            <p>{savedTicket.Description}</p>
                            <a class='button' style='color: #ffffff; cursor: pointer;' href='{_frontendBaseUrl}/support-manager/{savedTicket.Id}'>Acompanhar Ticket</a>
                            <p>Atenciosamente,</p>
                            <p>Equipa de Suporte do Carbon Vault</p>
                        </div>
                        <div class='email-footer'>
                            <p>&copy; 2025 Carbon Vault. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>";

                await _emailService.SendEmail(
                    author.Email,
                    "O seu Ticket Foi Recebido",
                    ticketConfirmationHtml,
                    null
                );


            return CreatedAtAction("GetTicket", new { id = savedTicket.Id }, savedTicket);
        }

        private TicketCategory GetTicketCategory(string cat)
        {
            if (Enum.TryParse(typeof(TicketCategory), cat, true, out var result))
            {
                return (TicketCategory)result;
            }

            return TicketCategory.Outros;
        }

        private TicketPriority GetTicketPriority(string category)
        {
            return category.ToLower() switch
            {
                "compra" or "venda" or "transacoes" => TicketPriority.Alta,
                "relatorios" => TicketPriority.Media,
                "outros" => TicketPriority.Baixa,
                _ => TicketPriority.Baixa
            };
        }

        /// <summary>
        /// Exclui um ticket pelo ID.
        /// </summary>
        /// <param name="id">ID do ticket a ser excluído.</param>
        /// <returns>NoContent se a exclusão for bem-sucedida ou erro 404 se o ticket não existir.</returns>
        // DELETE: api/Tickets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
            {
                return NotFound();
            }

            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Obtém um ticket com base em sua referência única.
        /// </summary>
        /// <param name="reference">Referência única do ticket.</param>
        /// <param name="Authorization">Token de autenticação.</param>
        /// <param name="userID">ID do utilizador autenticado.</param>
        /// <returns>O ticket correspondente ou erro 403 se o utilizador não tiver permissão.</returns>
        [HttpGet("ticket/reference/{reference}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<Ticket>> GetTicketByReference(string reference, [FromHeader] int userID)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Messages)
                .ThenInclude(m => m.Autor)
                .FirstOrDefaultAsync(t => t.Reference == reference);

            if (ticket == null)
            {
                return NotFound();
            }

            var account = await _context.Account.FindAsync(userID);
            if (account == null)
            {
                return Unauthorized();
            }

            // Check if user is the ticket author or has admin/support role
            if (ticket.AuthorId != userID && account.Role is not AccountType.Admin and not AccountType.Support)
            {
                return Forbid();
            }

            return ticket;
        }

        private bool TicketExists(int id)
        {
            return _context.Tickets.Any(e => e.Id == id);
        }

        /// <summary>
        /// Obtém estatísticas sobre os tickets de suporte.
        /// </summary>
        /// <param name="Authorization">Token de autenticação.</param>
        /// <param name="userID">ID do utilizador autenticado.</param>
        /// <returns>Estatísticas sobre os tickets de suporte.</returns>
        // GET: api/Tickets/support/stats
        [HttpGet("support/stats")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<SupportStats>> GetSupportStats([FromHeader] int userID)
        {
            var account = await _context.Account.FindAsync(userID);
            if (account.Role is not AccountType.Admin and not AccountType.Support)
            {
                return Unauthorized();
            }

            var totalTickets = await _context.Tickets.CountAsync();
            var openTickets = await _context.Tickets.CountAsync(t => t.State == TicketState.Open);
            var closedTickets = await _context.Tickets.CountAsync(t => t.State == TicketState.Closed);

            var supportStats = new SupportStats
            {
                TotalTickets = totalTickets,
                OpenTickets = openTickets,
                ClosedTickets = closedTickets,
            };

            return supportStats;
        }
    }

    public class SupportStats
    {
        public int TotalTickets { get; set; }
        public int OpenTickets { get; set; }
        public int ClosedTickets { get; set; }

    }
}