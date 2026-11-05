using App.Domain;

namespace App.DTO.v1.ViewModels;

/// <summary>
/// Lean listing row served anonymously — the public main-page table.
/// Deliberately excludes location, ownership and comment; see
/// <see cref="PublicAssetViewModel"/> for the detail-level contract.
/// </summary>
public class PublicAssetSummaryViewModel
{
    public Guid Id { get; set; }

    public string Slug { get; set; } = default!;

    public string AssetName { get; set; } = default!;

    public string CategoryName { get; set; } = default!;

    public List<string> Tags { get; set; } = [];

    public bool HasPhoto { get; set; }

    /// <summary>Someone currently has the asset — the holder's name is never public.</summary>
    public bool InUse { get; set; }

    public AssetVisibility Visibility { get; set; } = AssetVisibility.Normal;
}
