using SnapViewer.Repositories;

namespace SnapViewer.Services
{
    public class ImageService
    {
        private readonly string _imageDirectory;
        private readonly ImageRepository _imageRepository;
        private readonly ILogger<ImageService> _logger;

        public ImageService(IConfiguration configuration, ImageRepository imageRepository, ILogger<ImageService> logger)
        {
            _imageDirectory = configuration["ImageDirectory"];            
            _imageRepository = imageRepository;
            _logger = logger;
        }

        public IEnumerable<string> GetImagePaths()
        {
            var files = Directory.GetFiles(_imageDirectory);
            return files.Select(file => Path.Combine("/images", Path.GetFileName(file)));
        }

        public async Task InitializeImagesAsync()
        {
            var imagePathsFromRoot = GetImagePaths().ToList();
            await _imageRepository.InitializeImagesAsync(imagePathsFromRoot);
        }

        public async Task<List<Models.Image>> GetAllImagesAsync()
        {
            return await _imageRepository.GetAllImagesAsync();
        }  
    }
}
