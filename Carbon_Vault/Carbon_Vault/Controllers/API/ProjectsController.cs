using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Carbon_Vault.Data;
using Carbon_Vault.Models;
using Microsoft.Extensions.Hosting;
using Carbon_Vault.Services;

namespace Carbon_Vault.Controllers.API
{
    /// <summary>
    /// Controlador de projetos. Gerencia operações CRUD para projetos, incluindo recuperação, criação, atualização, exclusão e manipulação de arquivos relacionados a projetos.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IEmailService _emailService;
        private readonly string _frontendBaseUrl;

        public ProjectsController(Carbon_VaultContext context, IWebHostEnvironment environment, IEmailService emailService)
        {
            _context = context;
            _environment = environment;
            _emailService = emailService;
            _frontendBaseUrl = Environment.GetEnvironmentVariable("CLIENT_URL");
        }

        /// <summary>
        /// Obtém todos os projetos cadastrados no sistema.
        /// </summary>
        /// <returns>Uma lista de projetos.</returns>
        // GET: api/Projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            return await _context.Projects
                .Include(p => p.Types)// Ensure project types are loaded
                .Include(p => p.CarbonCredits)   // Ensure carbon credits are loaded
                .ToListAsync();
        }

        /// <summary>
        /// Obtém todos os projetos que estão à venda.
        /// </summary>
        /// <returns>Uma lista de projetos disponíveis para venda.</returns>
        [HttpGet("forSale")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsForSale()
        {
            return await _context.Projects
                .Where(p => p.IsForSale)
                .Include(p => p.Types)// Ensure project types are loaded
                .Include(p => p.CarbonCredits)   // Ensure carbon credits are loaded
                .Where(p => p.Status == ProjectStatus.Confirmed)
                .Where(p => p.CreditsForSale > 0)
                .ToListAsync();
        }

        /// <summary>
        /// Obtém os detalhes de um projeto específico com base no ID fornecido.
        /// </summary>
        /// <param name="id">ID do projeto.</param>
        /// <returns>Retorna o projeto correspondente ao ID fornecido.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects
        .Include(p => p.Types) // Ensure project types are loaded
        .Include(p => p.CarbonCredits) // Ensure carbon credits are loaded
        .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            return project;
        }

        /// <summary>
        /// Obtém todos os projetos de um utilizador específico.
        /// </summary>
        /// <param name="userId">ID do utilizador.</param>
        /// <returns>Uma lista de projetos pertencentes ao utilizador.</returns>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsFromUser(int userId)
        {
            try
            {
                var projects = await _context.Projects
                    .Where(p => p.OwnerId == userId)
                    .Include(p => p.Types)
                    .Include(p => p.CarbonCredits)
                    .ToListAsync();

                if (projects == null || projects.Count == 0)
                {
                    return NotFound("No projects found for this user."); // Provide a clearer message
                }

                return Ok(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        /// <summary>
        /// Atualiza a propriedade de venda de um projeto (IsForSale) com base no ID fornecido.
        /// </summary>
        /// <param name="id">ID do projeto.</param>
        /// <returns>Retorna um código de status HTTP 204 (No Content) em caso de sucesso.</returns>
        [HttpPatch("forSale/{id}")]
        public async Task<IActionResult> UpdateProjectSale(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound();
            }

            if (project.Status != ProjectStatus.Confirmed)
                return StatusCode(403, "O projeto não está ativo");

            // Update the project state (flip the IsForSale value)
            project.IsForSale = !project.IsForSale;

            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content on success
        }

        /// <summary>
        /// Atualiza os detalhes de um projeto existente.
        /// </summary>
        /// <param name="id">ID do projeto.</param>
        /// <param name="project">Novo objeto de projeto com os dados a serem atualizados.</param>
        /// <returns>Retorna um código de status HTTP 204 (No Content) em caso de sucesso.</returns>
        // PUT: api/Projects/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProject(int id, Project updatedProject)
        {
            if (id != updatedProject.Id)
            {
                return BadRequest();
            }

            // Load the existing project including its types
            var existingProject = await _context.Projects
                .Include(p => p.Types)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existingProject == null)
            {
                return NotFound();
            }

            // Update scalar properties
            _context.Entry(existingProject).CurrentValues.SetValues(updatedProject);

            // Clear and reassign project types
            existingProject.Types.Clear();

            foreach (var type in updatedProject.Types)
            {
                // Attach if detached
                var existingType = await _context.ProjectTypes.FindAsync(type.Id);
                if (existingType != null)
                {
                    existingProject.Types.Add(existingType);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectExists(id))
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
        /// Cria um novo projeto e o adiciona ao banco de dados.
        /// </summary>
        /// <param name="project">Objeto contendo os dados do projeto a ser criado.</param>
        /// <returns>Retorna o projeto criado.</returns>
        // POST: api/Projects
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Project>> PostProject(Project project)
        {
            // Verifica se o OwnerId é válido e define o dono do projeto
            if (project.OwnerId != 0)
            {
                var owner = await _context.Account.FindAsync(project.OwnerId);
                if (owner == null)
                {
                    return BadRequest("O utilizador especificado não existe.");
                }
                project.Owner = owner;
                Console.WriteLine(project);
            }
            else
            {
                return BadRequest("O campo OwnerId é obrigatório.");
            }

            // Processa os Project Types (categorias) se existirem
            if (project.Types != null && project.Types.Any())
            {
                var typeIds = project.Types.Select(t => t.Id).ToList();
                var projectTypes = await _context.ProjectTypes
                                                 .Where(t => typeIds.Contains(t.Id))
                                                 .ToListAsync();

                if (projectTypes.Count != typeIds.Count)
                {
                    return BadRequest("Um ou mais tipos de projetos fornecidos são inválidos.");
                }

                project.Types = projectTypes;  // Associar os tipos do projeto
            }

            project.CreatedAt = DateTime.UtcNow;

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var ProjectLink = $"{_frontendBaseUrl}/project-manager/{project.Id}";

            var admins = await _context.Account
                             .Where(a => a.Role == AccountType.Admin)
                             .ToListAsync();
            //foreach (var admin in admins)
            //{
            //    var adminEmail = admin.Email; 

            //    // Envio do e-mail para o administrador
            //    await _emailService.SendEmail(
            //        adminEmail, 
            //        "Nova Proposta de Projeto Enviada",
            //        $"Um novo projeto foi enviado e aguarda validação. Projeto: {project.Name}, por {project.Owner.Name}<br> Pode aceder ao projeto <a href={ProjectLink}>aqui</a>",
            //        null
            //    );
            //}

            var userEmail = project.Owner.Email;
            //await _emailService.SendEmail(
            //    userEmail, 
            //    "Projeto Enviado para Validação",
            //    $"O seu projeto {project.Name} foi enviado para validação.Será notificado sobre a sua aprovação num periodo de 7-14 dias.<br> Pode aceder ao projeto <a href={ProjectLink}>aqui</a>",
            //    null
            //    );

            return CreatedAtAction("GetProject", new { id = project.Id }, project);
        }

        /// <summary>
        /// Exclui um projeto do sistema com base no ID fornecido.
        /// </summary>
        /// <param name="id">ID do projeto a ser excluído.</param>
        /// <returns>Retorna um código de status HTTP 204 (No Content) em caso de sucesso.</returns>
        // DELETE: api/Projects/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound();
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Verifica se um projeto existe no banco de dados com base no ID fornecido.
        /// </summary>
        /// <param name="id">ID do projeto.</param>
        /// <returns>Retorna true se o projeto existir, caso contrário, false.</returns>
        private bool ProjectExists(int id)
        {
            return _context.Projects.Any(e => e.Id == id);
        }

        /// <summary>
        /// Obtém os arquivos relacionados a um projeto específico com base no ID fornecido.
        /// </summary>
        /// <param name="id">ID do projeto.</param>
        /// <returns>Uma lista de arquivos relacionados ao projeto.</returns>
        [HttpGet("{id}/files")]
        public async Task<IActionResult> GetFiles(int id)
        {
            var files = await _context.ProjectFiles
                                      .Where(f => f.ProjectId == id)
                                      .ToListAsync();
            return Ok(files);
        }

        /// <summary>
        /// Faz o upload de múltiplos arquivos para um projeto específico.
        /// </summary>
        /// <param name="id">ID do projeto.</param>
        /// <param name="files">Lista de arquivos a serem enviados.</param>
        /// <returns>Retorna os arquivos enviados.</returns>
        [HttpPost("{id}/upload")]
        public async Task<IActionResult> UploadFiles(int id, List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return BadRequest("No files uploaded.");

            var uploadedFiles = new List<ProjectFiles>();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var fileName = Guid.NewGuid().ToString() + Path.GetFileName(file.FileName);
                var directoryPath = Path.Combine(_environment.ContentRootPath, "App_Data", "files");

                Directory.CreateDirectory(directoryPath);

                var filePath = Path.Combine(directoryPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var projectFile = new ProjectFiles
                {
                    FileName = Guid.NewGuid().ToString() + fileName,
                    FilePath = $"{Request.Scheme}://{Request.Host}/files/{fileName}",
                    FileType = Path.GetExtension(fileName).TrimStart('.'),
                    UploadedAt = DateTime.Now,
                    ProjectId = id
                };

                _context.ProjectFiles.Add(projectFile);
                uploadedFiles.Add(projectFile);
            }

            await _context.SaveChangesAsync();

            return Ok(uploadedFiles);
        }

        /// <summary>
        /// Faz o upload de uma imagem para um projeto específico.
        /// </summary>
        /// <param name="id">ID do projeto.</param>
        /// <param name="file">Arquivo de imagem a ser enviado.</param>
        /// <returns>Retorna o arquivo de imagem enviado.</returns>
        [HttpPost("{id}/uploadImage")]
        public async Task<IActionResult> UploadFile(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var allowedExtensions = new[] { ".png", ".jpg" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest("Only .png and .jpg files are allowed.");

            var fileName = Guid.NewGuid().ToString() + Path.GetFileName(file.FileName);
            var directoryPath = Path.Combine(_environment.ContentRootPath, "App_Data", "files");

            Directory.CreateDirectory(directoryPath);

            var filePath = Path.Combine(directoryPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var projectFile = new ProjectFiles
            {
                FileName = fileName,
                FilePath = $"{Request.Scheme}://{Request.Host}/files/{fileName}",
                FileType = fileExtension.TrimStart('.'),
                UploadedAt = DateTime.Now,
                ProjectId = id
            };

            _context.ProjectFiles.Add(projectFile);

            var project = await _context.Projects.FindAsync(id);
            if (project != null)
            {
                project.ImageUrl = $"{Request.Scheme}://{Request.Host}/files/{fileName}";
            }

            await _context.SaveChangesAsync();

            return Ok(projectFile);
        }

        /// <summary>
        /// Atualiza os arquivos de um projeto específico, removendo arquivos antigos e adicionando os novos.
        /// </summary>
        /// <param name="id">ID do projeto.</param>
        /// <param name="files">Lista de arquivos a serem atualizados.</param>
        /// <returns>Retorna os nomes dos arquivos recebidos.</returns>
        [HttpPost("{id}/files/update")]
        public async Task<IActionResult> UpdateFiles(int id, List<IFormFile> files)
        {
            if (files == null)
                files = new List<IFormFile>();

            var project = _context.Projects.Find(id);
            if (project == null)
                return NotFound("Project not found");

            var projectFiles = _context.ProjectFiles.Where(f => f.ProjectId == id).ToList();
            var directoryPath = Path.Combine(_environment.ContentRootPath, "App_Data", "files");
            Directory.CreateDirectory(directoryPath);

            // Lista de ficheiros recebidos
            var receivedFileNames = new List<string>();

            var uploadedFiles = new List<ProjectFiles>();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var originalFileName = Path.GetFileName(file.FileName);
                var existingFile = projectFiles.Find(f => f.FileName.Contains(originalFileName));
                string fileName;

                if (existingFile != null)
                {
                    fileName = existingFile.FileName;
                    projectFiles.Remove(existingFile);
                }
                else
                {
                    fileName = Guid.NewGuid().ToString() + "_" + originalFileName;
                }

                var filePath = Path.Combine(directoryPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var projectFile = new ProjectFiles
                {
                    FileName = fileName,
                    FilePath = $"{Request.Scheme}://{Request.Host}/files/{fileName}",
                    FileType = Path.GetExtension(fileName).ToLower(),
                    UploadedAt = DateTime.Now,
                    ProjectId = id
                };

                _context.ProjectFiles.Add(projectFile);
                uploadedFiles.Add(projectFile);
                receivedFileNames.Add(fileName);
            }

            // Remover ficheiros que não foram enviados
            foreach (var existingFile in projectFiles)
            {
                if (project.ImageUrl.Contains(existingFile.FileName))
                {
                    continue;
                }

                var existingFilePath = Path.Combine(directoryPath, existingFile.FileName);
                if (System.IO.File.Exists(existingFilePath))
                {
                    System.IO.File.Delete(existingFilePath);
                }

                _context.ProjectFiles.Remove(existingFile);
            }

            await _context.SaveChangesAsync();

            return Ok(receivedFileNames);
        }

        /// <summary>
        /// Exclui um arquivo de um projeto específico.
        /// </summary>
        /// <param name="projectId">ID do projeto.</param>
        /// <param name="fileId">ID do arquivo a ser excluído.</param>
        /// <param name="userID">ID do utilizador autenticado.</param>
        /// <returns>Retorna um código de status de sucesso ou erro dependendo do resultado.</returns>
        [HttpDelete("{projectId}/files/{fileId}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<IActionResult> DeleteFile(int projectId, int fileId, [FromHeader] int userID)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
            var account = await _context.Account.FindAsync(userID);

            if (project == null)
            {
                return NotFound(new { message = "Project not found." });
            }
            if (account == null)
            {
                return NotFound(new { message = "Account not found." });
            }

            // Authorization check for non-admin users
            if (account.Role != AccountType.Admin && project.Owner.Id != userID)
            {
                return Unauthorized(new { message = "This project does not belong to you." });
            }

            var file = await _context.ProjectFiles.FindAsync(fileId);
            if (file == null)
            {
                return NotFound(new { message = "File not found." });
            }

            // Remove the file from the database table
            _context.ProjectFiles.Remove(file);
            await _context.SaveChangesAsync();

            return Ok(new { message = "File deleted successfully from the database." });
        }

        /// <summary>
        /// Aprova um projeto e gera os créditos de carbono associados.
        /// </summary>
        /// <param name="id">ID do projeto.</param>
        /// <param name="Authorization">Cabeçalho de autorização com token de autenticação.</param>
        /// <param name="userID">ID do utilizador autenticado.</param>
        /// <param name="CreditsGenerated">Número de créditos de carbono gerados para o projeto.</param>
        /// <returns>Retorna uma mensagem de sucesso com o número de créditos gerados.</returns>
        [HttpPost("{id}/approve")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<IActionResult> ApproveProject(int id, [FromHeader] int userID, [FromHeader] int CreditsGenerated)
        {
            var account = await _context.Account.FindAsync(userID);
            if (account == null)
            {
                return NotFound(new { message = "Account not found." });
            }

            // Authorization check for non-admin users
            if (account.Role != AccountType.Admin)
            {
                return Unauthorized(new { message = "Only admins can aprove projects" });
            }

            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound("Projeto não encontrado.");
            }

            project.Status = ProjectStatus.Confirmed;
            project.CarbonCreditsGenerated = CreditsGenerated;
            await _context.SaveChangesAsync();

            var owner = await _context.Account.FindAsync(project.OwnerId);

            await _emailService.SendEmail(
                owner.Email,
                "Projeto Aprovado",
                $"O seu projeto {project.Name} foi aprovado e recebeu {CreditsGenerated} créditos de carbono para venda. <br> Poderá selecionar agora aqueles que quiser vender na sua aba de gestão do projeto",
                null
            );

            var carbonCredits = new List<CarbonCredit>();

            for (int i = 0; i < CreditsGenerated; i++)
            {
                var newCredit = new CarbonCredit
                {
                    ProjectId = project.Id,
                    IssueDate = DateTime.UtcNow,
                    ExpiryDate = DateTime.UtcNow.AddYears(5),
                    SerialNumber = Guid.NewGuid().ToString(),
                    Certification = project.Certification,
                    Price = (decimal)project.PricePerCredit,
                    IsSold = false,
                    Status = CreditStatus.Available
                };

                carbonCredits.Add(newCredit);
            }

            await _context.CarbonCredits.AddRangeAsync(carbonCredits);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Projeto aprovado e créditos de carbono gerados com sucesso.", creditsGenerated = CreditsGenerated });
        }

        /// <summary>
        /// Rejeita um projeto e envia um feedback ao proprietário do projeto.
        /// </summary>
        /// <param name="id">ID do projeto.</param>
        /// <param name="Authorization">Cabeçalho de autorização com token de autenticação.</param>
        /// <param name="userID">ID do utilizador autenticado.</param>
        /// <param name="feedback">Feedback sobre a rejeição do projeto.</param>
        /// <returns>Retorna uma mensagem de sucesso ou erro, dependendo do resultado.</returns>
        [HttpPost("{id}/reject")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<IActionResult> RejectProject(int id, [FromHeader] int userID, [FromHeader] string feedback)
        {
            var account = await _context.Account.FindAsync(userID);
            if (account == null)
            {
                return NotFound(new { message = "Account not found." });
            }

            // Authorization check for non-admin users
            if (account.Role != AccountType.Admin)
            {
                return Unauthorized(new { message = "Only admins can approve projects" });
            }

            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound("Projeto não encontrado.");
            }

            // Ensure feedback is not null or empty
            if (string.IsNullOrEmpty(feedback))
            {
                return BadRequest(new { message = "The feedback field is required." });
            }

            // Reject the project
            project.Status = ProjectStatus.Denied;
            await _context.SaveChangesAsync();

            var owner = await _context.Account.FindAsync(project.OwnerId);

            await _emailService.SendEmail(
                owner.Email,
                "Projeto Rejeitado",
                $"O seu projeto {project.Name} foi rejeitado <br> Razão : <br> {feedback}",
                null
            );

            return Ok(new { message = "Projeto Rejeitado com sucesso." });
        }

        /// <summary>
        /// Adiciona créditos de carbono a um projeto.
        /// </summary>
        /// <param name="id">ID do projeto.</param>
        /// <param name="userID">ID do utilizador autenticado.</param>
        /// <param name="NumberOfCredits">Número de créditos a serem adicionados ao projeto.</param>
        /// <returns>Retorna uma mensagem de sucesso com o número de créditos adicionados.</returns>
        [HttpPost("{id}/addCredits")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<IActionResult> AddCredits(int id, [FromHeader] int userID, [FromHeader] int NumberOfCredits)
        {
            var account = await _context.Account.FindAsync(userID);
            if (account == null)
            {
                return NotFound(new { message = "Account not found." });
            }

            // Authorization check for non-admin users
            if (account.Role != AccountType.Admin)
            {
                return Unauthorized(new { message = "Only admins can aprove projects" });
            }

            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound("Projeto não encontrado.");
            }

            project.CarbonCreditsGenerated = project.CarbonCreditsGenerated + NumberOfCredits;
            await _context.SaveChangesAsync();

            var carbonCredits = new List<CarbonCredit>();

            for (int i = 0; i < NumberOfCredits; i++)
            {
                var newCredit = new CarbonCredit
                {
                    ProjectId = project.Id,
                    IssueDate = DateTime.UtcNow,
                    ExpiryDate = DateTime.UtcNow.AddYears(5),
                    SerialNumber = Guid.NewGuid().ToString(),
                    Certification = project.Certification,
                    Price = (decimal)project.PricePerCredit,
                    IsSold = false,
                    Status = CreditStatus.Available
                };

                carbonCredits.Add(newCredit);
            }

            await _context.CarbonCredits.AddRangeAsync(carbonCredits);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Novos creditos adicionados ao projeto", creditsGenerated = NumberOfCredits });
        }

        /// <summary>
        /// Atualiza o status de um projeto.
        /// </summary>
        /// <param name="id">ID do projeto.</param>
        /// <param name="Authorization">Cabeçalho de autorização com token de autenticação.</param>
        /// <param name="userID">ID do utilizador autenticado.</param>
        /// <param name="newStatus">Novo status do projeto.</param>
        /// <returns>Retorna uma mensagem de sucesso ou erro, dependendo do resultado.</returns>
        // PUT: api/Projects/5/ChangeStatus
        [HttpPut("{id}/ChangeStatus")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<IActionResult> ChangeProjectStatus(int id, [FromHeader] int userID, [FromBody] int newStatus)
        {
            var account = await _context.Account.FindAsync(userID);
            if (account == null)
            {
                return NotFound(new { message = "Account not found." });
            }

            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound(new { message = "Project not found." });
            }

            // Authorization check for non-admin users
            if (account.Role != AccountType.Admin && project.OwnerId != userID)
            {
                return Unauthorized(new { message = "You are not authorized to change the status of this project." });
            }

            project.Status = (ProjectStatus)newStatus;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Project status updated successfully.", newStatus = project.Status });
        }

        /// <summary>
        /// Lista créditos de carbono para venda em um projeto específico.
        /// </summary>
        /// <param name="Authorization">Cabeçalho de autorização com token de autenticação.</param>
        /// <param name="userId">ID do utilizador autenticado.</param>
        /// <param name="projectId">ID do projeto.</param>
        /// <param name="credits">Número de créditos a serem listados para venda.</param>
        /// <returns>Retorna uma mensagem de sucesso ou erro, dependendo do resultado.</returns>
        [HttpPut("list-credits/{projectId}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<IActionResult> ListCredits(int projectId, int credits)
        {
            var project = await _context.Projects.FindAsync(projectId);

            if (project == null)
            {
                return NotFound();
            }

            var creditsAmount = _context.CarbonCredits
                .Where(c => c.ProjectId == projectId && c.IsSold == false).Count();

            if (creditsAmount < credits)
            {
                return BadRequest("Not enough credits to sell.");
            }

            project.CreditsForSale = credits;

            await _context.SaveChangesAsync();

            return Ok("Credits listed for sale.");
        }

        /// <summary>
        /// Vende créditos de carbono de um projeto para um utilizador específico.
        /// </summary>
        /// <param name="Authorization">Cabeçalho de autorização com token de autenticação.</param>
        /// <param name="userId">ID do utilizador autenticado.</param>
        /// <param name="projectId">ID do projeto.</param>
        /// <param name="credits">Número de créditos a serem vendidos.</param>
        /// <returns>Retorna uma mensagem de sucesso ou erro, dependendo do resultado.</returns>
        [HttpPut("sell-credits/{projectId}")]
        [ServiceFilter(typeof(TokenValidationFilter))]
        public async Task<IActionResult> SellCredits([FromHeader] int userID, int projectId, [FromBody] int credits)
        {
            var account = await _context.Account.FindAsync(userID);
            if (account == null)
            {
                return NotFound(new { message = "Account not found." });
            }

            var project = await _context.Projects.FindAsync(projectId);

            if (project == null)
            {
                return NotFound();
            }

            var creditsAmount = _context.CarbonCredits
                .Where(c => c.ProjectId == projectId && c.IsSold == false).Count();

            if (creditsAmount < credits)
            {
                return BadRequest("Not enough credits to sell.");
            }

            var creditsToSell = _context.CarbonCredits
                .Where(c => c.ProjectId == projectId && c.IsSold == false)
                .OrderBy(c => c.ExpiryDate)
                .Take(credits)
                .ToList();

            foreach (var credit in creditsToSell)
            {
                credit.IsSold = true;
                credit.BuyerId = account.Id;
            }

            project.CreditsForSale -= credits;

            await _context.SaveChangesAsync();

            return Ok("Credits sold successfully.");
        }


        public class UpdateCreditsInfoDto
        {
            public decimal PricePerCredit { get; set; }
            public int CreditsForSale { get; set; }
        }

        /// <summary>
        /// Atualiza as informações de créditos de carbono para um projeto, incluindo preço e quantidade de créditos disponíveis para venda.
        /// </summary>
        /// <param name="projectId">ID do projeto.</param>
        /// <param name="newInfo">Novo conjunto de informações sobre os créditos.</param>
        /// <returns>Retorna uma mensagem de sucesso ou erro, dependendo do resultado.</returns>
        [HttpPut("credits-info/{projectId}")]
        public async Task<IActionResult> UpdateCreditsInfo(int projectId, [FromBody] UpdateCreditsInfoDto newInfo)
        {
            var project = await _context.Projects.FindAsync(projectId);

            if (project == null)
            {
                return NotFound();
            }

            if (newInfo.PricePerCredit <= 0)
            {
                return BadRequest("Price per credit must be greater than 0.");
            }

            if (newInfo.CreditsForSale < 0)
            {
                return BadRequest("Credits for sale must be greater than or equal to 0.");
            }

            project.PricePerCredit = newInfo.PricePerCredit;
            project.CreditsForSale = newInfo.CreditsForSale;

            var credits = _context.CarbonCredits
                .Where(c => c.ProjectId == projectId && c.IsSold == false)
                .ToList();

            if (credits.Count < newInfo.CreditsForSale)
            {
                return BadRequest("Not enough credits to list for sale.");
            }

            foreach (var credit in credits)
            {
                credit.Price = newInfo.PricePerCredit;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Credits info updated successfully." });
        }
    }
}