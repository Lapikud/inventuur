using App.DAL.EF.Mappers;
using DalDto = App.DAL.DTO;

namespace App.Tests.UnitTests.App.Mappers.DAL;

public class RoomUOWMapperTest
{
    private readonly RoomUOWMapper _mapper = new();

    [Fact]
    public void Map_DomainToDal_NullReturnsNull() => Assert.Null(_mapper.Map((Domain.Room?)null));

    [Fact]
    public void Map_DalToDomain_NullReturnsNull() => Assert.Null(_mapper.Map((DalDto.Room?)null));

    [Fact]
    public void Map_DomainToDal_ShouldCopyScalarsAndCollections()
    {
        var id = Guid.NewGuid();
        var cupboardId = Guid.NewGuid();
        var locationId = Guid.NewGuid();
        var src = new Domain.Room
        {
            Id = id, RoomName = "Room", Comment = "comment",
            Cupboards = new List<Domain.Cupboard>
            {
                new() { Id = cupboardId, CodeName = "C", RoomId = id }
            },
            Locations = new List<Domain.Location>
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
        Assert.Equal(cupboardId, mappedLocation.CupboardId);
        Assert.Null(mappedLocation.Room);
        Assert.Null(mappedLocation.Cupboard);
    }

    [Fact]
    public void Map_DalToDomain_ShouldCopyScalarsAndCollections()
    {
        var id = Guid.NewGuid();
        var cupboardId = Guid.NewGuid();
        var locationId = Guid.NewGuid();
        var src = new DalDto.Room
        {
            Id = id, RoomName = "Room", Comment = "comment",
            Cupboards = new List<DalDto.Cupboard>
            {
                new() { Id = cupboardId, CodeName = "C", RoomId = id }
            },
            Locations = new List<DalDto.Location>
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
        Assert.Equal(cupboardId, mappedLocation.CupboardId);
        Assert.Null(mappedLocation.Room);
        Assert.Null(mappedLocation.Cupboard);
    }
}
