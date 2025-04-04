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
    [Route("api/[controller]")]
    [ApiController]
    public class TicketMessagesController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly string _frontendBaseUrl;
        private readonly Carbon_VaultContext _context;

        public TicketMessagesController(Carbon_VaultContext context,IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
            _frontendBaseUrl = Environment.GetEnvironmentVariable("CLIENT_URL");
        }

        // GET: api/TicketMessages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketMessage>>> GetTicketMessage()
        {
            return await _context.TicketMessages.ToListAsync();
        }

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

            // Save the message
            ticketMessage.Autor = account;
            ticketMessage.SendDate = DateTime.UtcNow;
            _context.TicketMessages.Add(ticketMessage);
            await _context.SaveChangesAsync();

            // Determine the recipient
            Account recipient = null;

            if (account.Role == AccountType.User)
            {
                // User sends a message → Notify last responding support admin
                recipient = ticket.Messages
                    .Where(m => m.Autor.Role == AccountType.Support)
                    .OrderByDescending(m => m.SendDate)
                    .Select(m => m.Autor)
                    .FirstOrDefault();
            }
            else if (account.Role == AccountType.Support)
            {
                // Admin sends a message → Notify last responding user
                recipient = ticket.Messages
                    .Where(m => m.Autor.Role == AccountType.User)
                    .OrderByDescending(m => m.SendDate)
                    .Select(m => m.Autor)
                    .FirstOrDefault();

                // If no previous user messages exist, notify the ticket creator
                if (recipient == null)
                {
                    recipient = ticket.Author;
                }
            }

            // Send email notification if a recipient exists
            if (recipient != null)
            {
                //string subject = (account.Role == AccountType.User) ? "Novo Resposta no Ticket" : "Nova Atualização no Seu Ticket";
                //string emailBody = $"Olá {recipient.Name},\n\n" +
                //                   $"{(account.Role == AccountType.User ? "O utilizador" : "O suporte")} {account.Name} respondeu ao ticket \"{ticket.Title}\".\n\n" +
                //                   $"Mensagem: \"{ticketMessage.Content}\"\n\n" +
                //                   $"Acompanhe o ticket aqui: {_frontendBaseUrl}/support-manager/{ticket.Id}\n\n" +
                //                   $"Atenciosamente,\nEquipa de Suporte do Carbon Vault";

                //await _emailService.SendEmail(recipient.Email, subject, emailBody, null);
            }

            return CreatedAtAction("GetTicketMessage", new { id = ticketMessage.Id }, ticketMessage);
        }

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

        private bool TicketMessageExists(int id)
        {
            return _context.TicketMessages.Any(e => e.Id == id);
        }
    }
}
