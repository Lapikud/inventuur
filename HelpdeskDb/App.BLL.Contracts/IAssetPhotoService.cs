using Base.BLL.Contracts;

namespace App.BLL.Contracts;

public interface IAssetPhotoService : IBaseService<App.BLL.DTO.AssetPhoto>
{
    Task<App.BLL.DTO.AssetPhoto?> FindByAssetIdAsync(Guid assetId);
}
