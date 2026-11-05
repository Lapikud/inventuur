using System.ComponentModel.DataAnnotations;
using Base.Domain;
using Base.Resources.Errors;

namespace App.Domain;

public class Location : BaseEntity
{
    [MaxLength(128,
        ErrorMessageResourceName = nameof(Base.Resources.Errors.ValidationErrors.MaxLengthValidationError),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    [MinLength(2,
        ErrorMessageResourceName = nameof(Base.Resources.Errors.ValidationErrors.MinLenghtValidationError),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    public string LocationName { get; set; } = default!;


    [Range(1, 5,
        ErrorMessageResourceName = nameof(Base.Resources.Errors.ValidationErrors.ValueBetween),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    public int ShelfNum { get; set; }


    [Range(1, 5,
        ErrorMessageResourceName = nameof(Base.Resources.Errors.ValidationErrors.ValueBetween),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    public int Column { get; set; }

    /// <summary>
    /// The room this location is in — required, so room-level spots like
    /// "Ladu — vaba pind" exist without any cupboard.
    /// </summary>
    public Guid RoomId { get; set; }
    public Room? Room { get; set; }

    /// <summary>
    /// Optional cupboard within the room: a cabinet position has one ("Kapp
    /// 3x2"), an open spot does not. Kept consistent with RoomId by the app
    /// (an app-level check, since Postgres can't express it as one FK).
    /// </summary>
    public Guid? CupboardId { get; set; }
    public Cupboard? Cupboard { get; set; }
}
