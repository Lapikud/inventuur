using App.DAL.EF;
using App.DAL.EF.Repositories;

namespace App.Tests.UnitTests.App.Repositories;

[Collection("NonParallel")]
public class RoomRepositoryTest : IClassFixture<TestDatabaseFixture>
{
    private readonly TestDatabaseFixture _fixture;
    private readonly AppDbContext _context;
    private readonly RoomRepository _repository;

    public RoomRepositoryTest(TestDatabaseFixture fixture)
    {
        _fixture = fixture;
        (_context, _repository) = SetupDependencies();
    }

    [Fact]
    public async Task AllAsync_ReturnsRoomsOrderedByName()
    {
        var results = (await _repository.AllAsync()).ToList();

        Assert.Equal(2, results.Count);
        var names = results.Select(r => r.RoomName).ToList();
        Assert.Equal(names.OrderBy(n => n).ToList(), names);
    }

    [Fact]
    public async Task AllAsync_IncludesCupboardsAndLocations()
    {
        var results = (await _repository.AllAsync()).ToList();

        Assert.All(results, r =>
        {
            Assert.NotNull(r.Cupboards);
            Assert.Single(r.Cupboards!);
            Assert.NotNull(r.Locations);
            Assert.Single(r.Locations!);
        });
        var room1 = results.First(r => r.RoomName == "TestRoom1");
        var room2 = results.First(r => r.RoomName == "TestRoom2");
        Assert.Equal("TestCupboard1", room1.Cupboards!.First().CodeName);
        Assert.Equal("TestCupboard2", room2.Cupboards!.First().CodeName);
        Assert.Equal("TestLocation1", room1.Locations!.First().LocationName);
        Assert.Equal("TestLocation2", room2.Locations!.First().LocationName);
    }

    private (AppDbContext, RoomRepository) SetupDependencies()
    {
        var context = _fixture.CreateContext();
        var repository = new RoomRepository(context);
        return (context, repository);
    }
}
