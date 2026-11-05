using App.DAL.EF;
using App.DAL.EF.Repositories;

namespace App.Tests.UnitTests.App.Repositories;

[Collection("NonParallel")]
public class CupboardRepositoryTest : IClassFixture<TestDatabaseFixture>
{
    private readonly TestDatabaseFixture _fixture;
    private readonly AppDbContext _context;
    private readonly CupboardRepository _repository;

    public CupboardRepositoryTest(TestDatabaseFixture fixture)
    {
        _fixture = fixture;
        (_context, _repository) = SetupDependencies();
    }

    [Fact]
    public async Task AllAsync_ReturnsCupboardsOrderedByCodeName()
    {
        var results = (await _repository.AllAsync()).ToList();

        Assert.Equal(2, results.Count);
        var codes = results.Select(c => c.CodeName).ToList();
        Assert.Equal(codes.OrderBy(n => n).ToList(), codes);
    }

    [Fact]
    public async Task AllAsync_IncludesLocationsAndRoomId()
    {
        var results = (await _repository.AllAsync()).ToList();

        Assert.All(results, c =>
        {
            Assert.NotNull(c.Locations);
            Assert.Single(c.Locations!);
            Assert.NotEqual(Guid.Empty, c.RoomId);
        });
        Assert.Equal(
            Guid.Parse("00000000-0000-0000-0000-000000000100"),
            results.First(c => c.CodeName == "TestCupboard1").RoomId
        );
        Assert.Equal(
            Guid.Parse("00000000-0000-0000-0000-000000000101"),
            results.First(c => c.CodeName == "TestCupboard2").RoomId
        );
    }

    private (AppDbContext, CupboardRepository) SetupDependencies()
    {
        var context = _fixture.CreateContext();
        var repository = new CupboardRepository(context);
        return (context, repository);
    }
}
