using App.BLL.Contracts;
using Asp.Versioning;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using App.DTO.v1;

namespace WebApp.ApiControllers
{
    /// <summary>
    /// API controller for managing tag dictionary entries.
    /// </summary>
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class TagsController : ControllerBase
    {
        private readonly IAppBLL _bll;

        private readonly App.DTO.v1.Mappers.TagMapper _mapper =
            new App.DTO.v1.Mappers.TagMapper();

        /// <summary>
        /// Constructor.
        /// </summary>
        /// <param name="bll">Business Logic.</param>
        public TagsController(IAppBLL bll)
        {
            _bll = bll;
        }

        /// <summary>
        /// Get all tags.
        /// </summary>
        /// <returns>List of tags.</returns>
        [Authorize(Roles = "admins,helpdesk_db_admins,members,pixels")]
        [HttpGet]
        [Produces("application/json")]
        [ProducesResponseType(typeof(IEnumerable<Tag>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Tag>>> GetTags()
        {
            var data = await _bll.TagService.AllAsync();
            var res = data.Select(t => _mapper.Map(t)!).OrderBy(t => t.TagName).ToList();
            return Ok(res);
        }

        /// <summary>
        /// Get a tag by id.
        /// </summary>
        /// <param name="id">The id of the tag.</param>
        /// <returns>The tag.</returns>
        [Authorize(Roles = "admins,helpdesk_db_admins,members,pixels")]
        [HttpGet("{id:guid}")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(Tag), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Tag>> GetTag(Guid id)
        {
            var tag = await _bll.TagService.FindAsync(id);
            if (tag == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map(tag)!);
        }

        /// <summary>
        /// Create a tag.
        /// </summary>
        /// <param name="tag">The tag to create.</param>
        /// <returns>The created tag.</returns>
        [Authorize(Roles = "admins,helpdesk_db_admins")]
        [HttpPost]
        [Consumes("application/json")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(Tag), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Tag>> PostTag(App.DTO.v1.CreateObjects.TagCreate tag)
        {
            var trimmed = tag.TagName.Trim();
            if (string.IsNullOrWhiteSpace(trimmed))
            {
                return BadRequest(new Message("Tag name cannot be empty."));
            }

            var existing = (await _bll.TagService.AllAsync())
                .FirstOrDefault(t => t.TagName.Equals(trimmed, StringComparison.OrdinalIgnoreCase));
            if (existing != null)
            {
                return BadRequest(new Message($"Tag '{trimmed}' already exists."));
            }

            tag.TagName = trimmed;
            var bllEntity = _mapper.Map(tag);
            await _bll.TagService.AddAsync(bllEntity);
            await _bll.SaveChangesAsync();

            var dtoTag = _mapper.Map(bllEntity)!;
            return CreatedAtAction("GetTag", new
            {
                id = bllEntity.Id,
                version = HttpContext.RequestedApiVersion!.ToString()
            }, dtoTag);
        }

        /// <summary>
        /// Update a tag.
        /// </summary>
        /// <param name="id">The id of the tag to update.</param>
        /// <param name="tag">The updated tag data.</param>
        /// <returns>A status indicating the result of the update operation.</returns>
        [Authorize(Roles = "admins,helpdesk_db_admins")]
        [HttpPut("{id:guid}")]
        [Consumes("application/json")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> PutTag(Guid id, Tag tag)
        {
            if (id != tag.Id)
            {
                return BadRequest();
            }

            var existing = await _bll.TagService.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            tag.TagName = tag.TagName.Trim();
            var nameTaken = (await _bll.TagService.AllAsync())
                .Any(t => t.Id != id && t.TagName.Equals(tag.TagName, StringComparison.OrdinalIgnoreCase));
            if (nameTaken)
            {
                return BadRequest(new Message($"Tag '{tag.TagName}' already exists."));
            }

            existing.TagName = tag.TagName;
            await _bll.TagService.UpdateAsync(existing);
            await _bll.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Delete a tag. Its asset links fall away with it.
        /// </summary>
        /// <param name="id">The id of the tag.</param>
        /// <returns>A status indicating the result of the delete operation.</returns>
        [Authorize(Roles = "admins,helpdesk_db_admins")]
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTag(Guid id)
        {
            var tag = await _bll.TagService.FindAsync(id);
            if (tag == null)
            {
                return NotFound();
            }

            var links = (await _bll.AssetTagService.AllAsync()).Where(at => at.TagId == id).ToList();
            foreach (var link in links)
            {
                await _bll.AssetTagService.RemoveAsync(link.Id);
            }

            await _bll.TagService.RemoveAsync(id);
            await _bll.SaveChangesAsync();

            return NoContent();
        }
    }
}
