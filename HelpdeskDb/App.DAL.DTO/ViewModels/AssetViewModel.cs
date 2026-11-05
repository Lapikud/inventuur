using System.ComponentModel.DataAnnotations;
using Base.Contracts;

namespace App.DAL.DTO.ViewModels;

public class AssetViewModel : IDomainId
{
    public Guid Id { get; set; } // asset id

    public string AssetName { get; set; } = default!;

    public string? SerialNumber { get; set; }

    public string? Barcode { get; set; }

    public string? Slug { get; set; }

    public Domain.AssetVisibility Visibility { get; set; } = Domain.AssetVisibility.Normal;

    public bool HasPhoto { get; set; }

    public DateTime? LastAuditAt { get; set; }

    public string? LastAuditBy { get; set; }

    public Guid? LocationId { get; set; }

    public List<string> Tags { get; set; } = [];

    public string? Comment { get; set; }

    public string CategoryName { get; set; } = default!;
    
    public string OwnerName { get; set; } = default!;
    
    public string RoomName { get; set; } = default!;
    
    public string CupboardName { get; set; } = default!;
    
    public int ShelfNum { get; set; }
    
    public int Column { get; set; }

    public string ClosestReservationBy { get; set; } = "-";

    public DateTime AddedAt { get; set; }
    
    public bool Reserved { get; set; } = false;

    public Guid? ReservationId { get; set; }

    public DateTime? ReservationTo { get; set; }
}