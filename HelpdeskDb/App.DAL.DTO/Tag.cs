using Base.Contracts;

namespace App.DAL.DTO;

public class Tag : IDomainId
{
    public Guid Id { get; set; }

    public string TagName { get; set; } = default!;

    public ICollection<AssetTag>? AssetTags { get; set; }
}
