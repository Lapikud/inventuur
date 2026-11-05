using System.ComponentModel.DataAnnotations;
using Base.Domain.Identity;

namespace App.Domain.Identity;

public class AppUser : BaseUser<AppUserRole>
{
    /// <summary>
    /// First name from FreeIPA (givenname), shown in the UI instead of the
    /// username when available; falls back to the username otherwise.
    /// </summary>
    public string? DisplayName { get; set; }

    public ICollection<AssetReservation>? AssetReservations { get; set; }

    public ICollection<AppRefreshToken>? RefreshTokens { get; set; }
}