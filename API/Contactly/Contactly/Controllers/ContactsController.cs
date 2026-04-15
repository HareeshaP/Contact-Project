using Contactly.Data;
using Contactly.Models;
using Contactly.Models.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Contactly.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactsController : ControllerBase
    {
        private readonly ContactlyDbContext dbContext;
        public ContactsController(ContactlyDbContext dbContext)
        {
            this.dbContext = dbContext;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllContacts([FromQuery] string? search)
        {
            var query = dbContext.Contacts.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(c => c.Name.Contains(search) ||
                                         (c.Email != null && c.Email.ToLower().Contains(search)) ||
                                         c.Phone.Contains(search));
            }
            var contacts =  await query
                .OrderByDescending(c => c.Favorite)
                .ThenBy(c => c.Name)
                .Select(c => new ContactDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Email = c.Email,
                    Phone = c.Phone,
                    Favorite = c.Favorite
                })
                .ToListAsync();
            return Ok(contacts);
        }

        [HttpPost]
        public async Task<IActionResult> AddContact([FromBody] AddContactRequestDTO request)
        {
            var domainModelContact = new Contact
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Favorite = request.Favorite
            };
            await dbContext.Contacts.AddAsync(domainModelContact);
            await dbContext.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetAllContacts),
                new { id = domainModelContact.Id},
                domainModelContact);
        }

        [HttpDelete]
        [Route("{id:guid}")]
        public async Task<IActionResult> DeleteContact(Guid id)
        {
            var contact = await dbContext.Contacts.FindAsync(id);

            if(contact == null)
            {
                return NotFound();
            }

            dbContext.Contacts.Remove(contact);
            await dbContext.SaveChangesAsync();
            return NoContent();  // 204 - correct REST Response
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContact(Guid id, UpdateContactDto dto)
        {
            var contact = await dbContext.Contacts.FindAsync(id);

            if (contact == null)
                return NotFound();

            contact.Name = dto.Name;
            contact.Email = dto.Email;
            contact.Phone = dto.Phone;

            await dbContext.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:guid}/favorite")]
        public async Task<IActionResult> ToggleFavorite(Guid id)
        {
            var contact = await dbContext.Contacts.FindAsync(id);

            if (contact == null)
                return NotFound();

            contact.Favorite = !contact.Favorite;
            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                contact.Id,
                contact.Favorite
            });
        }
    }
}
