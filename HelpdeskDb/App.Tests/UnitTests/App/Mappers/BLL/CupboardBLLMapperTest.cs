using App.BLL.Mappers;
using BllDto = App.BLL.DTO;
using DalDto = App.DAL.DTO;

namespace App.Tests.UnitTests.App.Mappers.BLL;

public class CupboardBLLMapperTest
{
    private readonly CupboardBLLMapper _mapper = new();

    [Fact]
    public void Map_BllToDal_NullReturnsNull() => Assert.Null(_mapper.Map((BllDto.Cupboard?)null));

    [Fact]
    public void Map_DalToBll_NullReturnsNull() => Assert.Null(_mapper.Map((DalDto.Cupboard?)null));

    [Fact]
    public void Map_BllToDal_ShouldCopyScalarsAndCollections()
    {
        var id = Guid.NewGuid();
        var roomId = Guid.NewGuid();
        var locationId = Guid.NewGuid();
        var src = new BllDto.Cupboard
        {
            Id = id,
            CodeName = "C1",
            RoomId = roomId,
            Locations = new List<BllDto.Location>
            {
                new() { Id = locationId, LocationName = "L", ShelfNum = 1, Column = 1, RoomId = roomId, CupboardId = id }
            }
        };

        var dst = _mapper.Map(src);

        Assert.NotNull(dst);
        Assert.Equal(src.Id, dst!.Id);
        Assert.Equal(src.CodeName, dst.CodeName);
        Assert.Equal(src.RoomId, dst.RoomId);
        Assert.Null(dst.Room);
        Assert.Single(dst.Locations!);
        var mappedLocation = dst.Locations!.First();
        Assert.Equal(locationId, mappedLocation.Id);
        Assert.Equal(src.RoomId, mappedLocation.RoomId);
        Assert.Equal(id, mappedLocation.CupboardId);
        Assert.Null(mappedLocation.Room);
        Assert.Null(mappedLocation.Cupboard);
    }

    [Fact]
    public void Map_DalToBll_ShouldCopyScalars()
    {
        var src = new DalDto.Cupboard { Id = Guid.NewGuid(), CodeName = "X", RoomId = Guid.NewGuid() };
        var dst = _mapper.Map(src);
        Assert.NotNull(dst);
        Assert.Equal(src.Id, dst!.Id);
        Assert.Equal(src.CodeName, dst.CodeName);
        Assert.Equal(src.RoomId, dst.RoomId);
    }
}
