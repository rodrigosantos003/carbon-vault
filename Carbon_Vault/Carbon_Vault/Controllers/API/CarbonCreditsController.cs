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
    /// <summary>
    /// Controlador responsável pela gestão de créditos de carbono na API.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class CarbonCreditsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;

        /// <summary>
        /// Construtor do controlador de créditos de carbono.
        /// </summary>
        /// <param name="context">Contexto do banco de dados.</param>
        public CarbonCreditsController(Carbon_VaultContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a lista de todos os créditos de carbono disponíveis no sistema.
        /// </summary>
        /// <returns>Uma lista contendo todos os créditos de carbono.</returns>
        // GET: api/CarbonCredits
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CarbonCredit>>> GetCarbonCredits()
        {
            return await _context.CarbonCredits.ToListAsync();
        }

        /// <summary>
        /// Obtém um crédito de carbono específico pelo seu ID.
        /// </summary>
        /// <param name="id">O identificador único do crédito de carbono.</param>
        /// <returns>Retorna o crédito de carbono correspondente ou um erro 404 se não for encontrado.</returns>
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

        /// <summary>
        /// Obtém a lista de créditos de carbono adquiridos por um utilizador específico.
        /// </summary>
        /// <param name="userID">O identificador único do utilizador.</param>
        /// <returns>Uma lista de créditos de carbono pertencentes ao utilizador.</returns>
        [HttpGet("user/{userID}")]
        public async Task<ActionResult<IEnumerable<CarbonCredit>>> GetUserCarbonCredits(int userID)
        {
            return await _context.CarbonCredits.Where(c => c.BuyerId == userID).ToListAsync();
        }

        /// <summary>
        /// Atualiza as informações de um crédito de carbono existente.
        /// </summary>
        /// <param name="id">O identificador único do crédito de carbono.</param>
        /// <param name="carbonCredit">Objeto contendo os dados atualizados do crédito de carbono.</param>
        /// <param name="userID">O identificador do utilizador solicitante.</param>
        /// <param name="Authorization">Token de autorização do utilizador.</param>
        /// <returns>Retorna NoContent se a atualização for bem-sucedida, ou erro se houver falha.</returns>
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

        /// <summary>
        /// Registra um novo crédito de carbono no sistema.
        /// </summary>
        /// <param name="carbonCredit">Objeto contendo os dados do novo crédito de carbono.</param>
        /// <param name="userID">O identificador do utilizador solicitante.</param>
        /// <param name="Authorization">Token de autorização do utilizador.</param>
        /// <returns>Retorna o crédito de carbono criado com status 201 (Created).</returns>
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

        /// <summary>
        /// Exclui um crédito de carbono do sistema.
        /// </summary>
        /// <param name="id">O identificador único do crédito de carbono a ser excluído.</param>
        /// <param name="userID">O identificador do utilizador solicitante.</param>
        /// <param name="Authorization">Token de autorização do utilizador.</param>
        /// <returns>Retorna NoContent se a exclusão for bem-sucedida, ou erro se não for encontrado.</returns>
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

        /// <summary>
        /// Verifica se um crédito de carbono existe no banco de dados.
        /// </summary>
        /// <param name="id">O identificador único do crédito de carbono.</param>
        /// <returns>Retorna true se o crédito de carbono existir, caso contrário, retorna false.</returns>
        private bool CarbonCreditExists(int id)
        {
            return _context.CarbonCredits.Any(e => e.Id == id);
        }
    }
}