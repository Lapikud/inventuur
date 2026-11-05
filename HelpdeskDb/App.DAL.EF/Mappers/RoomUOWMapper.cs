using App.DAL.DTO;
using Base.Contracts;

namespace App.DAL.EF.Mappers;

public class RoomUOWMapper : IMapper<App.DAL.DTO.Room, App.Domain.Room>
{
    public Room? Map(Domain.Room? entity)
    {
        if (entity == null) return null;
        var res = new Room()
        {
            Id = entity.Id,
            RoomName = entity.RoomName,
            Comment = entity.Comment,
            Cupboards = entity.Cupboards?.Select(c => new Cupboard()
            {
                Id = c.Id,
                CodeName = c.CodeName,
                RoomId = c.RoomId,
                Room = null,
            }).ToList(),
            Locations = entity.Locations?.Select(l => new Location()
            {
                Id = l.Id,
                LocationName = l.LocationName,
                ShelfNum = l.ShelfNum,
                Column = l.Column,
                RoomId = l.RoomId,
                Room = null,
                CupboardId = l.CupboardId,
                Cupboard = null,
            }).ToList(),
        };
        return res;
    }

    public Domain.Room? Map(Room? entity)
    {
        if (entity == null) return null;
        var res = new Domain.Room()
        {
            Id = entity.Id,
            RoomName = entity.RoomName,
            Comment = entity.Comment,
            Cupboards = entity.Cupboards?.Select(c => new Domain.Cupboard()
            {
                Id = c.Id,
                CodeName = c.CodeName,
                RoomId = c.RoomId,
                Room = null,
            }).ToList(),
            Locations = entity.Locations?.Select(l => new Domain.Location()
            {
                Id = l.Id,
                LocationName = l.LocationName,
                ShelfNum = l.ShelfNum,
                Column = l.Column,
                RoomId = l.RoomId,
                Room = null,
                CupboardId = l.CupboardId,
                Cupboard = null,
            }).ToList(),
        };
        return res;
    }
}
