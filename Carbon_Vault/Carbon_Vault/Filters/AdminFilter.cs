using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Carbon_Vault.Models;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.HttpResults;

public class AdminFilter : IAsyncActionFilter // Usando IAsyncActionFilter para suporte ass�ncrono
{
    private readonly Carbon_VaultContext _context;

    public AdminFilter(Carbon_VaultContext context)
    {
        _context = context;
    }

    // Método assíncrono chamado antes da execução da ação, para verificar se o utilizador tem privilégios de admin.
    // Se o utilizador não for um administrador ou se o ID do utilizador for inválido, a requisição será negada.
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next) // Alterado para Task
    {
        var userIdHeader = context.HttpContext.Request.Headers["userId"].FirstOrDefault();

        if (string.IsNullOrEmpty(userIdHeader) || !int.TryParse(userIdHeader, out int userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var user = await _context.Account
                                  .Where(u => u.Id == userId)
                                  .FirstOrDefaultAsync();

        if (user == null || user.Role != AccountType.Admin)
        {
            context.Result = new ForbidResult();
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }
}
