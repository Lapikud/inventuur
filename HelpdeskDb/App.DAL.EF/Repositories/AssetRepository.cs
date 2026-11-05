using App.DAL.Contracts;
using App.DAL.DTO.ViewModels;
using App.DAL.EF.Mappers;
using Base.DAL.EF;
using Microsoft.EntityFrameworkCore;
using Asset = App.DAL.DTO.Asset;

namespace App.DAL.EF.Repositories;

public class AssetRepository : BaseRepository<App.DAL.DTO.Asset, App.Domain.Asset>, IAssetRepository
{
    public AssetRepository(AppDbContext repositoryDbContext) : base(repositoryDbContext, new AssetUOWMapper())
    {
    }

    public async Task<App.DAL.DTO.Asset> CreateNewAsset(string assetName, string comment, string? serialNumber = null, string? barcode = null, Guid? locationId = null)
    {
        var asset = new App.DAL.DTO.Asset
        {
            Id = Guid.NewGuid(),
            AssetName = assetName,
            Comment = comment,
            SerialNumber = serialNumber,
            Barcode = barcode,
            LocationId = locationId,
        };
        var addedAsset = await this.AddAsync(asset);
        return addedAsset;
    }

    public async Task<App.DAL.DTO.ViewModels.AssetViewModel?> GetAssetVmByAssetId(Guid assetId)
    {
        var query = base.GetQuery();
        var now = DateTime.UtcNow;
        var assetVm = await query
            .Include(a => a.OwnerAssets)! // Load OwnerAssets
            .ThenInclude(oa => oa.Owner) // Load Owner
            .Include(a => a.Location)! // Load Location
            .ThenInclude(l => l!.Room) // Load Room
            .Include(a => a.CategoryAssetsCollection)! // Load CategoryAssets
            .ThenInclude(ca => ca.Category) // Load Category
            .Include(a => a.AssetReservations)! // Load AssetReservations
            .ThenInclude(ar => ar.User)
            .Where(a => a.Id == assetId)
            .Select(a => new AssetViewModel
            {
                Id = a.Id,
                AssetName = a.AssetName,
                SerialNumber = a.SerialNumber,
                Barcode = a.Barcode,
                Slug = a.Slug,
                Visibility = a.Visibility,
                HasPhoto = a.HasPhoto,
                LastAuditAt = a.LastAuditAt,
                LastAuditBy = a.LastAuditBy,
                LocationId = a.LocationId,
                Tags = a.AssetTags!.Select(at => at.Tag!.TagName).OrderBy(n => n).ToList(),
                Comment = a.Comment,
                CategoryName = a.CategoryAssetsCollection!
                    .Select(ca => ca.Category!.CategoryName)
                    .First(),
                OwnerName = a.OwnerAssets!.Select(oa => oa.Owner!.OwnerName).First(),
                RoomName = a.Location != null ? a.Location.Room!.RoomName : "",
                CupboardName = a.Location != null && a.Location.Cupboard != null
                    ? a.Location.Cupboard.CodeName
                    : "-",
                ShelfNum = a.Location != null ? a.Location.ShelfNum : 0,
                Column = a.Location != null ? a.Location.Column : 0,
                ClosestReservationBy = a.AssetReservations!.Where(ar => !ar.IsReturned && ar.ReservationTo >= now).Select(ar => ar.User!.DisplayName ?? ar.User!.Username).FirstOrDefault() ?? "-",
                AddedAt = a.Location != null ? a.Location.CreatedAt : a.CreatedAt,
                Reserved = a.AssetReservations!.Any(ar => !ar.IsReturned && ar.ReservationTo >= now),
                ReservationTo = a.AssetReservations!
                    .Where(ar => !ar.IsReturned)
                    .OrderByDescending(ar => ar.ReservationFrom)
                    .Select(ar => (DateTime?)ar.ReservationTo)
                    .FirstOrDefault()
            }).FirstOrDefaultAsync();

        return assetVm;
    }

    public async Task<List<App.DAL.DTO.ViewModels.AssetViewModel>> GetAvailableAssets()
    {
        var query = base.GetQuery();
        var now = DateTime.UtcNow;
        return await query
            .Include(a => a.OwnerAssets)! // Load OwnerAssets
            .ThenInclude(oa => oa.Owner) // Load Owner
            .Include(a => a.Location)! // Load Location
            .ThenInclude(l => l!.Room) // Load Room
            .Include(a => a.CategoryAssetsCollection)! // Load CategoryAssets
            .ThenInclude(ca => ca.Category) // Load Category
            .Include(a => a.AssetReservations)! // Load AssetReservations
            .ThenInclude(ar => ar.User)
            .Where(a => (a.RemovedAssetsCollection == null || !a.RemovedAssetsCollection.Any()))
            .Select(a => new AssetViewModel
            {
                Id = a.Id,
                AssetName = a.AssetName,
                SerialNumber = a.SerialNumber,
                Barcode = a.Barcode,
                Slug = a.Slug,
                Visibility = a.Visibility,
                HasPhoto = a.HasPhoto,
                LastAuditAt = a.LastAuditAt,
                LastAuditBy = a.LastAuditBy,
                LocationId = a.LocationId,
                Tags = a.AssetTags!.Select(at => at.Tag!.TagName).OrderBy(n => n).ToList(),
                Comment = a.Comment,
                CategoryName = a.CategoryAssetsCollection!
                    .Select(ca => ca.Category!.CategoryName)
                    .First(),
                OwnerName = a.OwnerAssets!.Select(oa => oa.Owner!.OwnerName).First(),
                RoomName = a.Location != null ? a.Location.Room!.RoomName : "",
                CupboardName = a.Location != null && a.Location.Cupboard != null
                    ? a.Location.Cupboard.CodeName
                    : "-",
                ShelfNum = a.Location != null ? a.Location.ShelfNum : 0,
                Column = a.Location != null ? a.Location.Column : 0,
                ClosestReservationBy = a.AssetReservations!.Where(ar => !ar.IsReturned && ar.ReservationTo >= now).Select(ar => ar.User!.DisplayName ?? ar.User!.Username).FirstOrDefault() ?? "-",
                AddedAt = a.Location != null ? a.Location.CreatedAt : a.CreatedAt,
                Reserved = a.AssetReservations!.Any(ar => !ar.IsReturned && ar.ReservationTo >= now)
            })
            .ToListAsync();
    }

    public async Task<List<App.DAL.DTO.ViewModels.AssetViewModel>> GetAssetsReservedByUser(Guid userId)
    {
        var query = base.GetQuery();
        return await query
            .Include(a => a.OwnerAssets)! // Load OwnerAssets
            .ThenInclude(oa => oa.Owner) // Load Owner
            .Include(a => a.Location)! // Load Location
            .ThenInclude(l => l!.Room) // Load Room
            .Include(a => a.CategoryAssetsCollection)! // Load CategoryAssets
            .ThenInclude(ca => ca.Category) // Load Category
            .Include(a => a.AssetReservations)! // Load assetReservations
            .ThenInclude(ar => ar.User)
            .Where(a => a.AssetReservations != null &&
                        a.AssetReservations.Any(ar => ar.UserId == userId && !ar.IsReturned) &&
                        (a.RemovedAssetsCollection == null || !a.RemovedAssetsCollection.Any()))
            .Select(a => new AssetViewModel
            {
                Id = a.Id,
                AssetName = a.AssetName,
                SerialNumber = a.SerialNumber,
                Barcode = a.Barcode,
                Slug = a.Slug,
                Visibility = a.Visibility,
                HasPhoto = a.HasPhoto,
                LastAuditAt = a.LastAuditAt,
                LastAuditBy = a.LastAuditBy,
                LocationId = a.LocationId,
                Tags = a.AssetTags!.Select(at => at.Tag!.TagName).OrderBy(n => n).ToList(),
                Comment = a.Comment,
                CategoryName = a.CategoryAssetsCollection!
                    .Select(ca => ca.Category!.CategoryName)
                    .First(),
                OwnerName = a.OwnerAssets!.Select(oa => oa.Owner!.OwnerName).First(),
                RoomName = a.Location != null ? a.Location.Room!.RoomName : "",
                CupboardName = a.Location != null && a.Location.Cupboard != null
                    ? a.Location.Cupboard.CodeName
                    : "-",
                ShelfNum = a.Location != null ? a.Location.ShelfNum : 0,
                Column = a.Location != null ? a.Location.Column : 0,
                ClosestReservationBy = a.AssetReservations!.Where(ar => !ar.IsReturned).Select(ar => ar.User!.DisplayName ?? ar.User!.Username).FirstOrDefault() ?? "-",
                AddedAt = a.Location != null ? a.Location.CreatedAt : a.CreatedAt,
                Reserved = true,
                ReservationId = a.AssetReservations!
                    .Where(ar => ar.UserId == userId && !ar.IsReturned)
                    .OrderByDescending(ar => ar.ReservationFrom)
                    .Select(ar => ar.Id)
                    .First(),
                ReservationTo = a.AssetReservations!
                    .Where(ar => ar.UserId == userId && !ar.IsReturned)
                    .OrderByDescending(ar => ar.ReservationFrom)
                    .Select(ar => (DateTime?)ar.ReservationTo)
                    .FirstOrDefault()
            })
            .ToListAsync();
    }

    public override async Task<IEnumerable<Asset>> AllAsync(Guid userId = default)
    {
        var query = GetQuery();
        query = query
            .Include(x => x.CategoryAssetsCollection)
            .Include(x => x.Location)
            .Include(x => x.OwnerAssets)
            .Include(x => x.RemovedAssetsCollection)
            .Include(x => x.AssetReservations)
            .Include(x => x.AssetTags)!
            .ThenInclude(at => at.Tag)
            .OrderBy(a => a.AssetName);
        return (await query.ToListAsync()).Select(e => Mapper.Map(e)!);
    }

    public async Task<List<App.DAL.DTO.Asset>> GetAllNotRemovedAssets()
    {
        var notRemoved = (await this.AllAsync())
            .Where(a => (a.RemovedAssetsCollection == null || !a.RemovedAssetsCollection.Any())).ToList();
        return notRemoved;
    }

    public async Task<Asset?> AuditAssetAsync(Guid assetId, string userName)
    {
        var asset = await RepositoryDbSet
            .FirstOrDefaultAsync(a => a.Id == assetId);
        if (asset == null) return null;

        asset.LastAuditAt = DateTime.UtcNow;
        asset.LastAuditBy = userName;
        return Mapper.Map(asset);
    }

    public async Task<Asset?> FindBySlugAsync(string slug)
    {
        var asset = await GetQuery()
            .Include(a => a.AssetTags)!
            .ThenInclude(at => at.Tag)
            .Include(a => a.AssetReservations)
            .FirstOrDefaultAsync(a => a.Slug == slug);
        return Mapper.Map(asset);
    }

    public async Task<bool> IsSlugFreeAsync(string slug)
    {
        return !await RepositoryDbSet.AnyAsync(a => a.Slug == slug);
    }
}