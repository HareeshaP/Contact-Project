using System.ComponentModel.DataAnnotations;

namespace Contactly.Models
{
    public class UpdateContactRequestDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "Phone must be 10 digits")]
        public string Phone { get; set; } = string.Empty;

        public bool Favorite { get; set; }
    }
}
