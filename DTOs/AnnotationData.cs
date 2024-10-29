using System.Text.Json.Serialization;

namespace SnapViewer.DTOs
{
    public class AnnotationData
    {
        public int Id { get; set; }
        public int ImageId { get; set; }
        public decimal X { get; set; }
        public decimal Y { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
    }
}
