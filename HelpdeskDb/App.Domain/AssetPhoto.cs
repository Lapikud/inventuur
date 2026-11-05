using System.ComponentModel.DataAnnotations;
using Base.Domain;

namespace App.Domain;

/// <summary>
/// One-to-one photo side table. Kept off the Asset row so listing queries
/// never drag image bytes through memory; the raw JPEG is served only by
/// GET api/v1/assets/{id}/photo.
/// </summary>
public class AssetPhoto : BaseEntity
{
    public Guid AssetId { get; set; }

    public Asset? Asset { get; set; }

    public byte[] Content { get; set; } = [];

    [MaxLength(64)]
    public string ContentType { get; set; } = "image/jpeg";
}
