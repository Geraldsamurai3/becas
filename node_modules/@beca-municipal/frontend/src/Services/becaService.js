// becaService.js - Con validación de variable de entorno
const BASE_URL = import.meta.env.VITE_API_URL;

// Validar que la variable de entorno esté configurada
if (!BASE_URL) {

  throw new Error('Variable de entorno VITE_API_URL no configurada');
}

const joinUrl = (base, path) => {
  // Validación adicional por seguridad
  if (!base) {
    throw new Error('BASE_URL no está definida');
  }
  if (!path) {
    return base;
  }
  return `${base.replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
};

async function request(path, { method = 'GET', body = null, headers = {}, credentials = 'omit' } = {}) {
  const url = joinUrl(BASE_URL, path);

  const finalHeaders = body instanceof FormData
    ? headers                                 // NO pongas Content-Type para FormData
    : { 'Content-Type': 'application/json', ...headers };

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    credentials,
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  if (!res.ok) {
    let err;
    try { err = await res.json(); } catch { /* ignore */ }
    throw new Error(err?.message || `Error ${res.status}`);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}

// Exporta el cliente
export const becaService = {
  submitSolicitud: (formData) => request('beca/solicitud', { method: 'POST', body: formData }),

  // utilidades para el hook
  validateFile: (file, maxSize = 10) => {
    const allowed = [
      'application/pdf','image/jpeg','image/jpg','image/png',
      'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const max = maxSize * 1024 * 1024;
    if (!allowed.includes(file.type)) throw new Error('Tipo de archivo no permitido.');
    if (file.size > max) throw new Error(`Máximo ${maxSize}MB.`);
    return true;
  },
  getFilePreview: (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve({ name:file.name, size:file.size, type:file.type, preview:e.target.result });
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    if (file.type.startsWith('image/')) reader.readAsDataURL(file);
    else resolve({ name:file.name, size:file.size, type:file.type, preview:null });
  }),
};

