using App.DAL.Contracts;
using App.DAL.DTO;
using App.DAL.EF.Mappers;
using Base.DAL.EF;
using Microsoft.EntityFrameworkCore;

namespace App.DAL.EF.Repositories;

public class TagRepository : BaseRepository<App.DAL.DTO.Tag, App.Domain.Tag>, ITagRepository
{
    public TagRepository(DbContext repositoryDbContext) : base(repositoryDbContext, new TagUOWMapper())
    {
    }

    public override async Task<IEnumerable<Tag>> AllAsync(Guid userId = default)
    {
        var query = GetQuery();
        query = query
            .Include(t => t.AssetTags)
            .OrderBy(t => t.TagName);
        return (await query.ToListAsync()).Select(e => Mapper.Map(e)!);
    }
}
