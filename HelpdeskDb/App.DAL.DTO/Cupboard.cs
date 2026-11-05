using Base.Contracts;

namespace App.DAL.DTO;

public class Cupboard : IDomainId
{
    public Guid Id { get; set; }

    public string CodeName { get; set; } = default!;

    public Guid RoomId { get; set; }

    public Room? Room { get; set; }

    public ICollection<Location>? Locations { get; set; }
}
