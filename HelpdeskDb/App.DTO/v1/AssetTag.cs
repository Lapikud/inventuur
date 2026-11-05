using System.ComponentModel.DataAnnotations;
using Base.Contracts;
using Base.Resources.Errors;

namespace App.DTO.v1;

public class AssetTag : IDomainId
{
    public Guid Id { get; set; }

    public Guid AssetId { get; set; }

    public Guid TagId { get; set; }
}
