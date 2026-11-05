using Base.Contracts;

namespace App.DTO.v1.Mappers;

public class AssetTagMapper : IMapper<App.DTO.v1.AssetTag, App.BLL.DTO.AssetTag>
{
    public App.DTO.v1.AssetTag? Map(App.BLL.DTO.AssetTag? entity)
    {
        if (entity == null) return null;

        return new App.DTO.v1.AssetTag()
        {
            Id = entity.Id,
            AssetId = entity.AssetId,
            TagId = entity.TagId,
        };
    }

    public App.BLL.DTO.AssetTag? Map(App.DTO.v1.AssetTag? entity)
    {
        if (entity == null) return null;

        return new App.BLL.DTO.AssetTag()
        {
            Id = entity.Id,
            AssetId = entity.AssetId,
            TagId = entity.TagId,
        };
    }

    public App.BLL.DTO.AssetTag Map(App.DTO.v1.CreateObjects.AssetTagCreate entity)
    {
        return new App.BLL.DTO.AssetTag()
        {
            Id = Guid.NewGuid(),
            AssetId = entity.AssetId,
            TagId = entity.TagId,
        };
    }
}
