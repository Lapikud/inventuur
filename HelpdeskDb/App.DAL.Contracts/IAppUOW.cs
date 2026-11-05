using App.DAL.Contracts.Identity;
using Base.DAL.Contracts;

namespace App.DAL.Contracts;

public interface IAppUOW : IBaseUOW
{
    IAssetRepository AssetRepository { get; }
    
    ICategoryRepository CategoryRepository { get; }
    
    ICategoryAssetsRepository CategoryAssetsRepository { get; }
    
    ICupboardRepository CupboardRepository { get; }
    
    
    ILocationRepository LocationRepository { get; }
    
    
    
    IOwnerRepository OwnerRepository { get; }
    
    IOwnerAssetsRepository OwnerAssetsRepository { get; }
    
    IRemovedAssetsRepository RemovedAssetsRepository { get; }
    
    IRoomRepository RoomRepository { get; }
    
    IAppUserRoleRepository AppUserRoleRepository { get; }
    
    IAssetReservationRepository AssetReservationRepository { get; }

    ITagRepository TagRepository { get; }

    IAssetTagRepository AssetTagRepository { get; }

    IAssetPhotoRepository AssetPhotoRepository { get; }
}