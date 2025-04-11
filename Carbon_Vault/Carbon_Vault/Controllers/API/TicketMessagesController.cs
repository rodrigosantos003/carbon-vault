using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Carbon_Vault.Services;

namespace Carbon_Vault.Controllers.API
{
    /// <summary>
    /// Controlador responsável pela gestão de mensagens de tickets.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class TicketMessagesController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly string _frontendBaseUrl;
        private readonly Carbon_VaultContext _context;

        /// <summary>
        /// Construtor do controlador de mensagens de tickets.
        /// </summary>
        /// <param name="context">Contexto do banco de dados.</param>
        /// <param name="emailService">Serviço de envio de emails.</param>
        public TicketMessagesController(Carbon_VaultContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
            _frontendBaseUrl = Environment.GetEnvironmentVariable("CLIENT_URL");
        }

        /// <summary>
        /// Obtém todas as mensagens de tickets cadastradas no sistema.
        /// </summary>
        /// <returns>Uma lista contendo todas as mensagens de tickets.</returns>
        // GET: api/TicketMessages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketMessage>>> GetTicketMessage()
        {
            return await _context.TicketMessages.ToListAsync();
        }

        /// <summary>
        /// Obtém uma mensagem de ticket específica pelo seu ID.
        /// </summary>
        /// <param name="id">O identificador único da mensagem do ticket.</param>
        /// <returns>Retorna a mensagem do ticket correspondente ou erro 404 se não for encontrada.</returns>
        // GET: api/TicketMessages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TicketMessage>> GetTicketMessage(int id)
        {
            var ticketMessage = await _context.TicketMessages.FindAsync(id);

            if (ticketMessage == null)
            {
                return NotFound();
            }

            return ticketMessage;
        }

        /// <summary>
        /// Atualiza uma mensagem de ticket existente.
        /// </summary>
        /// <param name="id">O identificador único da mensagem do ticket.</param>
        /// <param name="ticketMessage">Objeto contendo os dados atualizados da mensagem.</param>
        /// <returns>Retorna NoContent se a atualização for bem-sucedida ou erro se houver falha.</returns>
        // PUT: api/TicketMessages/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTicketMessage(int id, TicketMessage ticketMessage)
        {
            if (id != ticketMessage.Id)
            {
                return BadRequest();
            }

            _context.Entry(ticketMessage).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TicketMessageExists(id))
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
        /// Cria uma nova mensagem em um ticket.
        /// </summary>
        /// <param name="ticketMessage">Objeto contendo os dados da nova mensagem.</param>
        /// <returns>Retorna a mensagem criada com status 201 (Created) ou erro caso o token seja inválido.</returns>
        // POST: api/TicketMessages
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<TicketMessage>> PostTicketMessage(TicketMessage ticketMessage)
        {
            _context.TicketMessages.Add(ticketMessage);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTicketMessage", new { id = ticketMessage.Id }, ticketMessage);
        }

        /// <summary>
        /// Envia uma nova mensagem para um ticket e notifica o destinatário adequado.
        /// </summary>
        /// <param name="ticketMessage">Objeto contendo os dados da nova mensagem.</param>
        /// <param name="Authorization">Token de autorização.</param>
        /// <param name="userID">ID do utilizador que está enviando a mensagem.</param>
        /// <returns>Retorna a mensagem criada ou erro caso o utilizador não seja autorizado.</returns>
        [HttpPost("send")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<TicketMessage>> SendMessage(TicketMessage ticketMessage, [FromHeader] int userID)
        {
            var account = await _context.Account.FindAsync(userID);
            if (account == null)
            {
                return Unauthorized();
            }

            var ticket = await _context.Tickets
                .Include(t => t.Messages)
                .ThenInclude(m => m.Autor)
                .FirstOrDefaultAsync(t => t.Id == ticketMessage.TicketId);

            if (ticket == null)
            {
                return BadRequest("Ticket not found");
            }

            ticketMessage.Autor = account;
            ticketMessage.SendDate = DateTime.UtcNow;
            _context.TicketMessages.Add(ticketMessage);
            await _context.SaveChangesAsync();

            Account recipient = null;

            if (account.Role == AccountType.User)
            {
                recipient = ticket.Messages
                    .Where(m => m.Autor.Role == AccountType.Support)
                    .OrderByDescending(m => m.SendDate)
                    .Select(m => m.Autor)
                    .FirstOrDefault();
            }
            else if (account.Role == AccountType.Support)
            {
                recipient = ticket.Messages
                    .Where(m => m.Autor.Role == AccountType.User)
                    .OrderByDescending(m => m.SendDate)
                    .Select(m => m.Autor)
                    .FirstOrDefault();

                if (recipient == null)
                {
                    recipient = ticket.Author;
                }
            }

            if (recipient != null)
            {
                string subject = (account.Role == AccountType.User) 
                    ? "Nova Resposta no Ticket" 
                    : "Nova Atualização no Seu Ticket";

                string responderType = (account.Role == AccountType.User) ? "O utilizador" : "O suporte";
                string ticketLink = $"{_frontendBaseUrl}/support-manager/{ticket.Id}";

                string ticketEmailHtmlContent = $@"
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
                        .button:hover {{
                            background: #356a2d;
                        }}
                    </style>
                </head>
                <body>
                    <div class='email-container'>
                        <div class='email-header'>
                            <h1>{subject}</h1>
                        </div>
                        <div class='email-body'>
                            <p>Olá {recipient.Name},</p>
                            <p>{responderType} <strong>{account.Name}</strong> respondeu ao ticket <strong>{ticket.Title}</strong>.</p>
                            <p><strong>Mensagem:</strong></p>
                            <p>{ticketMessage.Content}</p>
                            <p>Pode acompanhar o ticket clicando no botão abaixo:</p>
                            <a href='{ticketLink}' class='button'>Ver Ticket</a>
                            <p>Em caso de dúvida, envie um email para: support@CarbonVault.pt</p>
                            <p>Atenciosamente,</p>
                            <p>Equipa de Suporte do Carbon Vault</p>
                        </div>
                        <div class='email-footer'>
                            <p>&copy; 2025 Carbon Vault. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
                ";

                
                await _emailService.SendEmail(recipient.Email, subject, ticketEmailHtmlContent, null);

            }

            return CreatedAtAction("GetTicketMessage", new { id = ticketMessage.Id }, ticketMessage);
        }

        /// <summary>
        /// Exclui uma mensagem de ticket pelo seu ID.
        /// </summary>
        /// <param name="id">O identificador único da mensagem do ticket.</param>
        /// <returns>Retorna NoContent se a exclusão for bem-sucedida ou erro 404 se a mensagem não for encontrada.</returns>
        // DELETE: api/TicketMessages/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicketMessage(int id)
        {
            var ticketMessage = await _context.TicketMessages.FindAsync(id);
            if (ticketMessage == null)
            {
                return NotFound();
            }

            _context.TicketMessages.Remove(ticketMessage);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Verifica se uma mensagem de ticket existe no banco de dados.
        /// </summary>
        /// <param name="id">O identificador único da mensagem do ticket.</param>
        /// <returns>Retorna true se a mensagem existir, caso contrário, retorna false.</returns>
        private bool TicketMessageExists(int id)
        {
            return _context.TicketMessages.Any(e => e.Id == id);
        }
    }
}