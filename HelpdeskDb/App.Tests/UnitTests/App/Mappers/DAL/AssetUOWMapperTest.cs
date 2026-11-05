using App.DAL.EF.Mappers;
using DalDto = App.DAL.DTO;

namespace App.Tests.UnitTests.App.Mappers.DAL;

public class AssetUOWMapperTest
{
    private readonly AssetUOWMapper _mapper = new();

    [Fact]
    public void Map_DomainToDal_NullReturnsNull() => Assert.Null(_mapper.Map((Domain.Asset?)null));

    [Fact]
    public void Map_DalToDomain_NullReturnsNull() => Assert.Null(_mapper.Map((DalDto.Asset?)null));

    [Fact]
    public void Map_DomainToDal_ShouldCopyScalarsAndCollections()
    {
        var assetId = Guid.NewGuid();
        var locationId = Guid.NewGuid();
        var src = new Domain.Asset
        {
            Id = assetId,
            AssetName = "Laptop",
            Comment = "comment",
            SerialNumber = "SN-111222333",
            Barcode = "BC-999999999",
            LocationId = locationId,
            Location = new Domain.Location
            {
                Id = locationId,
                LocationName = "Shelf",
                ShelfNum = 2,
                Column = 3,
                RoomId = Guid.NewGuid(),
                CupboardId = Guid.NewGuid(),
            },
            OwnerAssets = new List<Domain.OwnerAssets>
            {
                new() { Id = Guid.NewGuid(), AssetId = assetId, OwnerId = Guid.NewGuid(), CreatedBy = "user" }
            },
            CategoryAssetsCollection = new List<Domain.CategoryAssets>
            {
                new() { Id = Guid.NewGuid(), AssetId = assetId, CategoryId = Guid.NewGuid(), CreatedBy = "user" }
            },
            RemovedAssetsCollection = new List<Domain.RemovedAssets>
            {
                new() { Id = Guid.NewGuid(), AssetId = assetId, Comment = "comment" }
            },
            AssetReservations = new List<Domain.AssetReservation>
            {
                new() { Id = Guid.NewGuid(), AssetId = assetId, UserId = Guid.NewGuid(),
                    ReservationFrom = DateTime.UtcNow, ReservationTo = DateTime.UtcNow.AddHours(1), IsReturned = false }
            },
        };

        var dst = _mapper.Map(src);

        Assert.NotNull(dst);
        Assert.Equal(src.Id, dst!.Id);
        Assert.Equal(src.AssetName, dst.AssetName);
        Assert.Equal(src.Comment, dst.Comment);
        Assert.Equal(src.SerialNumber, dst.SerialNumber);
        Assert.Equal(src.Barcode, dst.Barcode);
        Assert.Equal(src.LocationId, dst.LocationId);
        Assert.NotNull(dst.Location);
        Assert.Equal(src.Location!.Id, dst.Location!.Id);
        Assert.Equal(src.Location!.LocationName, dst.Location!.LocationName);
        Assert.Equal(src.Location!.ShelfNum, dst.Location!.ShelfNum);
        Assert.Equal(src.Location!.Column, dst.Location!.Column);
        Assert.Equal(src.Location!.RoomId, dst.Location!.RoomId);
        Assert.Equal(src.Location!.CupboardId, dst.Location!.CupboardId);
        Assert.Null(dst.Location!.Room);
        Assert.Null(dst.Location!.Cupboard);
        Assert.Single(dst.OwnerAssets!);
        Assert.Single(dst.CategoryAssetsCollection!);
        Assert.Single(dst.RemovedAssetsCollection!);
        Assert.Single(dst.AssetReservations!);
        Assert.All(dst.OwnerAssets!, oa => Assert.Null(oa.Asset));
        Assert.All(dst.OwnerAssets!, oa => Assert.Null(oa.Owner));
        Assert.All(dst.CategoryAssetsCollection!, ca => Assert.Null(ca.Asset));
        Assert.All(dst.CategoryAssetsCollection!, ca => Assert.Null(ca.Category));
        Assert.All(dst.RemovedAssetsCollection!, ra => Assert.Null(ra.Asset));
        Assert.All(dst.AssetReservations!, ar => Assert.Null(ar.Asset));
        Assert.All(dst.AssetReservations!, ar => Assert.Null(ar.User));
    }

    [Fact]
    public void Map_DalToDomain_ShouldCopyScalarsAndCollections()
    {
        var assetId = Guid.NewGuid();
        var locationId = Guid.NewGuid();
        var src = new DalDto.Asset
        {
            Id = assetId,
            AssetName = "Laptop",
            Comment = "comment",
            SerialNumber = "SN-111222333",
            Barcode = "BC-999999999",
            LocationId = locationId,
            Location = new DalDto.Location
            {
                Id = locationId,
                LocationName = "Shelf",
                ShelfNum = 2,
                Column = 3,
                RoomId = Guid.NewGuid(),
                CupboardId = Guid.NewGuid(),
            },
            OwnerAssets = new List<DalDto.OwnerAssets>
            {
                new() { Id = Guid.NewGuid(), AssetId = assetId, OwnerId = Guid.NewGuid(), CreatedBy = "u" }
            },
            CategoryAssetsCollection = new List<DalDto.CategoryAssets>
            {
                new() { Id = Guid.NewGuid(), AssetId = assetId, CategoryId = Guid.NewGuid(), CreatedBy = "u" }
            },
            RemovedAssetsCollection = new List<DalDto.RemovedAssets>
            {
                new() { Id = Guid.NewGuid(), AssetId = assetId, Comment = "rm" }
            },
            AssetReservations = new List<DalDto.AssetReservation>
            {
                new() { Id = Guid.NewGuid(), AssetId = assetId, UserId = Guid.NewGuid(),
                    ReservationFrom = DateTime.UtcNow, ReservationTo = DateTime.UtcNow.AddHours(1), IsReturned = true }
            },
        };

        var dst = _mapper.Map(src);

        Assert.NotNull(dst);
        Assert.Equal(src.Id, dst!.Id);
        Assert.Equal(src.AssetName, dst.AssetName);
        Assert.Equal(src.Comment, dst.Comment);
        Assert.Equal(src.SerialNumber, dst.SerialNumber);
        Assert.Equal(src.Barcode, dst.Barcode);
        Assert.Equal(src.LocationId, dst.LocationId);
        Assert.NotNull(dst.Location);
        Assert.Equal(src.Location!.Id, dst.Location!.Id);
        Assert.Equal(src.Location!.LocationName, dst.Location!.LocationName);
        Assert.Equal(src.Location!.ShelfNum, dst.Location!.ShelfNum);
        Assert.Equal(src.Location!.Column, dst.Location!.Column);
        Assert.Equal(src.Location!.RoomId, dst.Location!.RoomId);
        Assert.Equal(src.Location!.CupboardId, dst.Location!.CupboardId);
        Assert.Null(dst.Location!.Room);
        Assert.Null(dst.Location!.Cupboard);
        Assert.Single(dst.OwnerAssets!);
        Assert.Single(dst.CategoryAssetsCollection!);
        Assert.Single(dst.RemovedAssetsCollection!);
        Assert.Single(dst.AssetReservations!);
        Assert.All(dst.OwnerAssets!, oa => Assert.Null(oa.Asset));
        Assert.All(dst.OwnerAssets!, oa => Assert.Null(oa.Owner));
        Assert.All(dst.CategoryAssetsCollection!, ca => Assert.Null(ca.Asset));
        Assert.All(dst.CategoryAssetsCollection!, ca => Assert.Null(ca.Category));
        Assert.All(dst.RemovedAssetsCollection!, ra => Assert.Null(ra.Asset));
        Assert.All(dst.AssetReservations!, ar => Assert.Null(ar.Asset));
        Assert.All(dst.AssetReservations!, ar => Assert.Null(ar.User));
    }
}
