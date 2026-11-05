using App.DAL.DTO;
using Base.Contracts;

namespace App.DAL.EF.Mappers;

public class LocationUOWMapper : IMapper<App.DAL.DTO.Location, App.Domain.Location>
{
    public Location? Map(Domain.Location? entity)
    {
        if (entity == null) return null;
        var res = new Location()
        {
            Id = entity.Id,
            LocationName = entity.LocationName,
            ShelfNum = entity.ShelfNum,
            Column = entity.Column,
            RoomId = entity.RoomId,
            Room = null,
            CupboardId = entity.CupboardId,
            Cupboard = null,
        };
        return res;
    }

    public Domain.Location? Map(Location? entity)
    {
        if (entity == null) return null;
        var res = new Domain.Location()
        {
            Id = entity.Id,
            LocationName = entity.LocationName,
            ShelfNum = entity.ShelfNum,
            Column = entity.Column,
            RoomId = entity.RoomId,
            Room = null,
            CupboardId = entity.CupboardId,
            Cupboard = null,
        };
        return res;
    }
}
