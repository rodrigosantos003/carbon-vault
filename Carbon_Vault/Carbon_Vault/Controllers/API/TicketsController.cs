using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Data;
using Carbon_Vault.Models;

namespace Carbon_Vault.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;

        public TicketsController(Carbon_VaultContext context)
        {
            _context = context;
        }

        // GET: api/Tickets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTicket([FromHeader] string Authorization, [FromHeader] int userID)
        {
            if (!AuthHelper.IsTokenValid(Authorization, userID))
            {
                return Unauthorized();
            }
            //Check if is an Admin or a support user
            var account = await _context.Account.FindAsync(userID);
            if (account.Role != AccountType.Admin && account.Role != AccountType.Support)
            {
                return Unauthorized();
            }   
            return await _context.Ticket.ToListAsync();
        }

        // GET: api/Tickets/user/5
        [HttpGet("Tickets/user/{RequestedUserId}")]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTicketUser([FromHeader] string Authorization, [FromHeader] int userID, [FromRoute] int RequestedUserId)
        {
            if (!AuthHelper.IsTokenValid(Authorization, userID))
            {
                return Unauthorized();
            }
            var account = await _context.Account.FindAsync(userID);
            //Check if is an Admin or a support user or the user itself
            if ((account.Role != AccountType.Admin && account.Role != AccountType.Support) && userID != RequestedUserId)
            {
                return Unauthorized();
            }

            return await _context.Ticket.Where(t => t.AuthorId == RequestedUserId).ToListAsync();
        }

        // GET: api/Tickets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicket(int id)
        {
            var ticket = await _context.Ticket
        .Include(t => t.Messages)
        .ThenInclude(m => m.Autor) 
        .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound();
            }

            return ticket;
        }

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

        // POST: api/Tickets
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Ticket>> PostTicket(Ticket ticket)
        {
            var author = await _context.Account.FindAsync(ticket.AuthorId);
            if (author == null)
            {
                return BadRequest("Invalid AuthorId");
            }

            _context.Ticket.Add(ticket);
            await _context.SaveChangesAsync();

            // Add a new ticket message to the ticket as the issue of the user submitted ticket
            TicketMessage ticketMessage = new TicketMessage
            {
                Content = ticket.Description,
                SendDate = ticket.CreatedAt,
                TicketId = ticket.Id,
                Autor = author
            };

            _context.TicketMessage.Add(ticketMessage);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTicket", new { id = ticket.Id }, ticket);
        }

        // DELETE: api/Tickets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.Ticket.FindAsync(id);
            if (ticket == null)
            {
                return NotFound();
            }

            _context.Ticket.Remove(ticket);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TicketExists(int id)
        {
            return _context.Ticket.Any(e => e.Id == id);
        }
    }
}
