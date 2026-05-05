export function getImageUrl(src) {
  if (!src) return "";
  if (src.startsWith("/uploads/")) {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    // Remove '/api' from the end of the URL
    const baseUrl = apiUrl.replace(/\/api\/?$/, "");
    return `${baseUrl}${src}`;
  }
  return src;
}
