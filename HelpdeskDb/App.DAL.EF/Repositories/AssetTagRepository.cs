using App.DAL.Contracts;
using App.DAL.DTO;
using App.DAL.EF.Mappers;
using Base.DAL.Contracts;
using Base.DAL.EF;
using Microsoft.EntityFrameworkCore;

namespace App.DAL.EF.Repositories;

public class AssetTagRepository : BaseRepository<App.DAL.DTO.AssetTag, App.Domain.AssetTag>, IAssetTagRepository
{
    public AssetTagRepository(DbContext repositoryDbContext) : base(repositoryDbContext, new AssetTagUOWMapper())
    {
    }

    public override async Task<IEnumerable<AssetTag>> AllAsync(Guid userId = default)
    {
        var query = GetQuery();
        query = query
            .Include(at => at.Tag)
            .OrderBy(at => at.Tag!.TagName);
        return (await query.ToListAsync()).Select(e => Mapper.Map(e)!);
    }
}
