using App.DAL.Contracts;
using App.DAL.DTO;
using App.DAL.EF.Mappers;

using Base.DAL.EF;
using Microsoft.EntityFrameworkCore;

namespace App.DAL.EF.Repositories;

public class CupboardRepository : BaseRepository<App.DAL.DTO.Cupboard, App.Domain.Cupboard>, ICupboardRepository
{
    public CupboardRepository(DbContext repositoryDbContext) : base(repositoryDbContext, new CupboardUOWMapper())
    {
    }
    
    public override async Task<IEnumerable<Cupboard>> AllAsync(Guid userId = default)
    {
        var query = GetQuery();
        query = query
            .Include(x => x.Locations)
            .Include(x => x.Room)
            .OrderBy(c => c.CodeName);
        return (await query.ToListAsync()).Select(e => Mapper.Map(e)!);
    }
}