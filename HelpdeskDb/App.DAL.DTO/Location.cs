using Base.Contracts;

namespace App.DAL.DTO;

public class Location : IDomainId
{
    public Guid Id { get; set; }

    public string LocationName { get; set; } = default!;

    public int ShelfNum { get; set; }

    public int Column { get; set; }

    public Guid RoomId { get; set; }

    public Room? Room { get; set; }

    public Guid? CupboardId { get; set; }

    public Cupboard? Cupboard { get; set; }
}
