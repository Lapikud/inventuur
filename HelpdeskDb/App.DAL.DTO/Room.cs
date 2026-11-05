using Base.Contracts;

namespace App.DAL.DTO;

public class Room : IDomainId
{
    public Guid Id { get; set; }

    public string RoomName { get; set; } = default!;

    public string Comment { get; set; } = default!;

    public ICollection<Cupboard>? Cupboards { get; set; }

    public ICollection<Location>? Locations { get; set; }
}
