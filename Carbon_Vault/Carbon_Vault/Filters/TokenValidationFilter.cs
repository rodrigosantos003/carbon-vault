using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Carbon_Vault.Models;

public class TokenValidationFilter : IActionFilter
{
    /// <summary>
    /// Método que é chamado antes da execução de uma ação no controlador.
    /// Valida o token de autorização e o ID do usuário presentes nos cabeçalhos da requisição.
    /// Se os cabeçalhos estiverem ausentes ou inválidos, a requisição é negada com um resultado "Unauthorized".
    /// </summary>
    /// <param name="context"></param>
    public void OnActionExecuting(ActionExecutingContext context)
    {
        var authorizationHeader = context.HttpContext.Request.Headers["Authorization"].FirstOrDefault();
        var userIdHeader = context.HttpContext.Request.Headers["userId"].FirstOrDefault();

        if (string.IsNullOrEmpty(authorizationHeader) || string.IsNullOrEmpty(userIdHeader))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        int userId;
        if (!int.TryParse(userIdHeader, out userId) || !AuthHelper.IsTokenValid(authorizationHeader, userId))
        {
            context.Result = new UnauthorizedResult();
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }
}