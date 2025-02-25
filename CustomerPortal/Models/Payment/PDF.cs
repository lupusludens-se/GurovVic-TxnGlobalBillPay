using System;

namespace CustomerPortal.Models.Payment
{
    public class PDF
    {
        public PDF()
        {
            Active = true;
            CreatedDate = DateTime.UtcNow;
        }

        public string Id { get; set; }
        public string Container { get; set; }
        public string Path { get; set; }
        public string FileName { get; set; }
        public string StoragePath { get; set; }
        public string StorageUrl { get; set; }

        //Version of file with Content-Disposition set to "Attachment"
        public string AttachmentPath { get; set; }
        public string AttachmentStoragePath { get; set; }
        public string AttachmentStorageUrl { get; set; }
        public bool Active { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime DrawingDate { get; set; }
    }
}
