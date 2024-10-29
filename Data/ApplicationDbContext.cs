using Microsoft.EntityFrameworkCore;
using SnapViewer.Models;

namespace SnapViewer.Data
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Image> Images { get; set; }
        public DbSet<Annotation> Annotations { get; set; }
        
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Annotation>()
                .HasOne(a => a.Image)
                .WithMany(i => i.Annotations)
                .HasForeignKey(a => a.ImageId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
