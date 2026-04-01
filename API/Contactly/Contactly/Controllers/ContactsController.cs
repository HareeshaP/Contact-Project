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
        public async Task<IActionResult> GetAllContacts()
        {
           var contacts =  await dbContext.Contacts
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
    }
}
