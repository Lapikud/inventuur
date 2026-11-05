using App.BLL.Contracts;
using App.BLL.DTO;
using App.DAL.Contracts;
using Base.BLL;
using Base.Contracts;
using Base.DAL.Contracts;

namespace App.BLL.Services;

public class AssetPhotoService : BaseService<App.BLL.DTO.AssetPhoto, App.DAL.DTO.AssetPhoto, App.DAL.Contracts.IAssetPhotoRepository>,
    IAssetPhotoService
{
    public AssetPhotoService(
        IAppUOW serviceUOW,
        IMapper<AssetPhoto, DAL.DTO.AssetPhoto> mapper) : base(serviceUOW, serviceUOW.AssetPhotoRepository, mapper)
    {
    }

    public async Task<App.BLL.DTO.AssetPhoto?> FindByAssetIdAsync(Guid assetId)
    {
        var photo = await ServiceRepository.FindByAssetIdAsync(assetId);
        return photo == null ? null : Mapper.Map(photo);
    }
}
