using App.DTO.v1.Mappers;
using V1 = App.DTO.v1;
using Bll = App.BLL.DTO;

namespace App.Tests.UnitTests.App.Mappers.DTO;

public class CupboardMapperTest
{
    private readonly CupboardMapper _mapper = new();

    [Fact]
    public void Map_BllToV1_NullReturnsNull() => Assert.Null(_mapper.Map((Bll.Cupboard?)null));

    [Fact]
    public void Map_V1ToBll_NullReturnsNull() => Assert.Null(_mapper.Map((V1.Cupboard?)null));

    [Fact]
    public void Map_BllToV1_ShouldCopyScalars()
    {
        var roomId = Guid.NewGuid();
        var src = new Bll.Cupboard { Id = Guid.NewGuid(), CodeName = "CC", RoomId = roomId };
        var dst = _mapper.Map(src);
        Assert.NotNull(dst);
        Assert.Equal(src.Id, dst!.Id);
        Assert.Equal(src.CodeName, dst.CodeName);
        Assert.Equal(src.RoomId, dst.RoomId);
    }

    [Fact]
    public void Map_V1ToBll_ShouldCopyScalars()
    {
        var roomId = Guid.NewGuid();
        var src = new V1.Cupboard { Id = Guid.NewGuid(), CodeName = "CC", RoomId = roomId };
        var dst = _mapper.Map(src);
        Assert.NotNull(dst);
        Assert.Equal(src.Id, dst!.Id);
        Assert.Equal(src.CodeName, dst.CodeName);
        Assert.Equal(src.RoomId, dst.RoomId);
    }

    [Fact]
    public void Map_Create_ShouldGenerateId()
    {
        var roomId = Guid.NewGuid();
        var create = new V1.CreateObjects.CupboardCreate { CodeName = "X", RoomId = roomId };
        var dst = _mapper.Map(create);
        Assert.NotEqual(Guid.Empty, dst.Id);
        Assert.Equal(create.CodeName, dst.CodeName);
        Assert.Equal(create.RoomId, dst.RoomId);
    }
}
