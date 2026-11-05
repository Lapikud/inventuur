using App.BLL.Mappers;
using BllDto = App.BLL.DTO;
using DalDto = App.DAL.DTO;

namespace App.Tests.UnitTests.App.Mappers.BLL;

public class LocationBLLMapperTest
{
    private readonly LocationBLLMapper _mapper = new();

    [Fact]
    public void Map_BllToDal_NullReturnsNull() => Assert.Null(_mapper.Map((BllDto.Location?)null));

    [Fact]
    public void Map_DalToBll_NullReturnsNull() => Assert.Null(_mapper.Map((DalDto.Location?)null));

    [Fact]
    public void Map_BllToDal_ShouldCopyScalarsAndFks()
    {
        var id = Guid.NewGuid();
        var roomId = Guid.NewGuid();
        var cupboardId = Guid.NewGuid();
        var src = new BllDto.Location
        {
            Id = id, LocationName = "L", ShelfNum = 2, Column = 3,
            RoomId = roomId,
            CupboardId = cupboardId,
        };

        var dst = _mapper.Map(src);

        Assert.NotNull(dst);
        Assert.Equal(src.Id, dst!.Id);
        Assert.Equal(src.LocationName, dst.LocationName);
        Assert.Equal(src.ShelfNum, dst.ShelfNum);
        Assert.Equal(src.Column, dst.Column);
        Assert.Equal(src.RoomId, dst.RoomId);
        Assert.Equal(src.CupboardId, dst.CupboardId);
        Assert.Null(dst.Room);
        Assert.Null(dst.Cupboard);
    }

    [Fact]
    public void Map_DalToBll_ShouldCopyScalars()
    {
        var src = new DalDto.Location
        {
            Id = Guid.NewGuid(), LocationName = "L", ShelfNum = 1, Column = 1,
            RoomId = Guid.NewGuid(), CupboardId = Guid.NewGuid(),
        };
        var dst = _mapper.Map(src);
        Assert.NotNull(dst);
        Assert.Equal(src.Id, dst!.Id);
        Assert.Equal(src.LocationName, dst.LocationName);
        Assert.Equal(src.ShelfNum, dst.ShelfNum);
        Assert.Equal(src.Column, dst.Column);
        Assert.Equal(src.RoomId, dst.RoomId);
        Assert.Equal(src.CupboardId, dst.CupboardId);
    }
}
