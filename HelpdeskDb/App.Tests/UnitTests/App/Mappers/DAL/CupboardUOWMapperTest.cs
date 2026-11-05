using App.DAL.EF.Mappers;
using DalDto = App.DAL.DTO;

namespace App.Tests.UnitTests.App.Mappers.DAL;

public class CupboardUOWMapperTest
{
    private readonly CupboardUOWMapper _mapper = new();

    [Fact]
    public void Map_DomainToDal_NullReturnsNull() => Assert.Null(_mapper.Map((Domain.Cupboard?)null));

    [Fact]
    public void Map_DalToDomain_NullReturnsNull() => Assert.Null(_mapper.Map((DalDto.Cupboard?)null));

    [Fact]
    public void Map_DomainToDal_ShouldCopyScalarsAndCollections()
    {
        var id = Guid.NewGuid();
        var roomId = Guid.NewGuid();
        var locationId = Guid.NewGuid();
        var src = new Domain.Cupboard
        {
            Id = id, CodeName = "C1", RoomId = roomId,
            Locations = new List<Domain.Location>
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
        Assert.Equal(roomId, mappedLocation.RoomId);
        Assert.Equal(id, mappedLocation.CupboardId);
        Assert.Null(mappedLocation.Room);
        Assert.Null(mappedLocation.Cupboard);
    }

    [Fact]
    public void Map_DalToDomain_ShouldCopyScalarsAndCollections()
    {
        var id = Guid.NewGuid();
        var roomId = Guid.NewGuid();
        var locationId = Guid.NewGuid();
        var src = new DalDto.Cupboard
        {
            Id = id, CodeName = "C1", RoomId = roomId,
            Locations = new List<DalDto.Location>
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
        Assert.Equal(roomId, mappedLocation.RoomId);
        Assert.Equal(id, mappedLocation.CupboardId);
        Assert.Null(mappedLocation.Room);
        Assert.Null(mappedLocation.Cupboard);
    }
}
