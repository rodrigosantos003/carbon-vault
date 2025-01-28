using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Data;
using Carbon_Vault.Models;

namespace Carbon_Vault.Controllers
{
    public class CarbonCreditsController : Controller
    {
        private readonly Carbon_VaultContext _context;

        public CarbonCreditsController(Carbon_VaultContext context)
        {
            _context = context;
        }

        // GET: CarbonCredits
        public async Task<IActionResult> Index()
        {
            var carbon_VaultContext = _context.CarbonCredits.Include(c => c.Project);
            return View(await carbon_VaultContext.ToListAsync());
        }

        // GET: CarbonCredits/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var carbonCredit = await _context.CarbonCredits
                .Include(c => c.Project)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (carbonCredit == null)
            {
                return NotFound();
            }

            return View(carbonCredit);
        }

        // GET: CarbonCredits/Create
        public IActionResult Create()
        {
            ViewData["ProjectId"] = new SelectList(_context.Projects, "Id", "Id");
            return View();
        }

        // POST: CarbonCredits/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,ProjectId,Quantity,IssueDate,ExpiryDate,SerialNumber,Certification,Price,IsSold,Buyer,Status")] CarbonCredit carbonCredit)
        {
            if (ModelState.IsValid)
            {
                _context.Add(carbonCredit);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["ProjectId"] = new SelectList(_context.Projects, "Id", "Id", carbonCredit.ProjectId);
            return View(carbonCredit);
        }

        // GET: CarbonCredits/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var carbonCredit = await _context.CarbonCredits.FindAsync(id);
            if (carbonCredit == null)
            {
                return NotFound();
            }
            ViewData["ProjectId"] = new SelectList(_context.Projects, "Id", "Id", carbonCredit.ProjectId);
            return View(carbonCredit);
        }

        // POST: CarbonCredits/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,ProjectId,Quantity,IssueDate,ExpiryDate,SerialNumber,Certification,Price,IsSold,Buyer,Status")] CarbonCredit carbonCredit)
        {
            if (id != carbonCredit.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(carbonCredit);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!CarbonCreditExists(carbonCredit.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            ViewData["ProjectId"] = new SelectList(_context.Projects, "Id", "Id", carbonCredit.ProjectId);
            return View(carbonCredit);
        }

        // GET: CarbonCredits/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var carbonCredit = await _context.CarbonCredits
                .Include(c => c.Project)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (carbonCredit == null)
            {
                return NotFound();
            }

            return View(carbonCredit);
        }

        // POST: CarbonCredits/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var carbonCredit = await _context.CarbonCredits.FindAsync(id);
            if (carbonCredit != null)
            {
                _context.CarbonCredits.Remove(carbonCredit);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool CarbonCreditExists(int id)
        {
            return _context.CarbonCredits.Any(e => e.Id == id);
        }
    }
}
