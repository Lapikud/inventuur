using App.Domain;
using App.Domain.Identity;
using Base.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace App.DAL.EF;

public class AppDbContext : DbContext
{
    public DbSet<Category> Categories { get; set; } = default!;
    public DbSet<CategoryAssets> CategoryAssetsCollection { get; set; } = default!;
    public DbSet<Cupboard> Cupboards { get; set; } = default!;
    public DbSet<Location> Locations { get; set; } = default!;
    public DbSet<Owner> Owners { get; set; } = default!;
    public DbSet<OwnerAssets> OwnerAssets { get; set; } = default!;
    public DbSet<Asset> Assets { get; set; } = default!;
    public DbSet<Room> Rooms { get; set; } = default!;

    public DbSet<RemovedAssets> RemovedAssetsCollection { get; set; } = default!;
    public DbSet<AssetReservation> AssetReservations { get; set; } = default!;
    public DbSet<Tag> Tags { get; set; } = default!;
    public DbSet<AssetTag> AssetTags { get; set; } = default!;
    public DbSet<AssetPhoto> AssetPhotos { get; set; } = default!;
    public DbSet<AppUser> Users { get; set; } = default!;
    public DbSet<AppRole> Roles { get; set; } = default!;
    public DbSet<AppUserRole> UserRoles { get; set; } = default!;
    public DbSet<AppRefreshToken> RefreshTokens { get; set; } = default!;

    private readonly IUserNameResolver _userNameResolver;
    private readonly ILogger<AppDbContext> _logger;

    public AppDbContext(DbContextOptions<AppDbContext> options, IUserNameResolver userNameResolver,
        ILogger<AppDbContext> logger
    )
        : base(options)
    {
        _userNameResolver = userNameResolver;
        _logger = logger;
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // remove cascade delete
        foreach (var relationship in builder.Model
                     .GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }


        builder.Entity<AppUserRole>().HasKey(a => a.Id);
        builder.Entity<AppUserRole>().HasIndex(a => new { a.UserId, a.RoleId }).IsUnique();

        builder.Entity<AppUserRole>()
            .HasOne(a => a.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(a => a.UserId);

        builder.Entity<AppUserRole>()
            .HasOne(a => a.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(a => a.RoleId);

        // Asset Configuration
        builder.Entity<Asset>(b =>
        {
            b.HasKey(a => a.Id);
            // b.HasIndex(a => a.AssetName);
            // b.HasIndex(a => a.LastTakenBy);
            b.HasIndex(a => a.Slug).IsUnique();
            b.Property(a => a.Slug).HasMaxLength(16);
            b.Property(a => a.Visibility).HasConversion<string>().HasMaxLength(16)
                .HasDefaultValue(AssetVisibility.Normal);
            b.Property(a => a.LastAuditBy).HasMaxLength(64);
            b.Property(a => a.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(a => a.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Category Configuration
        builder.Entity<Category>(b =>
        {
            b.HasKey(c => c.Id);
            // b.HasIndex(c => c.CategoryName).IsUnique();
            b.Property(c => c.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(c => c.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Cupboard Configuration
        builder.Entity<Cupboard>(b =>
        {
            b.HasKey(c => c.Id);
            // b.HasIndex(c => c.CodeName).IsUnique();
            b.Property(o => o.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(o => o.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Room Configuration
        builder.Entity<Room>(b =>
        {
            b.HasKey(r => r.Id);
            // b.HasIndex(r => r.RoomName).IsUnique();
            b.Property(o => o.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(o => o.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Owner Configuration
        builder.Entity<Owner>(b =>
        {
            b.HasKey(o => o.Id);
            // b.HasIndex(o => o.OwnerName).IsUnique();
            b.Property(o => o.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(o => o.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Location Configuration
        builder.Entity<Location>(b =>
        {
            b.HasKey(l => l.Id);
            // b.HasIndex(o => o.OwnerName).IsUnique();
            b.Property(l => l.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(l => l.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Junction Table Configurations
        ConfigureJunctionTables(builder);

        // Tag Configuration
        builder.Entity<Tag>(b =>
        {
            b.HasKey(t => t.Id);
            b.HasIndex(t => t.TagName).IsUnique();
            b.Property(t => t.TagName).HasMaxLength(32);
            b.Property(t => t.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(t => t.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // AssetPhoto Configuration
        builder.Entity<AssetPhoto>(b =>
        {
            b.HasKey(p => p.Id);
            b.HasIndex(p => p.AssetId).IsUnique();
            b.Property(p => p.ContentType).HasMaxLength(64);
            b.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(p => p.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
    }

    private void ConfigureJunctionTables(ModelBuilder builder)
    {
        // CategoryAssets
        builder.Entity<CategoryAssets>(b =>
        {
            b.HasOne(ca => ca.Category)
                .WithMany(c => c.CategoryAssetsCollection)
                .HasForeignKey(ca => ca.CategoryId);

            b.HasOne(ca => ca.Asset)
                .WithMany(a => a.CategoryAssetsCollection)
                .HasForeignKey(ca => ca.AssetId);

            b.HasIndex(ca => new { ca.CategoryId, ca.AssetId }).IsUnique();
            b.Property(ca => ca.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(ca => ca.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Cupboard → Room: direct FK, no junction.
        builder.Entity<Cupboard>(b =>
        {
            b.HasOne(c => c.Room)
                .WithMany(r => r.Cupboards)
                .HasForeignKey(c => c.RoomId);

            b.HasIndex(c => c.CodeName);
        });

        // Location → Room (required) and Location → Cupboard (optional):
        // direct FKs, no junctions. An optional cupboard lets room-level
        // spots exist ("Ladu — vaba pind"); the room consistency between
        // the two FKs is enforced by the app, not the database.
        builder.Entity<Location>(b =>
        {
            b.HasOne(l => l.Room)
                .WithMany(r => r.Locations)
                .HasForeignKey(l => l.RoomId);

            b.HasOne(l => l.Cupboard)
                .WithMany(c => c.Locations)
                .HasForeignKey(l => l.CupboardId);

            b.HasIndex(l => l.LocationName);
            b.Property(l => l.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(l => l.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Asset → Location: direct optional FK — placing an asset is one
        // column, the room/cupboard names resolve through the join.
        builder.Entity<Asset>(b =>
        {
            b.HasOne(a => a.Location)
                .WithMany()
                .HasForeignKey(a => a.LocationId);

            b.HasIndex(a => a.LocationId);
        });

        // OwnerAssets
        builder.Entity<OwnerAssets>(b =>
        {
            b.HasOne(oa => oa.Owner)
                .WithMany(o => o.OwnerAssets)
                .HasForeignKey(oa => oa.OwnerId);

            b.HasOne(oa => oa.Asset)
                .WithMany(a => a.OwnerAssets)
                .HasForeignKey(oa => oa.AssetId);

            b.HasKey(oa => oa.Id);
            b.HasIndex(oa => new { oa.OwnerId, oa.AssetId }).IsUnique();
            b.Property(oa => oa.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(oa => oa.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // RemovedAssets
        builder.Entity<RemovedAssets>(b =>
        {
            b.HasOne(ra => ra.Asset)
                .WithMany(a => a.RemovedAssetsCollection)
                .HasForeignKey(ra => ra.AssetId);

            b.HasKey(ra => ra.Id);
            b.HasIndex(ua => new { ua.AssetId }).IsUnique();
            b.Property(ra => ra.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(ra => ra.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // AssetReservation
        builder.Entity<AssetReservation>(b =>
        {
            b.HasOne(ar => ar.User)
                .WithMany(a => a.AssetReservations)
                .HasForeignKey(ar => ar.UserId);

            b.HasOne(ar => ar.Asset)
                .WithMany(a => a.AssetReservations)
                .HasForeignKey(ar => ar.AssetId);

            b.HasKey(ar => ar.Id);

            b.Property(ar => ar.ReservationFrom)
                .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
            b.Property(ar => ar.ReservationTo)
                .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            b.Property(ar => ar.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(ar => ar.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // AssetTag
        builder.Entity<AssetTag>(b =>
        {
            b.HasOne(at => at.Tag)
                .WithMany(t => t.AssetTags)
                .HasForeignKey(at => at.TagId);

            b.HasOne(at => at.Asset)
                .WithMany(a => a.AssetTags)
                .HasForeignKey(at => at.AssetId);

            b.HasKey(at => at.Id);
            b.HasIndex(at => new { at.AssetId, at.TagId }).IsUnique();
            b.Property(at => at.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            b.Property(at => at.ChangedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // AssetPhoto
        builder.Entity<AssetPhoto>(b =>
        {
            b.HasOne(p => p.Asset)
                .WithOne(a => a.AssetPhoto)
                .HasForeignKey<AssetPhoto>(p => p.AssetId);

            b.HasKey(p => p.Id);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        var addedEntries = ChangeTracker.Entries();
        foreach (var entry in addedEntries)
        {
            if (entry is { Entity: IDomainMeta })
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        (entry.Entity as IDomainMeta)!.CreatedAt = DateTime.UtcNow;
                        (entry.Entity as IDomainMeta)!.CreatedBy = _userNameResolver.CurrentUserName;
                        break;
                    case EntityState.Modified:
                        entry.Property("ChangedAt").IsModified = true;
                        entry.Property("ChangedBy").IsModified = true;
                        (entry.Entity as IDomainMeta)!.ChangedAt = DateTime.UtcNow;
                        (entry.Entity as IDomainMeta)!.ChangedBy = _userNameResolver.CurrentUserName;

                        // Prevent overwriting CreatedBy/CreatedAt on update
                        entry.Property("CreatedAt").IsModified = false;
                        entry.Property("CreatedBy").IsModified = false;
                        break;
                }
            }

            if (entry is { Entity: IDomainUserId, State: EntityState.Modified })
            {
                // do not allow userid modification
                entry.Property("UserId").IsModified = false;
                _logger.LogWarning("UserId modification attempt. Denied!");
            }
        }


        return base.SaveChangesAsync(cancellationToken);
    }
}