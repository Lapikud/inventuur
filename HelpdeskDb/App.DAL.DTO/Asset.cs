using Base.Contracts;

namespace App.DAL.DTO;

public class Asset: IDomainId
{
    public Guid Id { get; set; }

    public string AssetName { get; set; } = default!;

    public string Comment { get; set; } = default!;

    public string? SerialNumber { get; set; }

    public string? Barcode { get; set; }

    public string? Slug { get; set; }

    public Domain.AssetVisibility Visibility { get; set; } = Domain.AssetVisibility.Normal;

    public bool HasPhoto { get; set; }

    public DateTime? LastAuditAt { get; set; }

    public string? LastAuditBy { get; set; }

    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    public ICollection<OwnerAssets>? OwnerAssets { get; set; }
    public ICollection<CategoryAssets>? CategoryAssetsCollection { get; set; }
    public ICollection<RemovedAssets>? RemovedAssetsCollection { get; set; }
    public ICollection<AssetReservation>? AssetReservations { get; set; }
    public ICollection<AssetTag>? AssetTags { get; set; }
    public AssetPhoto? AssetPhoto { get; set; }
}
