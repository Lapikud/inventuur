using App.BLL.Contracts;
using App.BLL.DTO;
using App.DAL.Contracts;
using Base.BLL;
using Base.Contracts;
using Base.DAL.Contracts;

namespace App.BLL.Services;

public class AssetTagService : BaseService<App.BLL.DTO.AssetTag, App.DAL.DTO.AssetTag, App.DAL.Contracts.IAssetTagRepository>,
    IAssetTagService
{
    public AssetTagService(
        IAppUOW serviceUOW,
        IMapper<AssetTag, DAL.DTO.AssetTag> mapper) : base(serviceUOW, serviceUOW.AssetTagRepository, mapper)
    {
    }
}
