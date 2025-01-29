using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class UserEmissionsController : ControllerBase
{
    private readonly Carbon_VaultContext _context;

    public UserEmissionsController(Carbon_VaultContext context)
    {
        _context = context;
    }

    // GET: api/UserEmissions/5
    [HttpGet("{userID}")]
    public async Task<ActionResult<UserEmissions>> GetUserEmissions(int userID)
    {
        var userEmissions = await _context.UserEmissions
            .FirstOrDefaultAsync(ue => ue.UserId == userID);  // Usa o UserId para encontrar as emissões do usuário

        if (userEmissions == null)
        {
            return NotFound();  // Se não encontrar, retorna 404
        }

        return userEmissions;
    }

    // PUT: api/UserEmissions/5
    [HttpPut("{userID}")]
    public async Task<IActionResult> PutUserEmissions(int userID, UserEmissions userEmissions)
    {
        var existingEmissions = await _context.UserEmissions
            .FirstOrDefaultAsync(ue => ue.UserId == userID);  // Verifica se as emissões do usuário já existem

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

    // POST: api/UserEmissions
    [HttpPost]
    public async Task<ActionResult<UserEmissions>> PostUserEmissions(UserEmissions userEmissions)
    {
        // Verifica se o usuário já tem emissões, se sim, retorna 400 (Bad Request)
        var existingEmissions = await _context.UserEmissions
            .FirstOrDefaultAsync(ue => ue.UserId == userEmissions.UserId);

        if (existingEmissions != null)
        {
            return BadRequest("O usuário já possui emissões registradas.");
        }

        // Cria uma nova emissão para o usuário
        _context.UserEmissions.Add(userEmissions);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetUserEmissions", new { id = userEmissions.Id }, userEmissions);
    }

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
