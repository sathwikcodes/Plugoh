INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-deliveries',
  'campaign-deliveries',
  false,
  52428800,
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm',
    'application/pdf',
    'application/zip', 'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;
