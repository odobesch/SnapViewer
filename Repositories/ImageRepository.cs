using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SnapViewer.Data;
using SnapViewer.Models;

namespace SnapViewer.Repositories
{
    public class ImageRepository
    {
        private readonly ApplicationDbContext _context;

        public ImageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }

        public async Task<List<Image>> GetAllImagesAsync()
        {
            return await _context.Images.ToListAsync();
        }
        
        public async Task<Image> GetImageByIdAsync(int id)
        {
            return await _context.Images.FindAsync(id);
        }

        public async Task<Image> GetImageByPathAsync(string imagePath)
        {
            return await _context.Images.FirstOrDefaultAsync(i => i.Path == imagePath);
        }
        
        public async Task<Image> AddImageAsync(string imagePath)
        {
            var image = new Image { Path = imagePath };
            _context.Images.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task InitializeImagesAsync(List<string> imagePaths)
        {
            foreach (var imagePath in imagePaths)
            {
                var existingImage = await GetImageByPathAsync(imagePath);
                if (existingImage == null)
                {
                    await AddImageAsync(imagePath);
                }
            }
        }

        public async Task<List<Annotation>> GetAnnotationsByImageIdAsync(int imageId)
        {
            var annotations = await _context.Annotations
                .Where(a => a.ImageId == imageId)
                .ToListAsync();

            Console.WriteLine($"Retrieved {annotations.Count} annotations for ImageId: {imageId}");

            return annotations;
        }
        
        public async Task UpdateImageAsync(Image image)
        {
            _context.Images.Update(image);
            await _context.SaveChangesAsync();
        }
        
        public async Task DeleteImageAsync(int id)
        {
            var image = await GetImageByIdAsync(id);
            if (image != null)
            {
                _context.Images.Remove(image);
                await _context.SaveChangesAsync();
            }
        }
        public async Task AddAnnotationAsync(Annotation annotation)
        {           
            var imageExists = await _context.Images.AnyAsync(i => i.Id == annotation.ImageId);
            if (!imageExists)
            {
                throw new Exception($"Image with ID {annotation.ImageId} does not exist.");
            }
           
            _context.Annotations.Add(annotation);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateAnnotationAsync(Annotation annotation)
        {
            var existingAnnotation = await _context.Annotations.FindAsync(annotation.Id);
            if (existingAnnotation != null)
            {
                existingAnnotation.X = annotation.X;
                existingAnnotation.Y = annotation.Y;
                existingAnnotation.Width = annotation.Width;
                existingAnnotation.Height = annotation.Height;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAnnotationAsync(int annotationId)
        {
            var annotation = await _context.Annotations.FindAsync(annotationId);
            if (annotation != null)
            {
                _context.Annotations.Remove(annotation);
                await _context.SaveChangesAsync();
            }
        }
    }
}
