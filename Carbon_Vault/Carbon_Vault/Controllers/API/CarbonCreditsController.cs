using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Data;
using Carbon_Vault.Models;
using NuGet.Common;

namespace Carbon_Vault.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarbonCreditsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;

        public CarbonCreditsController(Carbon_VaultContext context)
        {
            _context = context;
        }

        // GET: api/CarbonCredits
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CarbonCredit>>> GetCarbonCredits()
        {
            return await _context.CarbonCredits.ToListAsync();
        }

        // GET: api/CarbonCredits/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CarbonCredit>> GetCarbonCredit(int id)
        {
            var carbonCredit = await _context.CarbonCredits.FindAsync(id);

            if (carbonCredit == null)
            {
                return NotFound();
            }

            return carbonCredit;
        }

        [HttpGet("user/{userID}")]
        public async Task<ActionResult<IEnumerable<CarbonCredit>>> GetUserCarbonCredits(int userID)
        {
            return await _context.CarbonCredits.Where(c => c.BuyerId == userID).ToListAsync();
        }

        // PUT: api/CarbonCredits/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<IActionResult> PutCarbonCredit(int id, CarbonCredit carbonCredit)
        {
            if (id != carbonCredit.Id)
            {
                return BadRequest();
            }

            _context.Entry(carbonCredit).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CarbonCreditExists(id))
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

        // POST: api/CarbonCredits
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<ActionResult<CarbonCredit>> PostCarbonCredit(CarbonCredit carbonCredit)
        {
            _context.CarbonCredits.Add(carbonCredit);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCarbonCredit", new { id = carbonCredit.Id }, carbonCredit);
        }

        // DELETE: api/CarbonCredits/5
        [HttpDelete("{id}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<IActionResult> DeleteCarbonCredit(int id)
        {
            var carbonCredit = await _context.CarbonCredits.FindAsync(id);
            if (carbonCredit == null)
            {
                return NotFound();
            }

            _context.CarbonCredits.Remove(carbonCredit);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CarbonCreditExists(int id)
        {
            return _context.CarbonCredits.Any(e => e.Id == id);
        }
    }
}
