using App.DAL.DTO;
using Base.Contracts;

namespace App.BLL.Mappers;

public class CupboardBLLMapper : IMapper<App.BLL.DTO.Cupboard, App.DAL.DTO.Cupboard>
{
    public App.DAL.DTO.Cupboard? Map(App.BLL.DTO.Cupboard? entity)
    {
        if (entity == null) return null;

        return new App.DAL.DTO.Cupboard()
        {
            Id = entity.Id,
            CodeName = entity.CodeName,
            RoomId = entity.RoomId,
            Room = null,
            Locations = entity.Locations?.Select(l => new App.DAL.DTO.Location()
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
    }

    public App.BLL.DTO.Cupboard? Map(App.DAL.DTO.Cupboard? entity)
    {
        if (entity == null) return null;

        return new App.BLL.DTO.Cupboard()
        {
            Id = entity.Id,
            CodeName = entity.CodeName,
            RoomId = entity.RoomId,
            Room = null,
            Locations = entity.Locations?.Select(l => new App.BLL.DTO.Location()
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
    }
}
