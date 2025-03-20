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
    public class TicketMessagesController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;

        public TicketMessagesController(Carbon_VaultContext context)
        {
            _context = context;
        }

        // GET: api/TicketMessages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketMessage>>> GetTicketMessage()
        {
            return await _context.TicketMessage.ToListAsync();
        }

        // GET: api/TicketMessages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TicketMessage>> GetTicketMessage(int id)
        {
            var ticketMessage = await _context.TicketMessage.FindAsync(id);

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
        public async Task<ActionResult<TicketMessage>> PostTicketMessage(TicketMessage ticketMessage , [FromHeader] string Authorization, [FromHeader] int userID)
        {
            if(!AuthHelper.IsTokenValid(Authorization, userID))
            {
                return Unauthorized();
            }
            var account = await _context.Account.FindAsync(userID);


            _context.TicketMessage.Add(ticketMessage);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTicketMessage", new { id = ticketMessage.Id }, ticketMessage);
        }

        // DELETE: api/TicketMessages/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicketMessage(int id)
        {
            var ticketMessage = await _context.TicketMessage.FindAsync(id);
            if (ticketMessage == null)
            {
                return NotFound();
            }

            _context.TicketMessage.Remove(ticketMessage);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TicketMessageExists(int id)
        {
            return _context.TicketMessage.Any(e => e.Id == id);
        }
    }
}
