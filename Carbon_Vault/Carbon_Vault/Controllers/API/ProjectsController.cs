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

        // GET: api/Projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            return await _context.Projects
                .Include(p => p.Types)// Ensure project types are loaded
                .Include(p => p.CarbonCredits)   // Ensure carbon credits are loaded
                .ToListAsync();
        }

        [HttpGet("forSale")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsForSale()
        {
            return await _context.Projects
                .Where(p => p.IsForSale)
                .Include(p => p.Types)// Ensure project types are loaded
                .Include(p => p.CarbonCredits)   // Ensure carbon credits are loaded
                .ToListAsync();
        }

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

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectsFromUser(int userId)
        {
            var projects = await _context.Projects
                .Where(p => p.Owner.Id == userId)
                .Include(p => p.Types)
                .Include(p => p.CarbonCredits)
                .ToListAsync();

            if (projects == null || projects.Count == 0)
            {
                return NotFound(); // Return 404 if no projects are found
            }

            return Ok(projects); // Return 200 with the list of projects
        }

        // PUT: api/Projects/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProject(int id, Project project)
        {
            if (id != project.Id)
            {
                return BadRequest();
            }

            _context.Entry(project).State = EntityState.Modified;

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

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var ProjectLink = $"{_frontendBaseUrl}/project-manager/{project.Id}";

            var admins = await _context.Account
                             .Where(a => a.Role == AccountType.Admin) 
                             .ToListAsync();
            foreach (var admin in admins)
            {
                var adminEmail = admin.Email; 
               
                // Envio do e-mail para o administrador
                await _emailService.SendEmail(
                    adminEmail, 
                    "Nova Proposta de Projeto Enviada",
                    $"Um novo projeto foi enviado e aguarda validação. Projeto: {project.Name}, por {project.Owner.Name}<br> Pode aceder ao projeto <a href={ProjectLink}>aqui</a>",
                    null
                );
            }

            var userEmail = project.Owner.Email; 
            await _emailService.SendEmail(
                userEmail, 
                "Projeto Enviado para Validação",
                $"O seu projeto {project.Name} foi enviado para validação.Será notificado sobre a sua aprovação num periodo de 7-14 dias.<br> Pode aceder ao projeto <a href={ProjectLink}>aqui</a>",
                null
                );

            return CreatedAtAction("GetProject", new { id = project.Id }, project);
        }


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

        private bool ProjectExists(int id)
        {
            return _context.Projects.Any(e => e.Id == id);
        }

        [HttpGet("{id}/files")]
        public async Task<IActionResult> GetFiles(int id)
        {
            var files = await _context.ProjectFiles
                                      .Where(f => f.ProjectId == id)
                                      .ToListAsync();
            return Ok(files);
        }

        [HttpPost("{id}/upload")]
        public async Task<IActionResult> UploadFiles(int id, List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
                return BadRequest("No files uploaded.");

            var uploadedFiles = new List<ProjectFiles>();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var fileName = Path.GetFileName(file.FileName);
                var filePath = Path.Combine(_environment.WebRootPath, "files", fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var projectFile = new ProjectFiles
                {
                    FileName = fileName,
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

        [HttpPost("{id}/uploadImage")]
        public async Task<IActionResult> UploadFile(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var allowedExtensions = new[] { ".png", ".jpg" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest("Only .png and .jpg files are allowed.");

            var fileName = Path.GetFileName(file.FileName);
            var filePath = Path.Combine(_environment.WebRootPath, "files", fileName);

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


        [HttpDelete("{projectId}/files/{fileId}")]
        public async Task<IActionResult> DeleteFile(int projectId, int fileId, [FromHeader] string Authorization, [FromHeader] int userID)
        {
            Console.WriteLine(userID);
            if (!AuthHelper.IsTokenValid(Authorization, userID))
            {
                return Unauthorized();
            }

           
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

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveProject(int id, [FromHeader] string Authorization, [FromHeader] int userID, [FromHeader] int CreditsGenerated)
        {
            Console.WriteLine($"Received creditsGenerated: {CreditsGenerated}");

            if (!AuthHelper.IsTokenValid(Authorization, userID))
            {
                return Unauthorized();
            }
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
        [HttpPost("{id}/addCredits")]
        public async Task<IActionResult> AddCredits(int id, [FromHeader] string Authorization, [FromHeader] int userID, [FromHeader] int NumberOfCredits)
        {
            

            if (!AuthHelper.IsTokenValid(Authorization, userID))
            {
                return Unauthorized();
            }
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



        [HttpPut("list-credits/{projectId}")]
        public async Task<IActionResult> SellCredits([FromHeader] string Authorization, [FromHeader] int userId, int projectId, int credits)
        {
            if (!AuthHelper.IsTokenValid(Authorization, userId))
            {
                return Unauthorized();
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

            project.CreditsForSale = credits;

            await _context.SaveChangesAsync();

            return Ok("Credits listed for sale.");
        }

        [HttpPut("sell-credits/{projectId}")]
        public async Task<IActionResult> SellCredits([FromHeader] string Authorization, int userId, int projectId, int credits, int buyerId)
        {
            if (!AuthHelper.IsTokenValid(Authorization, userId))
            {
                return Unauthorized();
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
                //credit.Buyer = buyerId;
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

    [HttpPut("credits-info/{projectId}")]
    public async Task<IActionResult> UpdateCreditsInfo(int projectId, [FromBody] UpdateCreditsInfoDto newInfo)
        {
            var project = await _context.Projects.FindAsync(projectId);

            if (project == null)
            {
                return NotFound();
            }

            project.PricePerCredit = newInfo.PricePerCredit;
            project.CreditsForSale = newInfo.CreditsForSale;

            var credits = _context.CarbonCredits
                .Where(c => c.ProjectId == projectId && c.IsSold == false)
                .ToList();

            foreach (var credit in credits)
            {
                credit.Price = newInfo.PricePerCredit;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Credits info updated successfully." });
        }
    }
}
