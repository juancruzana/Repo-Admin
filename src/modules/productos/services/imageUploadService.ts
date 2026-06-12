import { apiClient } from '../../../api/client';

// respuesta de POST /v1/uploads/producto/{id}/imagen (Cloudinary via backend)
export interface UploadImagenResponse {
  imagen_url: string;
  public_id: string;
  imagenes_url: string[];
}

export async function uploadImagenProducto(
  productoId: number,
  file: File
): Promise<UploadImagenResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<UploadImagenResponse>(
    `/v1/uploads/producto/${productoId}/imagen`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
}
