using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Carbon_Vault.Controllers.API
{
    /// <summary>
    /// Controlador responsável pela gestão das emissões de carbono dos utilizadores.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class UserEmissionsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;

        /// <summary>
        /// Construtor do controlador de emissões de utilizador.
        /// </summary>
        /// <param name="context">Contexto do banco de dados.</param>
        public UserEmissionsController(Carbon_VaultContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém as emissões de um utilizador específico.
        /// </summary>
        /// <param name="userID">O identificador único do utilizador.</param>
        /// <returns>Retorna os dados de emissões do utilizador ou erro 404 se não forem encontradas.</returns>
        // GET: api/UserEmissions/5
        [HttpGet("{userID}")]
        public async Task<ActionResult<UserEmissions>> GetUserEmissions(int userID)
        {
            var userEmissions = await _context.UserEmissions
                .FirstOrDefaultAsync(ue => ue.UserId == userID);  // Usa o UserId para encontrar as emissões do utilizador

            if (userEmissions == null)
            {
                return NotFound();  // Se não encontrar, retorna 404
            }

            return userEmissions;
        }

        /// <summary>
        /// Atualiza os dados de emissões de um utilizador.
        /// </summary>
        /// <param name="userID">O identificador único do utilizador.</param>
        /// <param name="userEmissions">Objeto contendo os novos dados de emissões.</param>
        /// <returns>Retorna NoContent se a atualização for bem-sucedida ou erro 404 se o utilizador não for encontrado.</returns>
        // PUT: api/UserEmissions/5
        [HttpPut("{userID}")]
        public async Task<IActionResult> PutUserEmissions(int userID, UserEmissions userEmissions)
        {
            var existingEmissions = await _context.UserEmissions
                .FirstOrDefaultAsync(ue => ue.UserId == userID);  // Verifica se as emissões do utilizador já existem

            if (existingEmissions == null)
            {
                return NotFound();  // Se não encontrar, retorna 404
            }

            // Atualiza os campos de emissões
            existingEmissions.electricity = userEmissions.electricity;
            existingEmissions.petrol = userEmissions.petrol;
            existingEmissions.diesel = userEmissions.diesel;

            await _context.SaveChangesAsync();  // Salva as alterações no banco de dados
            return NoContent();  // Retorna 204 No Content indicando sucesso na atualização
        }

        /// <summary>
        /// Regista as emissões de um utilizador.
        /// </summary>
        /// <param name="userEmissions">Objeto contendo os dados das emissões do utilizador.</param>
        /// <returns>Retorna a emissão criada com status 201 (Created) ou erro 400 se o utilizador já possuir um registo de emissões.</returns>
        // POST: api/UserEmissions
        [HttpPost]
        public async Task<ActionResult<UserEmissions>> PostUserEmissions(UserEmissions userEmissions)
        {
            // Verifica se o utilizador já tem emissões, se sim, retorna 400 (Bad Request)
            var existingEmissions = await _context.UserEmissions
                .FirstOrDefaultAsync(ue => ue.UserId == userEmissions.UserId);

            if (existingEmissions != null)
            {
                return BadRequest("O utilizador já possui emissões registradas.");
            }

            // Cria uma nova emissão para o utilizador
            _context.UserEmissions.Add(userEmissions);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUserEmissions", new { id = userEmissions.Id }, userEmissions);
        }

        /// <summary>
        /// Exclui os registos de emissões de um utilizador.
        /// </summary>
        /// <param name="userID">O identificador único do utilizador.</param>
        /// <returns>Retorna NoContent se a exclusão for bem-sucedida ou erro 404 se os dados não forem encontrados.</returns>
        // DELETE: api/UserEmissions/5
        [HttpDelete("{userID}")]
        public async Task<IActionResult> DeleteUserEmissions(int userID)
        {
            var userEmissions = await _context.UserEmissions
                .FirstOrDefaultAsync(ue => ue.UserId == userID);  // Usa UserId para encontrar a emissão

            if (userEmissions == null)
            {
                return NotFound();  // Se não encontrar, retorna 404
            }

            _context.UserEmissions.Remove(userEmissions);
            await _context.SaveChangesAsync();

            return NoContent();  // Retorna 204 No Content indicando sucesso
        }
    }
}