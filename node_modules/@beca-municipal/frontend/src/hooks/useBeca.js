import { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { becaService } from '../services/becaService';

export function useBeca() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  const [files,        setFiles]        = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [fileErrors,   setFileErrors]   = useState({});

  const formConfig = useForm({
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      nombre: '',
      cedula: '',
      edad: '',
      genero: '',
      correo: '',
      telefono: '',
      nacimiento: '',
      anio: '',
      otra_beca: '',
      ocupacion: '',
      distrito: '',
      direccion: '',
      centro: '',
      correo_centro: '',
      director: '',
      encargado: '',
      distrito_centro: '',
      direccion_centro: '',
      vulnerabilidad: '',
      firma: '',
      nf_miembros: [
        {
          nombre: '',
          cedula: '',
          edad: '',
          parentesco: '',
          escolaridad: '',
          ocupacion: '',
          trabajo: '',
          ingreso: '',
          telefono: '',
          correo: '',
        },
      ],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = formConfig;

  const { fields, append, remove } = useFieldArray({ control, name: 'nf_miembros' });

  const requiredFiles = [
    { key: 'cedula_file',   label: 'Copia de cédula' },
    { key: 'notas_file',    label: 'Notas de Calificación' },
    { key: 'constancia_file', label: 'Constancia de estudios' },
    { key: 'foto_file',     label: 'Foto tamaño pasaporte' },
    { key: 'iban_file',     label: 'Constancia del banco (IBAN)' },
    { key: 'sinirube_file', label: 'Reporte SINIRUBE' },
    { key: 'jurada_file',   label: 'Declaración jurada de no recibir otra beca' },
  ];

  const handleFileChange = useCallback(async (fieldName, file) => {
    try {
      setFileErrors((prev) => { const p = { ...prev }; delete p[fieldName]; return p; });

      if (!file) {
        setFiles((prev) => { const p = { ...prev }; delete p[fieldName]; return p; });
        setFilePreviews((prev) => { const p = { ...prev }; delete p[fieldName]; return p; });
        return;
      }

      becaService.validateFile(file);
      const preview = await becaService.getFilePreview(file);

      setFiles((prev) => ({ ...prev, [fieldName]: file }));
      setFilePreviews((prev) => ({ ...prev, [fieldName]: preview }));
    } catch (err) {
      setFileErrors((prev) => ({ ...prev, [fieldName]: err.message }));
    }
  }, []);

  const removeFile = useCallback((fieldName) => {
    setFiles((prev) => { const p = { ...prev }; delete p[fieldName]; return p; });
    setFilePreviews((prev) => { const p = { ...prev }; delete p[fieldName]; return p; });
    setFileErrors((prev) => { const p = { ...prev }; delete p[fieldName]; return p; });
  }, []);

  const addFamilyMember = useCallback(() => {
    append({
      nombre: '', cedula: '', edad: '', parentesco: '',
      escolaridad: '', ocupacion: '', trabajo: '',
      ingreso: '', telefono: '', correo: '',
    });
  }, [append]);

  const removeFamilyMember = useCallback((index) => {
    if (fields.length > 1) remove(index);
  }, [remove, fields.length]);

  const ensureFilename = (fieldKey, file) => {
    const extFromName = (file.name.match(/\.[^.]+$/)?.[0] || '').toLowerCase();
    const extFromMime = ({
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/jpg' : '.jpg',
      'image/png' : '.png',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    })[file.type] || '';
    const ext = extFromName || extFromMime || '';
    return `${fieldKey}${ext}`;
  };

  const submitSolicitud = useCallback(async (values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const missing = requiredFiles.filter(f => !files[f.key]);
      if (missing.length) {
        throw new Error(`Faltan los siguientes archivos: ${missing.map(m => m.label).join(', ')}`);
      }

      const fd = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key === 'nf_miembros') return;
        fd.append(key, String(value ?? ''));
      });

      if (Array.isArray(values.nf_miembros)) {
        values.nf_miembros.forEach((m) => {
          fd.append('nf_nombre',       String(m?.nombre ?? ''));
          fd.append('nf_cedula',       String(m?.cedula ?? ''));
          fd.append('nf_edad',         String(m?.edad ?? ''));
          fd.append('nf_parentesco',   String(m?.parentesco ?? ''));
          fd.append('nf_escolaridad',  String(m?.escolaridad ?? ''));
          fd.append('nf_ocupacion',    String(m?.ocupacion ?? ''));
          fd.append('nf_trabajo',      String(m?.trabajo ?? ''));
          fd.append('nf_ingreso',      String(m?.ingreso ?? ''));
          fd.append('nf_telefono',     String(m?.telefono ?? ''));
          fd.append('nf_correo',       String(m?.correo ?? ''));
        });
      }

      Object.entries(files).forEach(([fieldKey, file]) => {
        fd.append('files', file, ensureFilename(fieldKey, file));
      });

      const res = await becaService.submitSolicitud(fd);
      setSuccess(true);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [files, requiredFiles]);

  const resetForm = useCallback(() => {
    reset();
    setFiles({});
    setFilePreviews({});
    setFileErrors({});
    setError(null);
    setSuccess(false);
  }, [reset]);

  const validateRequiredFiles = useCallback(() => {
    const missing = requiredFiles.filter(f => !files[f.key]).map(f => f.label);
    return { isValid: missing.length === 0, missingFiles: missing };
  }, [files, requiredFiles]);

  return {
    loading, error, success,

    register, control, handleSubmit: handleSubmit(submitSolicitud), errors, watch, setValue,

    fields, addFamilyMember, removeFamilyMember,

    files, filePreviews, fileErrors, handleFileChange, removeFile, requiredFiles, validateRequiredFiles,

    submitSolicitud,
    resetForm,
  };
}
