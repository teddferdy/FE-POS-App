export const optimizeImage = (url, width = 200) => {
  if (!url?.includes('res.cloudinary.com')) return url
  return url.replace('/upload/', `/upload/w_${width},q_80/`)
}
