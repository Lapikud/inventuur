using App.DAL.EF;
using App.Domain;
using App.Domain.Identity;
using Microsoft.EntityFrameworkCore;

namespace WebApp;

public static class DataSeeder
{
    private const string RoleAdmins = "admins";
    private const string RoleMembers = "members";
    private const string RolePixels = "pixels";
    private const string RoleHelpdeskDbAdmins = "helpdesk_db_admins";

    public static async Task SeedRoles(this IApplicationBuilder applicationBuilder)
    {
        using IServiceScope serviceScope = applicationBuilder.ApplicationServices
            .GetRequiredService<IServiceScopeFactory>()
            .CreateScope();
        await using var context = serviceScope.ServiceProvider.GetRequiredService<AppDbContext>();
        await context.Database.MigrateAsync();

        var roles = new[] { RoleAdmins, RoleMembers, RolePixels, RoleHelpdeskDbAdmins };

        var rolesToAdd = new List<AppRole>();
        foreach (var roleName in roles)
        {
            var roleInDb = await context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
            if (roleInDb == null)
            {
                rolesToAdd.Add(new AppRole
                {
                    Name = roleName
                });
            }
        }

        await context.Roles.AddRangeAsync(rolesToAdd);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Seeds the org's real workspace structure so the first asset can be placed
    /// right away: the two rooms assets live between, the office cabinet with
    /// its 12 slots, and the organisation-level owner. Categories are NOT
    /// seeded — admins create the ones they actually use. Every step is guarded
    /// with an "only if empty" check so existing data is never clobbered.
    /// </summary>
    public static async Task SeedBaseData(this IApplicationBuilder applicationBuilder)
    {
        using IServiceScope serviceScope = applicationBuilder.ApplicationServices
            .GetRequiredService<IServiceScopeFactory>()
            .CreateScope();
        await using var context = scopeContext(serviceScope);
        await context.Database.MigrateAsync();

        if (!await context.Rooms.AnyAsync())
        {
            var kontor = new Room { RoomName = "Kontor", Comment = "Akadeemia tee 5" };
            var ladu = new Room { RoomName = "Ladu", Comment = "Küberneetika maja" };
            await context.Rooms.AddRangeAsync(kontor, ladu);

            // The office cabinet: 5 shelves x 4 columns of positions, named by
            // coordinates. The Ladu is a room of assorted cabinets — its
            // cupboards and locations are created by admins as needed.
            var kapp = new Cupboard { CodeName = "Kapp", Room = kontor };
            await context.Cupboards.AddAsync(kapp);

            for (var shelf = 1; shelf <= 5; shelf++)
            {
                for (var column = 1; column <= 4; column++)
                {
                    await context.Locations.AddAsync(new Location
                    {
                        LocationName = $"Kapp {shelf}x{column}",
                        ShelfNum = shelf,
                        Column = column,
                        Room = kontor,
                        Cupboard = kapp,
                    });
                }
            }
        }

        // Asset creation requires an owner; the organisation is the one that
        // owns everything nobody personally claims. Personal owners appear
        // automatically when their users first log in.
        if (!await context.Owners.AnyAsync())
        {
            await context.Owners.AddAsync(new Owner
            {
                OwnerName = "Lapikud",
                Comment = "Organisation",
            });
        }

        await context.SaveChangesAsync();
    }

    private static AppDbContext scopeContext(IServiceScope serviceScope) =>
        serviceScope.ServiceProvider.GetRequiredService<AppDbContext>();
}
