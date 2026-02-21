import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  // Avoid crashing in build; runtime will throw if used without creds
  console.warn('Cloudinary env vars are not fully set (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)')
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
})

export async function uploadImage(buffer: Buffer, folder: string = '3starfoods', options: UploadApiOptions = {}) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', ...options },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve(result)
      }
    )
    uploadStream.end(buffer)
  })
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}

export function getOptimizedUrl(publicId: string, width: number = 800, height?: number) {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'limit',
    fetch_format: 'auto',
    quality: 'auto'
  })
}

