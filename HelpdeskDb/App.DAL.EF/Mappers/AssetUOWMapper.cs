using App.DAL.DTO;
using Base.Contracts;

namespace App.DAL.EF.Mappers;

public class AssetUOWMapper : IMapper<App.DAL.DTO.Asset, App.Domain.Asset>
{
    public Asset? Map(Domain.Asset? entity)
    {
        if (entity == null) return null;

        var res = new Asset()
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
            LocationId = entity.LocationId,
            Location = entity.Location == null
                ? null
                : new Location()
                {
                    Id = entity.Location.Id,
                    LocationName = entity.Location.LocationName,
                    ShelfNum = entity.Location.ShelfNum,
                    Column = entity.Location.Column,
                    RoomId = entity.Location.RoomId,
                    Room = null,
                    CupboardId = entity.Location.CupboardId,
                    Cupboard = null,
                },
            OwnerAssets = entity.OwnerAssets?.Select(oa => new OwnerAssets()
            {
                Id = oa.Id,
                AssetId = oa.AssetId,
                Asset = null, // la.Asset,
                
                OwnerId = oa.OwnerId,
                Owner = null,
                CreatedBy = oa.CreatedBy
            }).ToList(),
            CategoryAssetsCollection = entity.CategoryAssetsCollection?.Select(ca => new CategoryAssets()
            {
                Id = ca.Id,
                AssetId = ca.AssetId,
                Asset = null, // la.Asset,
                
                CategoryId = ca.CategoryId,
                Category = null,
                
                CreatedBy = ca.CreatedBy,
            }).ToList(),
            RemovedAssetsCollection = entity.RemovedAssetsCollection?.Select(ra => new RemovedAssets()
            {
                Id = ra.Id,
                AssetId = ra.AssetId,
                Asset = null, // la.Asset,
                Comment = ra.Comment,
            }).ToList(),
            AssetReservations = entity.AssetReservations?.Select(ar => new AssetReservation()
            {
                Id = ar.Id,
                AssetId = ar.AssetId,
                Asset = null, // la.Asset,
                
                UserId = ar.UserId,
                User = null,
                ReservationFrom = ar.ReservationFrom,
                ReservationTo = ar.ReservationTo,
                IsReturned = ar.IsReturned,
            }).ToList(),
            AssetTags = entity.AssetTags?.Select(at => new AssetTag()
            {
                Id = at.Id,
                AssetId = at.AssetId,
                Asset = null,
                TagId = at.TagId,
                Tag = at.Tag == null ? null : new Tag()
                {
                    Id = at.Tag.Id,
                    TagName = at.Tag.TagName,
                },
            }).ToList(),
        };
        return res;
    }

    public Domain.Asset? Map(Asset? entity)
    {
        if (entity == null) return null;

        var res = new Domain.Asset()
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
            LocationId = entity.LocationId,
            Location = entity.Location == null
                ? null
                : new Domain.Location()
                {
                    Id = entity.Location.Id,
                    LocationName = entity.Location.LocationName,
                    ShelfNum = entity.Location.ShelfNum,
                    Column = entity.Location.Column,
                    RoomId = entity.Location.RoomId,
                    Room = null,
                    CupboardId = entity.Location.CupboardId,
                    Cupboard = null,
                },
            OwnerAssets = entity.OwnerAssets?.Select(oa => new Domain.OwnerAssets()
            {
                Id = oa.Id,
                AssetId = oa.AssetId,
                Asset = null, // la.Asset,
                
                OwnerId = oa.OwnerId,
                Owner = null,
                CreatedBy = oa.CreatedBy
            }).ToList(),
            CategoryAssetsCollection = entity.CategoryAssetsCollection?.Select(ca => new Domain.CategoryAssets()
            {
                Id = ca.Id,
                AssetId = ca.AssetId,
                Asset = null, // la.Asset,
                
                CategoryId = ca.CategoryId,
                Category = null,
                
                CreatedBy = ca.CreatedBy,
            }).ToList(),
            RemovedAssetsCollection = entity.RemovedAssetsCollection?.Select(ra => new Domain.RemovedAssets()
            {
                Id = ra.Id,
                AssetId = ra.AssetId,
                Asset = null, // la.Asset,
                Comment = ra.Comment,
            }).ToList(),
            AssetReservations = entity.AssetReservations?.Select(ar => new Domain.AssetReservation()
            {
                Id = ar.Id,
                AssetId = ar.AssetId,
                Asset = null, // la.Asset,
                
                UserId = ar.UserId,
                User = null,
                ReservationFrom = ar.ReservationFrom,
                ReservationTo = ar.ReservationTo,
                IsReturned = ar.IsReturned,
            }).ToList(),
            AssetTags = entity.AssetTags?.Select(at => new Domain.AssetTag()
            {
                Id = at.Id,
                AssetId = at.AssetId,
                Asset = null,
                TagId = at.TagId,
                Tag = at.Tag == null ? null : new Domain.Tag()
                {
                    Id = at.Tag.Id,
                    TagName = at.Tag.TagName,
                },
            }).ToList(),
        };
        return res;
    }
}