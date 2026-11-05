
using App.DAL.DTO.ViewModels;
using Base.DAL.Contracts;

namespace App.DAL.Contracts;

public interface IAssetRepository: IBaseRepository<App.DAL.DTO.Asset>
{
    Task<App.DAL.DTO.Asset> CreateNewAsset(string assetName, string comment, string? serialNumber = null, string? barcode = null, Guid? locationId = null);
    Task<List<AssetViewModel>> GetAvailableAssets();
    Task<List<AssetViewModel>> GetAssetsReservedByUser(Guid userId);
    Task<App.DAL.DTO.ViewModels.AssetViewModel?> GetAssetVmByAssetId(Guid assetId);
    Task<List<App.DAL.DTO.Asset>> GetAllNotRemovedAssets();

    /// <summary>Stamps the asset as confirmed-accurate right now, by the given username.</summary>
    Task<App.DAL.DTO.Asset?> AuditAssetAsync(Guid assetId, string userName);

    /// <summary>Loads an asset (and its tags) by its short QR-sticker slug.</summary>
    Task<App.DAL.DTO.Asset?> FindBySlugAsync(string slug);

    /// <summary>True when no other asset claims the slug. Null/empty slug is always free.</summary>
    Task<bool> IsSlugFreeAsync(string slug);
}