using App.DAL.DTO;
using Base.Contracts;

namespace App.DAL.EF.Mappers;

public class CupboardUOWMapper : IMapper<App.DAL.DTO.Cupboard, App.Domain.Cupboard>
{
    public Cupboard? Map(Domain.Cupboard? entity)
    {
        if (entity == null) return null;
        var res = new Cupboard()
        {
            Id = entity.Id,
            CodeName = entity.CodeName,
            RoomId = entity.RoomId,
            Room = null,
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

    public Domain.Cupboard? Map(Cupboard? entity)
    {
        if (entity == null) return null;
        var res = new Domain.Cupboard()
        {
            Id = entity.Id,
            CodeName = entity.CodeName,
            RoomId = entity.RoomId,
            Room = null,
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
