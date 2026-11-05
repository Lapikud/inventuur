using App.DAL.Contracts;
using App.DAL.DTO;
using App.DAL.EF.Mappers;
using Base.DAL.EF;
using Microsoft.EntityFrameworkCore;

namespace App.DAL.EF.Repositories;

public class AssetPhotoRepository : BaseRepository<App.DAL.DTO.AssetPhoto, App.Domain.AssetPhoto>, IAssetPhotoRepository
{
    public AssetPhotoRepository(DbContext repositoryDbContext) : base(repositoryDbContext, new AssetPhotoUOWMapper())
    {
    }

    public async Task<AssetPhoto?> FindByAssetIdAsync(Guid assetId)
    {
        var photo = await GetQuery()
            .FirstOrDefaultAsync(p => p.AssetId == assetId);
        return Mapper.Map(photo);
    }
}
