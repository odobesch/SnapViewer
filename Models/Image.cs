namespace SnapViewer.Models
{
    public class Image
    {
        public int Id { get; set; }
        public string Path { get; set; }
        public ICollection<Annotation> Annotations { get; set; }
    }
}
