using Microsoft.EntityFrameworkCore;
// using Users;

namespace Migrations
{
  public class BallerinaContext : DbContext
  {
    public DbSet<Users.User> Users { get; set; }
    public DbSet<Users.UserEvent> UserEvents { get; set; }
    public DbSet<Users.NewUserEvent> NewUserEvents { get; set; }
    public DbSet<Users.EmailConfirmedEvent> EmailConfirmedEvents { get; set; }

    public DbSet<absample.models.AB> ABs { get; set; }
    public DbSet<absample.efmodels.ABEvent> ABEvents { get; set; }
    public DbSet<absample.efmodels.AEvent> AEvents { get; set; }
    public DbSet<absample.efmodels.BEvent> BEvents { get; set; }

    public BallerinaContext(DbContextOptions<BallerinaContext> options)
        : base(options) { }

    // protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) =>
    //   optionsBuilder.UseNpgsql("User ID=postgres;Password=;Host=localhost;Port=5432;Database=ballerina;Pooling=true;Maximum Pool Size=50");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.Entity<Users.UserEvent>()
          .HasDiscriminator<string>("user_event_type");
      modelBuilder.Entity<absample.efmodels.ABEvent>()
          .HasDiscriminator<string>("abevent_type");
    }
  }
  // inherit DbContext()

}
