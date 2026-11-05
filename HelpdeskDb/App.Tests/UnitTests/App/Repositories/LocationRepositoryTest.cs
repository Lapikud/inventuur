using App.DAL.EF;
using App.DAL.EF.Repositories;

namespace App.Tests.UnitTests.App.Repositories;

[Collection("NonParallel")]
public class LocationRepositoryTest : IClassFixture<TestDatabaseFixture>
{
    private readonly TestDatabaseFixture _fixture;
    private readonly AppDbContext _context;
    private readonly LocationRepository _repository;

    public LocationRepositoryTest(TestDatabaseFixture fixture)
    {
        _fixture = fixture;
        (_context, _repository) = SetupDependencies();
    }

    [Fact]
    public async Task AllAsync_ReturnsLocationsOrderedByName()
    {
        var results = (await _repository.AllAsync()).ToList();

        Assert.Equal(2, results.Count);
        var names = results.Select(l => l.LocationName).ToList();
        Assert.Equal(names.OrderBy(n => n).ToList(), names);
    }

    [Fact]
    public async Task AllAsync_ReturnsLocationsWithRoomAndCupboardIds()
    {
        var results = (await _repository.AllAsync()).ToList();

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

    private (AppDbContext, LocationRepository) SetupDependencies()
    {
        var context = _fixture.CreateContext();
        var repository = new LocationRepository(context);
        return (context, repository);
    }
}
