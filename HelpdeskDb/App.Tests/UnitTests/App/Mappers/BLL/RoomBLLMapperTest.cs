using App.BLL.Mappers;
using BllDto = App.BLL.DTO;
using DalDto = App.DAL.DTO;

namespace App.Tests.UnitTests.App.Mappers.BLL;

public class RoomBLLMapperTest
{
    private readonly RoomBLLMapper _mapper = new();

    [Fact]
    public void Map_BllToDal_NullReturnsNull() => Assert.Null(_mapper.Map((BllDto.Room?)null));

    [Fact]
    public void Map_DalToBll_NullReturnsNull() => Assert.Null(_mapper.Map((DalDto.Room?)null));

    [Fact]
    public void Map_BllToDal_ShouldCopyScalarsAndCollections()
    {
        var id = Guid.NewGuid();
        var cupboardId = Guid.NewGuid();
        var locationId = Guid.NewGuid();
        var src = new BllDto.Room
        {
            Id = id, RoomName = "R", Comment = "c",
            Cupboards = new List<BllDto.Cupboard>
            {
                new() { Id = cupboardId, CodeName = "C", RoomId = id }
            },
            Locations = new List<BllDto.Location>
            {
                new() { Id = locationId, LocationName = "L", ShelfNum = 1, Column = 1, RoomId = id, CupboardId = cupboardId }
            }
        };

        var dst = _mapper.Map(src);

        Assert.NotNull(dst);
        Assert.Equal(src.Id, dst!.Id);
        Assert.Equal(src.RoomName, dst.RoomName);
        Assert.Equal(src.Comment, dst.Comment);
        Assert.Single(dst.Cupboards!);
        Assert.Single(dst.Locations!);
        var mappedCupboard = dst.Cupboards!.First();
        Assert.Equal(cupboardId, mappedCupboard.Id);
        Assert.Equal(id, mappedCupboard.RoomId);
        Assert.Null(mappedCupboard.Room);
        var mappedLocation = dst.Locations!.First();
        Assert.Equal(locationId, mappedLocation.Id);
        Assert.Equal(id, mappedLocation.RoomId);
        Assert.Null(mappedLocation.Room);
        Assert.Null(mappedLocation.Cupboard);
    }

    [Fact]
    public void Map_DalToBll_ShouldCopyScalars()
    {
        var src = new DalDto.Room { Id = Guid.NewGuid(), RoomName = "R", Comment = "c" };
        var dst = _mapper.Map(src);
        Assert.NotNull(dst);
        Assert.Equal(src.Id, dst!.Id);
        Assert.Equal(src.RoomName, dst.RoomName);
        Assert.Equal(src.Comment, dst.Comment);
    }
}
