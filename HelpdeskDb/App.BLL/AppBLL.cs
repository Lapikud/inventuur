using App.BLL.Contracts;
using App.BLL.Contracts.Identity;
using App.BLL.Mappers;
using App.BLL.Mappers.Identity;
using App.BLL.Services;
using App.BLL.Services.Identity;
using App.DAL.Contracts;
using Base.BLL;

namespace App.BLL;

public class AppBLL : BaseBLL<IAppUOW>, IAppBLL
{
    public AppBLL(IAppUOW uow) : base(uow)
    {
    }

    private IAssetService? _assetService;
    public IAssetService AssetService =>
        _assetService ??= new AssetService(
            BLLUOW,
            new AssetBLLMapper()
        );
    
    private ICategoryService? _categoryService;
    public ICategoryService CategoryService =>
        _categoryService ??= new CategoryService(
            BLLUOW,
            new CategoryBLLMapper()
        );
    
    private ICategoryAssetsService? _categoryAssetsService;
    public ICategoryAssetsService CategoryAssetsService =>
        _categoryAssetsService ??= new CategoryAssetsService(
            BLLUOW,
            new CategoryAssetsBLLMapper()
        );
    
    private ICupboardService? _cupboardService;
    public ICupboardService CupboardService =>
        _cupboardService ??= new CupboardService(
            BLLUOW,
            new CupboardBLLMapper()
        );
    
    
    private ILocationService? _locationService;
    public ILocationService LocationService =>
        _locationService ??= new LocationService(
            BLLUOW,
            new LocationBLLMapper()
        );
    
    
    
    private IOwnerService? _ownerService;
    public IOwnerService OwnerService =>
        _ownerService ??= new OwnerService(
            BLLUOW,
            new OwnerBLLMapper()
        );
    
    private IOwnerAssetsService? _ownerAssetsService;
    public IOwnerAssetsService OwnerAssetsService =>
        _ownerAssetsService ??= new OwnerAssetsService(
            BLLUOW,
            new OwnerAssetsBLLMapper()
        );
    
    private IRemovedAssetsService? _removedAssetsService;
    public IRemovedAssetsService RemovedAssetsService =>
        _removedAssetsService ??= new RemovedAssetsService(
            BLLUOW,
            new RemovedAssetsBLLMapper()
        );
    
    private IRoomService? _roomService;
    public IRoomService RoomService =>
        _roomService ??= new RoomService(
            BLLUOW,
            new RoomBLLMapper()
        );
    
    private IAppUserRoleService? _appUserRoleService;
    public IAppUserRoleService AppUserRoleService =>
        _appUserRoleService ??= new AppUserRoleService(
            BLLUOW,
            new AppUserRoleBLLMapper()
        );
    
    private IAssetReservationService? _assetReservationService;
    public IAssetReservationService AssetReservationService =>
        _assetReservationService ??= new AssetReservationService(
            BLLUOW,
            new AssetReservationBLLMapper()
        );

    private ITagService? _tagService;
    public ITagService TagService =>
        _tagService ??= new TagService(
            BLLUOW,
            new TagBLLMapper()
        );

    private IAssetTagService? _assetTagService;
    public IAssetTagService AssetTagService =>
        _assetTagService ??= new AssetTagService(
            BLLUOW,
            new AssetTagBLLMapper()
        );

    private IAssetPhotoService? _assetPhotoService;
    public IAssetPhotoService AssetPhotoService =>
        _assetPhotoService ??= new AssetPhotoService(
            BLLUOW,
            new AssetPhotoBLLMapper()
        );
}