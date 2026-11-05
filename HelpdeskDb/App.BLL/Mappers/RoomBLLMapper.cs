using App.DAL.DTO;
using Base.Contracts;

namespace App.BLL.Mappers;

public class RoomBLLMapper : IMapper<App.BLL.DTO.Room, App.DAL.DTO.Room>
{
    public App.DAL.DTO.Room? Map(App.BLL.DTO.Room? entity)
    {
        if (entity == null) return null;

        return new App.DAL.DTO.Room()
        {
            Id = entity.Id,
            RoomName = entity.RoomName,
            Comment = entity.Comment,
            Cupboards = entity.Cupboards?.Select(c => new App.DAL.DTO.Cupboard()
            {
                Id = c.Id,
                CodeName = c.CodeName,
                RoomId = c.RoomId,
                Room = null,
            }).ToList(),
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

    public App.BLL.DTO.Room? Map(App.DAL.DTO.Room? entity)
    {
        if (entity == null) return null;

        return new App.BLL.DTO.Room()
        {
            Id = entity.Id,
            RoomName = entity.RoomName,
            Comment = entity.Comment,
            Cupboards = entity.Cupboards?.Select(c => new App.BLL.DTO.Cupboard()
            {
                Id = c.Id,
                CodeName = c.CodeName,
                RoomId = c.RoomId,
                Room = null,
            }).ToList(),
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
