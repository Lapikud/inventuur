using App.DAL.DTO;
using Base.Contracts;

namespace App.BLL.Mappers;

public class TagBLLMapper : IMapper<App.BLL.DTO.Tag, App.DAL.DTO.Tag>
{
    public App.DAL.DTO.Tag? Map(App.BLL.DTO.Tag? entity)
    {
        if (entity == null) return null;
        var res = new App.DAL.DTO.Tag()
        {
            Id = entity.Id,
            TagName = entity.TagName,
            AssetTags = entity.AssetTags?.Select(at => new App.DAL.DTO.AssetTag()
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

    public App.BLL.DTO.Tag? Map(App.DAL.DTO.Tag? entity)
    {
        if (entity == null) return null;
        var res = new App.BLL.DTO.Tag()
        {
            Id = entity.Id,
            TagName = entity.TagName,
            AssetTags = entity.AssetTags?.Select(at => new App.BLL.DTO.AssetTag()
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
