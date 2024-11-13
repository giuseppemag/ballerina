using Microsoft.EntityFrameworkCore;
using Blogs;
// using Users;

namespace Migrations
{
  public class BloggingContext() : DbContext
  {
    public DbSet<Blog> Blogs { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<Lifestyle> LifestyleTags { get; set; }
    public DbSet<Interview> InterviewTags { get; set; }

    public DbSet<Users.User> Users { get; set; }
    public DbSet<Users.UserEvent> UserEvents { get; set; }
    public DbSet<Users.NewUserEvent> NewUserEvents { get; set; }
    public DbSet<Users.EmailConfirmedEvent> EmailConfirmedEvents { get; set; }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) =>

      optionsBuilder.UseNpgsql("User ID=postgres;Password=;Host=localhost;Port=5432;Database=blog;Pooling=true;Maximum Pool Size=50;");
    // , fun cfg -> cfg.MigrationsAssembly "migrations" |> ignore)
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.Entity<Tag>()
          .HasDiscriminator<string>("tag_type");
      modelBuilder.Entity<Users.UserEvent>()
          .HasDiscriminator<string>("user_event_type");
    }
  }
  // inherit DbContext()

}
