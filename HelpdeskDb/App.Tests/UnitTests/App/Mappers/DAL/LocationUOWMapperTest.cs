using App.DAL.EF.Mappers;
using DalDto = App.DAL.DTO;

namespace App.Tests.UnitTests.App.Mappers.DAL;

public class LocationUOWMapperTest
{
    private readonly LocationUOWMapper _mapper = new();

    [Fact]
    public void Map_DomainToDal_NullReturnsNull() => Assert.Null(_mapper.Map((Domain.Location?)null));

    [Fact]
    public void Map_DalToDomain_NullReturnsNull() => Assert.Null(_mapper.Map((DalDto.Location?)null));

    [Fact]
    public void Map_DomainToDal_ShouldCopyScalarsAndFks()
    {
        var id = Guid.NewGuid();
        var roomId = Guid.NewGuid();
        var cupboardId = Guid.NewGuid();
        var src = new Domain.Location
        {
            Id = id, LocationName = "Location", ShelfNum = 3, Column = 5,
            RoomId = roomId, CupboardId = cupboardId,
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
    public void Map_DalToDomain_ShouldCopyScalarsAndFks()
    {
        var id = Guid.NewGuid();
        var roomId = Guid.NewGuid();
        var cupboardId = Guid.NewGuid();
        var src = new DalDto.Location
        {
            Id = id, LocationName = "Location", ShelfNum = 3, Column = 5,
            RoomId = roomId, CupboardId = cupboardId,
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
}
