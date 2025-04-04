﻿using System;
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
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;
        private readonly IEmailService _emailService;
        private readonly string _frontendBaseUrl;

        public TicketsController(Carbon_VaultContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
            _frontendBaseUrl = Environment.GetEnvironmentVariable("CLIENT_URL");
        }

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

            //foreach (var supportAdmin in supportAccounts)
            //{
            //    await _emailService.SendEmail(
            //        supportAdmin.Email,
            //        "Novo Ticket Recebido",
            //        $"Olá,\n\nNovo ticket submetido.\n\n" +
            //        $" **Referência:** {savedTicket.Reference}\n" +
            //        $" **Título:** {savedTicket.Title}\n" +
            //        $" **Categoria:** {savedTicket.Category}\n" +
            //        $" **Descrição:** {savedTicket.Description}\n\n" +
            //        $" [Visualizar Ticket]({_frontendBaseUrl}/support-manager/{savedTicket.Id})\n\n" +
            //        $"Atenciosamente,\nEquipa de Suporte do Carbon Vault",
            //        null
            //    );
            //}


            //await _emailService.SendEmail(
            //    author.Email,
            //    "O seu Ticket Foi Recebido",
            //    $"Olá {author.Name},\n\n" +
            //    $"O seu ticket foi recebido com sucesso!\n\n" +
            //    $"**Referência:** {savedTicket.Reference}\n" +
            //    $"**Título:** {savedTicket.Title}\n" +
            //    $"**Categoria:** {savedTicket.Category}\n" +
            //    $"**Descrição:** {savedTicket.Description}\n\n" +
            //    $"Acompanhe o estado  do seu ticket aqui: {_frontendBaseUrl}/support-manager/{savedTicket.Id}\n\n" +
            //    $"Atenciosamente,\nEquipa de Suporte do Carbon Vault",
            //    null
            //);

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
