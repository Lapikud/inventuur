using App.Domain;

namespace App.DTO.v1.ViewModels;

/// <summary>
/// Safe subset of the asset view model served anonymously by slug from a
/// QR sticker scan. Location, ownership and comment are members-only: they
/// are null unless the request carries a valid session (the endpoint is
/// AllowAnonymous, but a valid cookie still authenticates it — the payload
/// is filled accordingly). The reservation holder's name is never public.
/// </summary>
public class PublicAssetViewModel
{
    public Guid Id { get; set; }

    public string Slug { get; set; } = default!;

    public string AssetName { get; set; } = default!;

    public string? SerialNumber { get; set; }

    public string CategoryName { get; set; } = default!;

    /// <summary>Room name; null for anonymous visitors (needs login).</summary>
    public string? RoomName { get; set; }

    /// <summary>Cupboard name; null for anonymous visitors (needs login).</summary>
    public string? CupboardName { get; set; }

    /// <summary>Shelf; null for anonymous visitors (needs login).</summary>
    public int? ShelfNum { get; set; }

    /// <summary>Column; null for anonymous visitors (needs login).</summary>
    public int? Column { get; set; }

    /// <summary>Free-text comment; null for anonymous visitors (needs login).</summary>
    public string? Comment { get; set; }

    public List<string> Tags { get; set; } = [];

    public bool HasPhoto { get; set; }

    /// <summary>Someone currently has the asset — the holder's name is never public.</summary>
    public bool InUse { get; set; }

    public DateTime? LastAuditAt { get; set; }

    public AssetVisibility Visibility { get; set; } = AssetVisibility.Normal;
}
