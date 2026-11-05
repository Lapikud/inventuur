using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using App.BLL.Contracts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using App.DAL.EF;
using App.DTO.v1;
using Asp.Versioning;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using QRCoder;

namespace WebApp.ApiControllers
{
    /// <summary>
    /// API controller for managing assets.
    /// </summary>
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class AssetsController : ControllerBase
    {
        private readonly IAppBLL _bll;
        private readonly IConfiguration _configuration;

        private readonly App.DTO.v1.Mappers.AssetMapper _mapper =
            new App.DTO.v1.Mappers.AssetMapper();

        /// <summary>
        /// Constructor.
        /// </summary>
        /// <param name="bll">Business Logic.</param>
        /// <param name="configuration">Configuration, for the public base URL printed into QR codes.</param>
        public AssetsController(IAppBLL bll, IConfiguration configuration)
        {
            _bll = bll;
            _configuration = configuration;
        }

        /// <summary>
        /// Get all assets.
        /// </summary>
        /// <returns>List of assets.</returns>
        [Authorize(Roles = "admins,helpdesk_db_admins,members,pixels")]
        [HttpGet]
        [Produces("application/json")]
        [ProducesResponseType(typeof(IEnumerable<App.DTO.v1.Asset>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<Asset>>> GetAssets([FromQuery] bool includeRemoved = false)
        {
            var data = includeRemoved 
                ? await _bll.AssetService.AllAsync() 
                : await _bll.AssetService.GetAllNotRemovedAssets();
            var res = data.Select(c => _mapper.Map(c)!).OrderBy(a => a.AssetName).ToList();
            return Ok(res);
        }

        /// <summary>
        /// Get an asset by id.
        /// </summary>
        /// <param name="id">The id of the asset.</param>
        /// <returns>The asset.</returns>
        [Authorize(Roles = "admins,helpdesk_db_admins,members,pixels")]
        [HttpGet("{id:guid}")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(App.DTO.v1.Asset), StatusCodes.Status200OK)]
        public async Task<ActionResult<Asset>> GetAsset(Guid id)
        {
            var asset = await _bll.AssetService.FindAsync(id);

            if (asset == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map(asset)!);
        }

        /// <summary>
        /// Update an asset.
        /// </summary>
        /// <param name="id">The id of the asset to update.</param>
        /// <param name="asset">The updated asset data.</param>
        /// <returns>A status indicating the result of the update operation.</returns>
        [Authorize(Roles = "admins,helpdesk_db_admins")]
        [HttpPut("{id:guid}")]
        [Consumes("application/json")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> PutAsset(Guid id, Asset asset)
        {
            if (id != asset.Id)
            {
                return BadRequest();
            }

            try
            {
                await _bll.AssetService.UpdateAsync(_mapper.Map(asset)!);
                await _bll.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _bll.AssetService.ExistsAsync(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        /// <summary>
        /// Create an asset.
        /// </summary>
        /// <param name="asset">The asset to create.</param>
        /// <returns>The created asset.</returns>
        [Authorize(Roles = "admins,helpdesk_db_admins")]
        [HttpPost]
        [Consumes("application/json")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(App.DTO.v1.Asset), StatusCodes.Status201Created)]
        public async Task<ActionResult<Asset>> PostAsset(App.DTO.v1.CreateObjects.AssetCreate asset)
        {
            var bllEntity = _mapper.Map(asset);
            await _bll.AssetService.AddAsync(bllEntity);
            await _bll.SaveChangesAsync();

            var dtoAsset = _mapper.Map(bllEntity)!;
            return CreatedAtAction("GetAsset", new
            {
                id = bllEntity.Id,
                version = HttpContext.RequestedApiVersion!.ToString()
            }, dtoAsset);
        }

        /// <summary>
        /// Delete an asset.
        /// </summary>
        /// <param name="id">The id of the asset to delete.</param>
        /// <returns>A status indicating the result of the delete operation.</returns>
        [Authorize(Roles = "admins,helpdesk_db_admins")]
        [HttpDelete("{id:guid}")]
        [Produces("application/json")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> DeleteAsset(Guid id)
        {
            var categoryAssets = (await _bll.CategoryAssetsService.AllAsync()).Where(ca => ca.AssetId == id).ToList();
            var ownerAssets = (await _bll.OwnerAssetsService.AllAsync()).Where(oa => oa.AssetId == id).ToList();
            var removedAssets = (await _bll.RemovedAssetsService.AllAsync()).Where(ra => ra.AssetId == id).ToList();
            var assetReservations = (await _bll.AssetReservationService.AllAsync()).Where(ar => ar.AssetId == id).ToList();
            var assetTags = (await _bll.AssetTagService.AllAsync()).Where(at => at.AssetId == id).ToList();
            var assetPhoto = await _bll.AssetPhotoService.FindByAssetIdAsync(id);
            foreach (var ca in categoryAssets)
            {
                await _bll.CategoryAssetsService.RemoveAsync(ca.Id);
            }
            foreach (var oa in ownerAssets)
            {
                await _bll.OwnerAssetsService.RemoveAsync(oa.Id);
            }
            foreach (var ra in removedAssets)
            {
                await _bll.RemovedAssetsService.RemoveAsync(ra.Id);
            }
            foreach (var ar in assetReservations)
            {
                await _bll.AssetReservationService.RemoveAsync(ar.Id, ar.UserId);
            }
            foreach (var at in assetTags)
            {
                await _bll.AssetTagService.RemoveAsync(at.Id);
            }
            if (assetPhoto != null)
            {
                await _bll.AssetPhotoService.RemoveAsync(assetPhoto.Id);
            }
            await _bll.AssetService.RemoveAsync(id);
            await _bll.SaveChangesAsync();

            return NoContent();
        }

        // ------------------------------------------------------------------
        // Inventory-app style asset management: audit, slug + QR sticker, photos, tags.

        /// <summary>
        /// Stamp the asset as confirmed-accurate at this moment (one-click audit).
        /// </summary>
        /// <param name="id">The id of the asset.</param>
        /// <returns>The stamped asset.</returns>
        [Authorize(Roles = "admins,helpdesk_db_admins,members,pixels")]
        [HttpPost("{id:guid}/audit")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(Asset), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Asset>> AuditAsset(Guid id)
        {
            var userName = User.Identity?.Name;
            if (string.IsNullOrEmpty(userName))
            {
                return Unauthorized();
            }

            var audited = await _bll.AssetService.AuditAssetAsync(id, userName);
            if (audited == null)
            {
                return NotFound();
            }

            await _bll.SaveChangesAsync();
            return Ok(_mapper.Map(audited)!);
        }

        /// <summary>
        /// Assign or clear the short slug used on the QR sticker.
        /// Pass an empty body/slug to auto-generate one.
        /// </summary>
        /// <param name="id">The id of the asset.</param>
        /// <param name="slug">The desired slug, or null/empty for a random one.</param>
        [Authorize(Roles = "admins,helpdesk_db_admins")]
        [HttpPut("{id:guid}/slug")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(Asset), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Asset>> PutSlug(Guid id, [FromBody] AssetSlug? slug)
        {
            var asset = await _bll.AssetService.FindAsync(id);
            if (asset == null)
            {
                return NotFound();
            }

            var newSlug = slug?.Slug?.Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(newSlug))
            {
                newSlug = await GenerateUniqueSlugAsync();
            }
            else if (!System.Text.RegularExpressions.Regex.IsMatch(newSlug, "^[a-z0-9-]{2,16}$"))
            {
                return BadRequest(new Message("Slug must be 2-16 characters: a-z, 0-9, hyphen."));
            }
            else if (!await _bll.AssetService.IsSlugFreeAsync(newSlug))
            {
                return Conflict(new Message($"Slug '{newSlug}' is already in use."));
            }

            asset.Slug = newSlug;
            await _bll.AssetService.UpdateAsync(asset);
            await _bll.SaveChangesAsync();

            return Ok(_mapper.Map(asset)!);
        }

        private async Task<string> GenerateUniqueSlugAsync()
        {
            var alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
            var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            while (true)
            {
                var bytes = new byte[6];
                rng.GetBytes(bytes);
                var candidate = new string(bytes.Select(b => alphabet[b % alphabet.Length]).ToArray());
                if (await _bll.AssetService.IsSlugFreeAsync(candidate))
                {
                    return candidate;
                }
            }
        }

        /// <summary>
        /// QR code (PNG) pointing at the asset's public page, for printing stickers.
        /// Server-side generated with QRCoder, so no JS dependency is needed.
        /// </summary>
        /// <param name="id">The id of the asset.</param>
        [Authorize(Roles = "admins,helpdesk_db_admins,members,pixels")]
        [HttpGet("{id:guid}/qr")]
        [Produces("image/png")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetQr(Guid id)
        {
            var asset = await _bll.AssetService.FindAsync(id);
            if (asset == null || string.IsNullOrEmpty(asset.Slug))
            {
                return NotFound(new Message("Asset has no slug assigned; assign one first."));
            }

            var publicUrl = $"{_configuration["PublicBaseUrl"]?.TrimEnd('/') ?? "http://localhost:3000"}/a/{asset.Slug}";

            using var data = QRCoder.QRCodeGenerator.GenerateQrCode(publicUrl, QRCoder.QRCodeGenerator.ECCLevel.M);
            var png = new PngByteQRCode(data).GetGraphic(10);
            return File(png, "image/png");
        }

        /// <summary>
        /// Sync the tag set of an asset. Body carries the full desired tag id list.
        /// </summary>
        /// <param name="id">The id of the asset.</param>
        /// <param name="tags">The desired tag ids (empty clears all).</param>
        [Authorize(Roles = "admins,helpdesk_db_admins")]
        [HttpPut("{id:guid}/tags")]
        [Consumes("application/json")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> PutTags(Guid id, [FromBody] AssetTags tags)
        {
            var asset = await _bll.AssetService.FindAsync(id);
            if (asset == null)
            {
                return NotFound();
            }

            var desired = (tags?.TagIds ?? []).Distinct().ToList();

            var validTagIds = (await _bll.TagService.AllAsync()).Select(t => t.Id).ToHashSet();
            if (desired.Any(t => !validTagIds.Contains(t)))
            {
                return BadRequest(new Message("Unknown tag id in list."));
            }

            var current = (await _bll.AssetTagService.AllAsync()).Where(at => at.AssetId == id).ToList();
            foreach (var link in current.Where(l => !desired.Contains(l.TagId)))
            {
                await _bll.AssetTagService.RemoveAsync(link.Id);
            }
            foreach (var tagId in desired.Where(t => current.All(l => l.TagId != t)))
            {
                await _bll.AssetTagService.AddAsync(new App.BLL.DTO.AssetTag
                {
                    Id = Guid.NewGuid(),
                    AssetId = id,
                    TagId = tagId,
                });
            }

            await _bll.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Upload (or replace) the asset photo. JPEG/PNG, max 5 MB.
        /// </summary>
        /// <param name="id">The id of the asset.</param>
        /// <param name="file">The image file.</param>
        [Authorize(Roles = "admins,helpdesk_db_admins")]
        [HttpPut("{id:guid}/photo")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> PutPhoto(Guid id, IFormFile file)
        {
            var asset = await _bll.AssetService.FindAsync(id);
            if (asset == null)
            {
                return NotFound();
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest(new Message("No file received."));
            }

            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png" };
            if (!allowedTypes.Contains(file.ContentType.ToLowerInvariant()))
            {
                return BadRequest(new Message("Only JPEG and PNG photos are accepted."));
            }

            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new Message("Photo must be at most 5 MB."));
            }

            await using var stream = file.OpenReadStream();
            using var ms = new System.IO.MemoryStream();
            await stream.CopyToAsync(ms);

            var existing = await _bll.AssetPhotoService.FindByAssetIdAsync(id);
            if (existing != null)
            {
                existing.Content = ms.ToArray();
                existing.ContentType = file.ContentType.ToLowerInvariant();
                await _bll.AssetPhotoService.UpdateAsync(existing);
            }
            else
            {
                await _bll.AssetPhotoService.AddAsync(new App.BLL.DTO.AssetPhoto
                {
                    Id = Guid.NewGuid(),
                    AssetId = id,
                    Content = ms.ToArray(),
                    ContentType = file.ContentType.ToLowerInvariant(),
                });
            }

            asset.HasPhoto = true;
            await _bll.AssetService.UpdateAsync(asset);
            await _bll.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Download the asset photo. Also available anonymously via the public endpoint.
        /// </summary>
        /// <param name="id">The id of the asset.</param>
        [Authorize(Roles = "admins,helpdesk_db_admins,members,pixels")]
        [HttpGet("{id:guid}/photo")]
        [Produces("image/jpeg", "image/png")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPhoto(Guid id)
        {
            var photo = await _bll.AssetPhotoService.FindByAssetIdAsync(id);
            if (photo == null)
            {
                // Don't reveal whether the asset exists.
                return NotFound();
            }

            return File(photo.Content, photo.ContentType);
        }

        /// <summary>
        /// Delete the asset photo.
        /// </summary>
        /// <param name="id">The id of the asset.</param>
        [Authorize(Roles = "admins,helpdesk_db_admins")]
        [HttpDelete("{id:guid}/photo")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePhoto(Guid id)
        {
            var photo = await _bll.AssetPhotoService.FindByAssetIdAsync(id);
            if (photo == null)
            {
                return NotFound();
            }

            await _bll.AssetPhotoService.RemoveAsync(photo.Id);

            var asset = await _bll.AssetService.FindAsync(id);
            if (asset != null)
            {
                asset.HasPhoto = false;
                await _bll.AssetService.UpdateAsync(asset);
            }

            await _bll.SaveChangesAsync();
            return NoContent();
        }
    }

    /// <summary>Slug assignment request body.</summary>
    public class AssetSlug
    {
        /// <summary>Desired slug; null/empty asks the server to generate one.</summary>
        public string? Slug { get; set; }
    }

    /// <summary>Tag synchronization request body.</summary>
    public class AssetTags
    {
        /// <summary>Full desired tag id list for the asset.</summary>
        public List<Guid>? TagIds { get; set; }
    }
}
