using App.BLL.Mappers;
using App.BLL.Services;
using App.DAL.EF;

namespace App.Tests.UnitTests.App.Services;

[Collection("NonParallel")]
public class LocationServiceTest : IClassFixture<TestDatabaseFixture>
{
    private readonly TestDatabaseFixture _fixture;
    private readonly AppDbContext _context;
    private readonly LocationService _service;

    public LocationServiceTest(TestDatabaseFixture fixture)
    {
        _fixture = fixture;
        (_context, _service) = SetupDependencies();
    }

    [Fact]
    public async Task AllAsync_ReturnsLocationsOrderedByName()
    {
        var results = (await _service.AllAsync()).ToList();

        Assert.Equal(2, results.Count);
        var names = results.Select(l => l.LocationName).ToList();
        Assert.Equal(names.OrderBy(n => n).ToList(), names);
    }

    [Fact]
    public async Task AllAsync_ReturnsLocationsWithRoomAndCupboardIds()
    {
        var results = (await _service.AllAsync()).ToList();

        Assert.All(results, l =>
        {
            Assert.NotEqual(Guid.Empty, l.RoomId);
            Assert.NotNull(l.CupboardId);
        });
        var location1 = results.First(l => l.LocationName == "TestLocation1");
        var location2 = results.First(l => l.LocationName == "TestLocation2");
        Assert.Equal(
            Guid.Parse("00000000-0000-0000-0000-000000000100"),
            location1.RoomId
        );
        Assert.Equal(
            Guid.Parse("00000000-0000-0000-0000-000000000200"),
            location1.CupboardId
        );
        Assert.Equal(
            Guid.Parse("00000000-0000-0000-0000-000000000101"),
            location2.RoomId
        );
        Assert.Equal(
            Guid.Parse("00000000-0000-0000-0000-000000000201"),
            location2.CupboardId
        );
    }

    private (AppDbContext, LocationService) SetupDependencies()
    {
        var context = _fixture.CreateContext();
        var uow = new AppUOW(context);
        var service = new LocationService(uow, new LocationBLLMapper());
        return (context, service);
    }
}