using System.ComponentModel.DataAnnotations;
using Base.Contracts;
using Base.Resources.Errors;

namespace App.BLL.DTO;

public class Cupboard : IDomainId
{
    public Guid Id { get; set; }

    [MaxLength(128,
        ErrorMessageResourceName = nameof(ValidationErrors.MaxLengthValidationError),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    [MinLength(2,
        ErrorMessageResourceName = nameof(ValidationErrors.MinLenghtValidationError),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    public string CodeName { get; set; } = default!;

    public Guid RoomId { get; set; }
    public Room? Room { get; set; }

    public ICollection<Location>? Locations { get; set; }
}
