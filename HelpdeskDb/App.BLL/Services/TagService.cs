using App.BLL.Contracts;
using App.BLL.DTO;
using App.DAL.Contracts;
using Base.BLL;
using Base.Contracts;
using Base.DAL.Contracts;

namespace App.BLL.Services;

public class TagService : BaseService<App.BLL.DTO.Tag, App.DAL.DTO.Tag, App.DAL.Contracts.ITagRepository>,
    ITagService
{
    public TagService(
        IAppUOW serviceUOW,
        IMapper<Tag, DAL.DTO.Tag> mapper) : base(serviceUOW, serviceUOW.TagRepository, mapper)
    {
    }
}
