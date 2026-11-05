using App.DAL.DTO;
using Base.Contracts;

namespace App.DAL.EF.Mappers;

public class AssetTagUOWMapper : IMapper<App.DAL.DTO.AssetTag, App.Domain.AssetTag>
{
    public App.DAL.DTO.AssetTag? Map(Domain.AssetTag? entity)
    {
        if (entity == null) return null;

        var res = new AssetTag()
        {
            Id = entity.Id,
            AssetId = entity.AssetId,
            Asset = null,
            TagId = entity.TagId,
            Tag = entity.Tag == null
                ? null
                : new Tag()
                {
                    Id = entity.Tag.Id,
                    TagName = entity.Tag.TagName,
                },
        };
        return res;
    }

    public Domain.AssetTag? Map(AssetTag? entity)
    {
        if (entity == null) return null;

        var res = new Domain.AssetTag()
        {
            Id = entity.Id,
            AssetId = entity.AssetId,
            Asset = null,
            TagId = entity.TagId,
            Tag = entity.Tag == null
                ? null
                : new Domain.Tag()
                {
                    Id = entity.Tag.Id,
                    TagName = entity.Tag.TagName,
                },
        };
        return res;
    }
}
