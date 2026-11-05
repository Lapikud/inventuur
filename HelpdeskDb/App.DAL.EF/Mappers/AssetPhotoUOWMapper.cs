using App.DAL.DTO;
using Base.Contracts;

namespace App.DAL.EF.Mappers;

public class AssetPhotoUOWMapper : IMapper<App.DAL.DTO.AssetPhoto, App.Domain.AssetPhoto>
{
    public App.DAL.DTO.AssetPhoto? Map(Domain.AssetPhoto? entity)
    {
        if (entity == null) return null;

        var res = new AssetPhoto()
        {
            Id = entity.Id,
            AssetId = entity.AssetId,
            Asset = null,
            Content = entity.Content,
            ContentType = entity.ContentType,
        };
        return res;
    }

    public Domain.AssetPhoto? Map(AssetPhoto? entity)
    {
        if (entity == null) return null;

        var res = new Domain.AssetPhoto()
        {
            Id = entity.Id,
            AssetId = entity.AssetId,
            Asset = null,
            Content = entity.Content,
            ContentType = entity.ContentType,
        };
        return res;
    }
}
