import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const VALID_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const SLUG_PATTERN = /^[a-z0-9-]+$/;

export async function POST(request: NextRequest) {
  try {

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const slug = formData.get('slug') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || !['profile', 'cover'].includes(type)) {
      return NextResponse.json({ error: 'Invalid image type. Must be "profile" or "cover"' }, { status: 400 });
    }

    if (!slug || !SLUG_PATTERN.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
    }

    if (!VALID_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 });
    }

    // Whitelist extension from filename
    const rawExt = file.name.split('.').pop()?.toLowerCase() || '';
    const fileExtension = VALID_EXTENSIONS.includes(rawExt) ? rawExt : 'webp';

    const timestamp = Date.now();
    const filePath = `places/${slug}/${type}-${timestamp}.${fileExtension}`;

    const admin = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from('place-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.info('[upload-image] Upload error:', uploadError.message);
      return NextResponse.json(
        { error: 'Failed to upload image', message: uploadError.message },
        { status: 500 }
      );
    }

    const { data: urlData } = admin.storage
      .from('place-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      size: file.size,
      type,
    });
  } catch (error) {
    console.info('[upload-image] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
