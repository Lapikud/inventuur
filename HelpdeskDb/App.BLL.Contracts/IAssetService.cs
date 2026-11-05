using App.BLL.DTO.ViewModels;
using App.DAL.Contracts;
using Base.BLL.Contracts;

namespace App.BLL.Contracts;

public interface IAssetService: IBaseService<App.BLL.DTO.Asset>
{
    Task<App.BLL.DTO.Asset> CreateNewAsset(string assetName, string comment, string? serialNumber = null, string? barcode = null, Guid? locationId = null);
    Task<List<AssetViewModel>> GetAvailableAssets();
    Task<List<AssetViewModel>> GetAssetsReservedByUser(Guid userId);
    Task<App.BLL.DTO.ViewModels.AssetViewModel?> GetAssetVmByAssetId(Guid assetId);
    Task<List<App.BLL.DTO.Asset>> GetAllNotRemovedAssets();

    /// <summary>Stamps the asset as confirmed-accurate right now. Returns null if the asset does not exist.</summary>
    Task<App.BLL.DTO.Asset?> AuditAssetAsync(Guid assetId, string userName);

    /// <summary>Loads an asset (and its tags) by its short QR-sticker slug.</summary>
    Task<App.BLL.DTO.Asset?> FindBySlugAsync(string slug);

    /// <summary>True when no other asset claims the slug. Null/empty slug is always free.</summary>
    Task<bool> IsSlugFreeAsync(string slug);
}