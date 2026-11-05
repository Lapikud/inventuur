using App.BLL.Contracts;
using App.DTO.v1.ViewModels;
using App.Domain;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApp.ApiControllers;

/// <summary>
/// Anonymous read-only endpoints behind the QR stickers and the public main
/// page. Protected and Archived assets are indistinguishable from missing
/// ones. Location, ownership and comment fields are filled only when the
/// request carries a valid session — visitors see everything else, members
/// see the same asset with its place and notes.
/// </summary>
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
[AllowAnonymous]
public class PublicController : ControllerBase
{
    private readonly IAppBLL _bll;

    public PublicController(IAppBLL bll)
    {
        _bll = bll;
    }

    /// <summary>
    /// The public main-page listing: every publicly visible asset, lean
    /// columns only. Reservation holder names, locations and comments are
    /// never part of this payload.
    /// </summary>
    [HttpGet("assets")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(IEnumerable<PublicAssetSummaryViewModel>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PublicAssetSummaryViewModel>>> ListPublicAssets()
    {
        var assets = await _bll.AssetService.GetAvailableAssets();
        var res = assets
            .Where(a => a.Visibility is AssetVisibility.Normal or AssetVisibility.Featured)
            .OrderBy(a => a.AssetName)
            .Select(a => new PublicAssetSummaryViewModel
            {
                Id = a.Id,
                Slug = a.Slug ?? string.Empty,
                AssetName = a.AssetName,
                CategoryName = a.CategoryName,
                Tags = a.Tags,
                HasPhoto = a.HasPhoto,
                InUse = a.Reserved,
                Visibility = a.Visibility,
            })
            .Where(s => !string.IsNullOrEmpty(s.Slug))
            .ToList();
        return Ok(res);
    }

    /// <summary>
    /// Get a publicly visible asset by its QR-sticker slug.
    /// </summary>
    /// <param name="slug">The slug printed on the sticker.</param>
    [HttpGet("assets/{slug}")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(PublicAssetViewModel), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PublicAssetViewModel>> GetAssetBySlug(string slug)
    {
        var vm = await GetPublicVm(slug);
        if (vm == null)
        {
            return NotFound();
        }

        return Ok(vm);
    }

    /// <summary>
    /// Photo of a publicly visible asset, for the public page. Served as-is.
    /// </summary>
    /// <param name="slug">The slug printed on the sticker.</param>
    [HttpGet("assets/{slug}/photo")]
    [Produces("image/jpeg", "image/png")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAssetPhoto(string slug)
    {
        var vm = await GetPublicVm(slug);
        if (vm == null || !vm.HasPhoto)
        {
            return NotFound();
        }

        var photo = await _bll.AssetPhotoService.FindByAssetIdAsync(vm.Id);
        if (photo == null)
        {
            return NotFound();
        }

        return File(photo.Content, photo.ContentType);
    }

    private async Task<PublicAssetViewModel?> GetPublicVm(string slug)
    {
        var asset = await _bll.AssetService.FindBySlugAsync(slug.Trim().ToLowerInvariant());
        if (asset == null)
        {
            return null;
        }

        // Stickers may only publicize public assets; Protected/Archived scan as 404.
        if (asset.Visibility is not (AssetVisibility.Normal or AssetVisibility.Featured))
        {
            return null;
        }

        var vm = await _bll.AssetService.GetAssetVmByAssetId(asset.Id);
        if (vm == null || vm.Visibility is not (AssetVisibility.Normal or AssetVisibility.Featured))
        {
            return null;
        }

        // Members-only fields: filled only when the session is valid. The
        // endpoint is anonymous, but with a valid cookie the auth middleware
        // still resolves the identity, so location/comment ride along for
        // logged-in viewers.
        var isMember = User.Identity?.IsAuthenticated == true;

        return new PublicAssetViewModel
        {
            Id = vm.Id,
            Slug = vm.Slug!,
            AssetName = vm.AssetName,
            SerialNumber = vm.SerialNumber,
            CategoryName = vm.CategoryName,
            RoomName = isMember ? vm.RoomName : null,
            CupboardName = isMember ? vm.CupboardName : null,
            ShelfNum = isMember ? vm.ShelfNum : null,
            Column = isMember ? vm.Column : null,
            Comment = isMember ? vm.Comment : null,
            Tags = vm.Tags,
            HasPhoto = vm.HasPhoto,
            InUse = vm.Reserved,
            LastAuditAt = vm.LastAuditAt,
            Visibility = vm.Visibility,
        };
    }
}
