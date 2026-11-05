using System.ComponentModel.DataAnnotations;
using Base.Domain;
using Base.Resources.Errors;

namespace App.Domain;

public class Cupboard : BaseEntity
{
    [MaxLength(128,
        ErrorMessageResourceName = nameof(ValidationErrors.MaxLengthValidationError),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    [MinLength(2,
        ErrorMessageResourceName = nameof(ValidationErrors.MinLenghtValidationError),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    public string CodeName { get; set; } = default!;

    /// <summary>
    /// The room this cupboard stands in — a direct foreign key, no junction
    /// table: a cupboard lives in exactly one room.
    /// </summary>
    public Guid RoomId { get; set; }
    public Room? Room { get; set; }

    public ICollection<Location>? Locations { get; set; }
}
