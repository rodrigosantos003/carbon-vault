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
    public class UserEmissionsController : Controller
    {
        private readonly Carbon_VaultContext _context;

        public UserEmissionsController(Carbon_VaultContext context)
        {
            _context = context;
        }

        // GET: UserEmissions
        public async Task<IActionResult> Index()
        {
            var carbon_VaultContext = _context.UserEmissions.Include(u => u.UserId);
            return View(await carbon_VaultContext.ToListAsync());
        }

        // GET: UserEmissions/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var userEmissions = await _context.UserEmissions
                .Include(u => u.UserId)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (userEmissions == null)
            {
                return NotFound();
            }

            return View(userEmissions);
        }

        // GET: UserEmissions/Create
        public IActionResult Create()
        {
            ViewData["UserId"] = new SelectList(_context.Account, "Id", "Email");
            return View();
        }

        // POST: UserEmissions/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,electricity,diesel,petrol,UserId")] UserEmissions userEmissions)
        {
            if (ModelState.IsValid)
            {
                _context.Add(userEmissions);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["UserId"] = new SelectList(_context.Account, "Id", "Email", userEmissions.UserId);
            return View(userEmissions);
        }

        // GET: UserEmissions/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var userEmissions = await _context.UserEmissions.FindAsync(id);
            if (userEmissions == null)
            {
                return NotFound();
            }
            ViewData["UserId"] = new SelectList(_context.Account, "Id", "Email", userEmissions.UserId);
            return View(userEmissions);
        }

        // POST: UserEmissions/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,electricity,diesel,petrol,UserId")] UserEmissions userEmissions)
        {
            if (id != userEmissions.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(userEmissions);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!UserEmissionsExists(userEmissions.Id))
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
            ViewData["UserId"] = new SelectList(_context.Account, "Id", "Email", userEmissions.UserId);
            return View(userEmissions);
        }

        // GET: UserEmissions/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var userEmissions = await _context.UserEmissions
                .Include(u => u.UserId)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (userEmissions == null)
            {
                return NotFound();
            }

            return View(userEmissions);
        }

        // POST: UserEmissions/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var userEmissions = await _context.UserEmissions.FindAsync(id);
            if (userEmissions != null)
            {
                _context.UserEmissions.Remove(userEmissions);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool UserEmissionsExists(int id)
        {
            return _context.UserEmissions.Any(e => e.Id == id);
        }
    }
}
