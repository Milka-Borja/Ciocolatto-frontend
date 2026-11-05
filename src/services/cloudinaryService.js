// Reemplaza con tus valores de Cloudinary
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryService = {
  
  subirImagen: async (file) => {
    if (!file) throw new Error('No se ha seleccionado ningún archivo.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error al subir imagen a Cloudinary');
    }

    const data = await response.json();
    return data.secure_url; // URL https://res.cloudinary.com/...
  },
};

export default cloudinaryService;