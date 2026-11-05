using Base.Domain;

namespace App.Domain;

/// <summary>
/// Normalized many-to-many between assets and tags. The unique index on
/// (AssetId, TagId) is configured in AppDbContext.
/// </summary>
public class AssetTag : BaseEntity
{
    public Guid AssetId { get; set; }

    public Asset? Asset { get; set; }

    public Guid TagId { get; set; }

    public Tag? Tag { get; set; }
}
