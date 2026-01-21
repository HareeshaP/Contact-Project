using System.ComponentModel.DataAnnotations;

namespace Contactly.Models
{
    public class AddContactRequestDTO
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        [Phone]
        public required string Phone { get; set; }
        public bool Favorite { get; set; }
    }
}
