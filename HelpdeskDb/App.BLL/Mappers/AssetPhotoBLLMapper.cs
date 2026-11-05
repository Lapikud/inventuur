using App.DAL.DTO;
using Base.Contracts;

namespace App.BLL.Mappers;

public class AssetPhotoBLLMapper : IMapper<App.BLL.DTO.AssetPhoto, App.DAL.DTO.AssetPhoto>
{
    public App.DAL.DTO.AssetPhoto? Map(App.BLL.DTO.AssetPhoto? entity)
    {
        if (entity == null) return null;
        return new App.DAL.DTO.AssetPhoto()
        {
            Id = entity.Id,
            AssetId = entity.AssetId,
            Asset = null,
            Content = entity.Content,
            ContentType = entity.ContentType,
        };
    }

    public App.BLL.DTO.AssetPhoto? Map(App.DAL.DTO.AssetPhoto? entity)
    {
        if (entity == null) return null;
        return new App.BLL.DTO.AssetPhoto()
        {
            Id = entity.Id,
            AssetId = entity.AssetId,
            Asset = null,
            Content = entity.Content,
            ContentType = entity.ContentType,
        };
    }
}
