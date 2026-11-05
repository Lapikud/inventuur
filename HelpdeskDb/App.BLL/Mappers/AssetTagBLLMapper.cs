using App.DAL.DTO;
using Base.Contracts;

namespace App.BLL.Mappers;

public class AssetTagBLLMapper : IMapper<App.BLL.DTO.AssetTag, App.DAL.DTO.AssetTag>
{
    public App.DAL.DTO.AssetTag? Map(App.BLL.DTO.AssetTag? entity)
    {
        if (entity == null) return null;
        var res = new App.DAL.DTO.AssetTag()
        {
            Id = entity.Id,
            AssetId = entity.AssetId,
            Asset = null,
            TagId = entity.TagId,
            Tag = entity.Tag == null
                ? null
                : new App.DAL.DTO.Tag()
                {
                    Id = entity.Tag.Id,
                    TagName = entity.Tag.TagName,
                },
        };
        return res;
    }

    public App.BLL.DTO.AssetTag? Map(App.DAL.DTO.AssetTag? entity)
    {
        if (entity == null) return null;
        var res = new App.BLL.DTO.AssetTag()
        {
            Id = entity.Id,
            AssetId = entity.AssetId,
            Asset = null,
            TagId = entity.TagId,
            Tag = entity.Tag == null
                ? null
                : new App.BLL.DTO.Tag()
                {
                    Id = entity.Tag.Id,
                    TagName = entity.Tag.TagName,
                },
        };
        return res;
    }
}
