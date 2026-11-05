using App.DAL.DTO;
using Base.Contracts;

namespace App.BLL.Mappers;

public class LocationBLLMapper : IMapper<App.BLL.DTO.Location, App.DAL.DTO.Location>
{
    public App.DAL.DTO.Location? Map(App.BLL.DTO.Location? entity)
    {
        if (entity == null) return null;

        return new App.DAL.DTO.Location()
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
    }

    public App.BLL.DTO.Location? Map(App.DAL.DTO.Location? entity)
    {
        if (entity == null) return null;

        return new App.BLL.DTO.Location()
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
    }
}
