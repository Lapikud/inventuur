using Base.Contracts;

namespace App.DTO.v1.Mappers;

public class AssetMapper: IMapper<App.DTO.v1.Asset, App.BLL.DTO.Asset>
{
    public App.DTO.v1.Asset? Map(BLL.DTO.Asset? entity)
    {
        if (entity == null) return null;

        var res = new App.DTO.v1.Asset()
        {
            Id = entity.Id,
            AssetName = entity.AssetName,
            Comment = entity.Comment,
            SerialNumber = entity.SerialNumber,
            Barcode = entity.Barcode,
            Slug = entity.Slug,
            Visibility = entity.Visibility,
            HasPhoto = entity.HasPhoto,
            LastAuditAt = entity.LastAuditAt,
            LastAuditBy = entity.LastAuditBy,
        };
        return res;
    }

    public BLL.DTO.Asset? Map(App.DTO.v1.Asset? entity)
    {
        if (entity == null) return null;

        var res = new App.BLL.DTO.Asset()
        {
            Id = entity.Id,
            AssetName = entity.AssetName,
            Comment = entity.Comment,
            SerialNumber = entity.SerialNumber,
            Barcode = entity.Barcode,
            Slug = entity.Slug,
            Visibility = entity.Visibility,
        };
        return res;
    }

    public BLL.DTO.Asset Map(App.DTO.v1.CreateObjects.AssetCreate entity)
    {

        var res = new App.BLL.DTO.Asset()
        {
            Id = Guid.NewGuid(),
            AssetName = entity.AssetName,
            Comment = entity.Comment,
            SerialNumber = entity.SerialNumber,
            Barcode = entity.Barcode,
            Slug = entity.Slug,
            Visibility = entity.Visibility,
        };
        return res;
    }
}