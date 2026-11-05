using Base.Contracts;

namespace App.DAL.DTO;

public class AssetPhoto : IDomainId
{
    public Guid Id { get; set; }

    public Guid AssetId { get; set; }

    public Asset? Asset { get; set; }

    public byte[] Content { get; set; } = [];

    public string ContentType { get; set; } = "image/jpeg";
}
