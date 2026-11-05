using App.BLL.Mappers;
using BllDto = App.BLL.DTO;
using DalDto = App.DAL.DTO;

namespace App.Tests.UnitTests.App.Mappers.BLL;

public class AssetBLLMapperTest
{
    private readonly AssetBLLMapper _mapper = new();

    [Fact]
    public void Map_BllToDal_ShouldReturnNullForNullInput()
    {
        Assert.Null(_mapper.Map((BllDto.Asset?)null));
    }

    [Fact]
    public void Map_DalToBll_ShouldReturnNullForNullInput()
    {
        Assert.Null(_mapper.Map((DalDto.Asset?)null));
    }

    [Fact]
    public void Map_BllToDal_ShouldCopyScalarsAndCollections()
    {
        var assetId = Guid.NewGuid();
        var locationId = Guid.NewGuid();
        var src = new BllDto.Asset
        {
            Id = assetId,
            AssetName = "Laptop",
            Comment = "A test asset",
            SerialNumber = "SN-1",
            Barcode = "BC-1",
            LocationId = locationId,
            Location = new BllDto.Location
            {
                Id = locationId,
                LocationName = "Shelf",
                ShelfNum = 2,
                Column = 3,
                RoomId = Guid.NewGuid(),
                CupboardId = Guid.NewGuid(),
            },
            OwnerAssets = new List<BllDto.OwnerAssets>
            {
                new() { Id = Guid.NewGuid(), AssetId = assetId, OwnerId = Guid.NewGuid(), CreatedBy = "u" }
            },
            CategoryAssetsCollection = new List<BllDto.CategoryAssets>
            {
                new() { Id = Guid.NewGuid(), AssetId = assetId, CategoryId = Guid.NewGuid(), CreatedBy = "u", Comment = "c" }
            },
            RemovedAssetsCollection = new List<BllDto.RemovedAssets>
            {
                new() { Id = Guid.NewGuid(), AssetId = assetId, Comment = "rm" }
            },
            AssetReservations = new List<BllDto.AssetReservation>
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
        Assert.All(dst.AssetReservations!, ar => Assert.Null(ar.Asset));
        Assert.All(dst.AssetReservations!, ar => Assert.Null(ar.User));
    }

    [Fact]
    public void Map_DalToBll_ShouldCopyScalars()
    {
        var src = new DalDto.Asset
        {
            Id = Guid.NewGuid(),
            AssetName = "A",
            Comment = "C",
            SerialNumber = "SN",
            Barcode = "BC",
        };

        var dst = _mapper.Map(src);

        Assert.NotNull(dst);
        Assert.Equal(src.Id, dst!.Id);
        Assert.Equal(src.AssetName, dst.AssetName);
        Assert.Equal(src.Comment, dst.Comment);
        Assert.Equal(src.SerialNumber, dst.SerialNumber);
        Assert.Equal(src.Barcode, dst.Barcode);
    }
}
