using App.DAL.DTO;
using Base.Contracts;

namespace App.DAL.EF.Mappers;

public class TagUOWMapper : IMapper<App.DAL.DTO.Tag, App.Domain.Tag>
{
    public App.DAL.DTO.Tag? Map(Domain.Tag? entity)
    {
        if (entity == null) return null;

        var res = new Tag()
        {
            Id = entity.Id,
            TagName = entity.TagName,
            AssetTags = entity.AssetTags?.Select(at => new AssetTag()
            {
                Id = at.Id,
                AssetId = at.AssetId,
                Asset = null,
                TagId = at.TagId,
                Tag = null,
            }).ToList(),
        };
        return res;
    }

    public Domain.Tag? Map(Tag? entity)
    {
        if (entity == null) return null;

        var res = new Domain.Tag()
        {
            Id = entity.Id,
            TagName = entity.TagName,
            AssetTags = entity.AssetTags?.Select(at => new Domain.AssetTag()
            {
                Id = at.Id,
                AssetId = at.AssetId,
                Asset = null,
                TagId = at.TagId,
                Tag = null,
            }).ToList(),
        };
        return res;
    }
}
