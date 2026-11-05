using System.ComponentModel.DataAnnotations;
using Base.Domain;
using Base.Resources.Errors;

namespace App.Domain;

public class Asset : BaseEntity
{
    [MaxLength(128,
        ErrorMessageResourceName = nameof(Base.Resources.Errors.ValidationErrors.MaxLengthValidationError),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    [MinLength(2,
        ErrorMessageResourceName = nameof(Base.Resources.Errors.ValidationErrors.MinLenghtValidationError),
        ErrorMessageResourceType = typeof(Base.Resources.Errors.ValidationErrors))]
    public string AssetName { get; set; } = default!;

    [MaxLength(255,
        ErrorMessageResourceName = nameof(ValidationErrors.MaxLengthValidationError),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    [MinLength(2,
        ErrorMessageResourceName = nameof(ValidationErrors.MinLenghtValidationError),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    public string Comment { get; set; } = default!;

    [MaxLength(255,
        ErrorMessageResourceName = nameof(ValidationErrors.MaxLengthValidationError),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    [Display(Name = nameof(App.Resources.Domain.Asset.SerialNumber),
        ResourceType = typeof(App.Resources.Domain.Asset))]
    public string? SerialNumber { get; set; }

    [MaxLength(255,
        ErrorMessageResourceName = nameof(ValidationErrors.MaxLengthValidationError),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    [Display(Name = nameof(App.Resources.Domain.Asset.Barcode),
        ResourceType = typeof(App.Resources.Domain.Asset))]
    public string? Barcode { get; set; }

    // Short unique code printed on the QR sticker, e.g. inv.ee/a/xy4t2.
    [MaxLength(16,
        ErrorMessageResourceName = nameof(ValidationErrors.MaxLengthValidationError),
        ErrorMessageResourceType = typeof(ValidationErrors))]
    public string? Slug { get; set; }

    public AssetVisibility Visibility { get; set; } = AssetVisibility.Normal;

    public bool HasPhoto { get; set; }

    public DateTime? LastAuditAt { get; set; }

    [MaxLength(64)]
    public string? LastAuditBy { get; set; }

    /// <summary>
    /// Where the asset physically is — a direct foreign key, no junction
    /// table: the room/cupboard names resolve through the join at query time.
    /// Nullable until the asset gets placed.
    /// </summary>
    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    public ICollection<OwnerAssets>? OwnerAssets { get; set; }
    public ICollection<CategoryAssets>? CategoryAssetsCollection { get; set; }
    public ICollection<RemovedAssets>? RemovedAssetsCollection { get; set; }
    public ICollection<AssetReservation>? AssetReservations { get; set; }
    public ICollection<AssetTag>? AssetTags { get; set; }
    public AssetPhoto? AssetPhoto { get; set; }
}