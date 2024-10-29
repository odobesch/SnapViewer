using System.Text.Json.Serialization;

namespace SnapViewer.Models
{
    public class Annotation
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("imageId")]
        public int ImageId { get; set; }

        [JsonPropertyName("x")]
        public decimal X { get; set; }

        [JsonPropertyName("y")]
        public decimal Y { get; set; }

        [JsonPropertyName("width")]
        public decimal Width { get; set; }

        [JsonPropertyName("height")]
        public decimal Height { get; set; }

        [JsonIgnore]
        public Image Image { get; set; }
    }
}
