using Base.Contracts;

namespace App.BLL.DTO;

public class AssetTag : IDomainId
{
    public Guid Id { get; set; }

    public Guid AssetId { get; set; }

    public Asset? Asset { get; set; }

    public Guid TagId { get; set; }

    public Tag? Tag { get; set; }
}
