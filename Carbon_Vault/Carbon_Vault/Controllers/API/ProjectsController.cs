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

namespace Carbon_Vault.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly Carbon_VaultContext _context;
        private readonly IWebHostEnvironment _environment;
        public ProjectsController(Carbon_VaultContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;

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

        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetAccount(int id)
        {
            var project = await _context.Projects.FindAsync(id);

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
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

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
        public async Task<IActionResult> UploadFile(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var fileName = Path.GetFileName(file.FileName);
            var filePath = Path.Combine(_environment.WebRootPath, "files", fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var projectFile = new ProjectFiles
            {
                FileName = fileName,
                FilePath = $"/files/{fileName}",
                FileType = Path.GetExtension(fileName).TrimStart('.'),
                UploadedAt = DateTime.Now,
                ProjectId = id
            };

            _context.ProjectFiles.Add(projectFile);
            await _context.SaveChangesAsync();

            return Ok(projectFile);
        }

        [HttpDelete("files/{fileId}")]
        public async Task<IActionResult> DeleteFile(int fileId)
        {
            var file = await _context.ProjectFiles.FindAsync(fileId);
            if (file == null) return NotFound();

            var filePath = Path.Combine(_environment.WebRootPath, "files", file.FileName);
            if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);

            _context.ProjectFiles.Remove(file);
            await _context.SaveChangesAsync();

            return Ok("File deleted successfully.");
        }

    }
}
