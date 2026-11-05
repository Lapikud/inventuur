using Base.DAL.Contracts;

namespace App.DAL.Contracts;

public interface IAssetPhotoRepository : IBaseRepository<App.DAL.DTO.AssetPhoto>
{
    Task<App.DAL.DTO.AssetPhoto?> FindByAssetIdAsync(Guid assetId);
}
