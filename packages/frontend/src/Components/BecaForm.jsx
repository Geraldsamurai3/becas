import React from 'react';
import {
  Plus, Trash2, Upload, Send, User, Users, School, AlertTriangle,
  FileText, X, Check, Star, Shield, BookOpen, Heart
} from 'lucide-react';
import { useBeca } from '../hooks/useBeca';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  if (isNaN(birth.getTime())) return '';
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  if (age < 0 || age > 120) return '';
  
  return age;
};

const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success'
    ? 'bg-gradient-to-r from-green-600 to-emerald-700'
    : 'bg-gradient-to-r from-red-600 to-rose-700';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm border border-white/20 animate-in slide-in-from-top-2 duration-300`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-4 text-white/80 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const BecaForm = () => {
  const {
    register, handleSubmit, errors, watch, setValue,
    fields, addFamilyMember, removeFamilyMember,
    files, filePreviews, fileErrors, handleFileChange, removeFile, requiredFiles,
    loading, success, error,
  } = useBeca();

  const fechaNacimiento = watch('nacimiento');
  
  React.useEffect(() => {
    if (fechaNacimiento) {
      const edad = calculateAge(fechaNacimiento);
      if (edad !== '') {
        setValue('edad', edad);
      }
    }
  }, [fechaNacimiento, setValue]);

  const [toast, setToast] = React.useState(null);
  React.useEffect(() => {
    if (success) setToast({ message: '¡Solicitud enviada correctamente!', type: 'success' });
  }, [success]);
  React.useEffect(() => {
    if (error) setToast({ message: error?.message || 'Error al enviar la solicitud', type: 'error' });
  }, [error]);

  const FileUploadComponent = ({ fieldKey, label, required = true }) => (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label} {required && <span className="text-rose-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => handleFileChange(fieldKey, e.target.files?.[0] || null)}
          className="hidden"
          id={fieldKey}
        />
        <label
          htmlFor={fieldKey}
          className={`relative flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
            files[fieldKey]
              ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50'
              : 'border-gray-300 hover:border-green-600 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100'
          } group-hover:scale-[1.02] group-hover:shadow-lg`}
        >
          <div className={`p-3 rounded-full mb-4 transition-colors duration-300 ${
            files[fieldKey]
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-gray-100 text-gray-400 group-hover:bg-green-100 group-hover:text-green-700'
          }`}>
            {files[fieldKey] ? <Check size={24} /> : <Upload size={24} />}
          </div>
          <span className={`text-sm font-medium transition-colors duration-300 ${
            files[fieldKey] ? 'text-emerald-700' : 'text-gray-600 group-hover:text-green-700'
          }`}>
            {files[fieldKey] ? 'Archivo seleccionado' : 'Seleccionar archivo'}
          </span>
          <span className="text-xs text-gray-500 mt-1">PDF, DOC, JPG, PNG (máx. 10MB)</span>
        </label>
      </div>

      {/* Preview del archivo */}
      {files[fieldKey] && (
        <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 truncate max-w-48">{files[fieldKey]?.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(files[fieldKey]?.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(fieldKey)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Error del archivo */}
      {fileErrors[fieldKey] && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-300">
          <p className="text-red-600 text-sm flex items-center">
            <AlertTriangle size={16} className="mr-2" />
            {fileErrors[fieldKey]}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 relative overflow-hidden">
      {/* Background decorations con colores de la bandera */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full opacity-15 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400 to-green-500 rounded-full opacity-15 animate-pulse"></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-yellow-300 rounded-full opacity-8"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-green-400 rounded-full opacity-8"></div>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Header Municipal */}
          <div className="relative mb-12">
            {/* Fondo con colores de la bandera de Santa Cruz */}
            <div className="bg-gradient-to-b from-yellow-400 via-yellow-500 to-green-600 rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
              <div className="relative p-8 sm:p-12 text-center">
                
                {/* Escudo oficial de la municipalidad */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    {/* Contenedor del escudo oficial */}
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                      <img 
                        src="/public/Logo.png" 
                        alt="Escudo Municipalidad de Santa Cruz" 
                        className="w-28 h-28 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      {/* Fallback icon si no se encuentra la imagen */}
                      <div className="w-28 h-28 flex items-center justify-center" style={{display: 'none'}}>
                        <Shield className="w-20 h-20 text-green-700" />
                      </div>
                    </div>
                    
                    {/* Decoración limpia */}
                    <div className="absolute -inset-3 border-4 border-white rounded-full animate-pulse opacity-80"></div>
                    <div className="absolute -inset-1 border-2 border-white/50 rounded-full"></div>
                  </div>
                </div>
                
                {/* Títulos oficiales */}
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-wide drop-shadow-lg">
                  MUNICIPALIDAD DE SANTA CRUZ
                </h1>
                
                {/* Panel principal de la solicitud */}
                <div className="bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-2xl p-8 mt-8 shadow-xl">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-wide drop-shadow-lg">
                    SOLICITUD DE BECA ESTUDIANTIL
                  </h2>
                 
                </div>
                                
                
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-12">

            {/* 1. DATOS DEL SOLICITANTE */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">1. Datos del Solicitante</h3>
                  <p className="text-gray-600 text-sm">Información personal del estudiante</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Fecha</label>
                  <input
                    type="date"
                    {...register('fecha')}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-600 transition-all duration-300 shadow-sm hover:shadow-md hover:border-green-500 group-hover:border-green-600"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Nombre completo</label>
                  <input
                    type="text"
                    {...register('nombre')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                    placeholder="Ingrese su nombre completo"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Número de cédula</label>
                  <input
                    type="text"
                    {...register('cedula')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                    placeholder="Ej: 1-2345-6789"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Fecha de nacimiento</label>
                  <input
                    type="date"
                    {...register('nacimiento')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Edad
                    {fechaNacimiento && (
                      <span className="text-xs text-green-600 ml-2">(calculada automáticamente)</span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    {...register('edad')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                    readOnly={!!fechaNacimiento}
                    style={{
                      backgroundColor: fechaNacimiento ? '#f9fafb' : 'white',
                      cursor: fechaNacimiento ? 'not-allowed' : 'text'
                    }}
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Género</label>
                  <select
                    {...register('genero')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Correo electrónico</label>
                  <input
                    type="email"
                    {...register('correo')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Teléfono</label>
                  <input
                    type="tel"
                    {...register('telefono')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                    placeholder="Ej: 8765-4321"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Año en curso</label>
                  <input
                    type="text"
                    {...register('anio')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                    placeholder="Ej: Sétimo"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">¿Tiene otra beca?</label>
                  <select
                    {...register('otra_beca')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Ocupación</label>
                  <input
                    type="text"
                    {...register('ocupacion')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                    placeholder="Ej: Estudiante"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Distrito</label>
                  <input
                    type="text"
                    {...register('distrito')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                    placeholder="Ej: Santa Cruz"
                  />
                </div>
              </div>

              <div className="mt-6 group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Dirección exacta y características de la vivienda
                </label>
                <textarea
                  rows={4}
                  {...register('direccion')}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                  placeholder="Describa su dirección exacta y características de la vivienda..."
                />
              </div>
            </div>

            {/* 2. DATOS DEL NÚCLEO FAMILIAR */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">2. Datos del Núcleo Familiar</h3>
                  <p className="text-gray-600 text-sm">Información de los miembros de su familia</p>
                </div>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                        <User className="text-green-700" size={20} />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Miembro {index + 1}</h4>
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFamilyMember(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre completo</label>
                      <input
                        type="text"
                        {...register(`nf_miembros.${index}.nombre`)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-600 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-green-600"
                        placeholder="Nombre del familiar"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cédula</label>
                      <input
                        type="text"
                        {...register(`nf_miembros.${index}.cedula`)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                        placeholder="Cédula del familiar"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Edad</label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        {...register(`nf_miembros.${index}.edad`)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Parentesco</label>
                      <input
                        type="text"
                        {...register(`nf_miembros.${index}.parentesco`)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                        placeholder="Ej: Padre, Madre, Hermano"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Escolaridad</label>
                      <input
                        type="text"
                        {...register(`nf_miembros.${index}.escolaridad`)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                        placeholder="Ej: Secundaria completa"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ocupación</label>
                      <input
                        type="text"
                        {...register(`nf_miembros.${index}.ocupacion`)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                        placeholder="Ocupación actual"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Lugar de trabajo</label>
                      <input
                        type="text"
                        {...register(`nf_miembros.${index}.trabajo`)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                        placeholder="Lugar donde trabaja"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ingreso actual (CRC)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(`nf_miembros.${index}.ingreso`)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono del contacto familiar</label>
                      <input
                        type="tel"
                        {...register(`nf_miembros.${index}.telefono`)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                        placeholder="Teléfono"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico del familiar</label>
                      <input
                        type="email"
                        {...register(`nf_miembros.${index}.correo`)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-900 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-blue-900"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addFamilyMember}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                Agregar miembro del núcleo familiar
              </button>
            </div>

            {/* 3. CENTRO EDUCATIVO */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <School className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">3. Centro Educativo</h3>
                  <p className="text-gray-600 text-sm">Información de su institución educativa</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Nombre del centro educativo</label>
                  <input
                    type="text"
                    {...register('centro')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-600 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-purple-600"
                    placeholder="Nombre de la institución"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Correo electrónico del centro</label>
                  <input
                    type="email"
                    {...register('correo_centro')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-600 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-purple-600"
                    placeholder="correo@centro.ac.cr"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Nombre del director(a)</label>
                  <input
                    type="text"
                    {...register('director')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-600 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-purple-600"
                    placeholder="Nombre del director"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Encargado(a) de becas</label>
                  <input
                    type="text"
                    {...register('encargado')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-600 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-purple-600"
                    placeholder="Nombre del encargado de becas"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Distrito</label>
                  <input
                    type="text"
                    {...register('distrito_centro')}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-600 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-purple-600"
                    placeholder="Distrito donde está el centro"
                  />
                </div>
              </div>

              <div className="mt-6 group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Dirección exacta</label>
                <textarea
                  rows={3}
                  {...register('direccion_centro')}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-600 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-purple-600"
                  placeholder="Dirección exacta del centro educativo..."
                />
              </div>
            </div>

            {/* 4. SITUACIÓN DE VULNERABILIDAD */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Heart className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">4. Situación de Vulnerabilidad</h3>
                  <p className="text-gray-600 text-sm">Describa su situación para evaluar la necesidad de la beca</p>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Explique su situación</label>
                <textarea
                  rows={6}
                  {...register('vulnerabilidad')}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-orange-600"
                  placeholder="Describa detalladamente su situación de vulnerabilidad y por qué necesita la beca..."
                />
              </div>
            </div>

            {/* 5. DOCUMENTACIÓN ADJUNTA */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">5. Documentación Adjunta</h3>
                  <p className="text-gray-600 text-sm">Suba todos los documentos requeridos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {requiredFiles.map((file) => (
                  <FileUploadComponent
                    key={file.key}
                    fieldKey={file.key}
                    label={file.label}
                    required={true}
                  />
                ))}
              </div>
            </div>

            {/* 6. FIRMA DEL SOLICITANTE */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">6. Firma del solicitante</h3>
                  <p className="text-gray-600 text-sm">Confirme su identidad y responsabilidad</p>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Nombre del firmante</label>
                <input
                  type="text"
                  {...register('firma')}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all duration-300 shadow-sm hover:shadow-md group-hover:border-indigo-600"
                  placeholder="Escriba su nombre completo como firma"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => window.location.reload()} 
                className="px-8 py-4 bg-white border-2 border-gray-400 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] group"
              >
                <span className="flex items-center justify-center gap-2">
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  Limpiar Formulario
                </span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 relative overflow-hidden px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span className="animate-pulse">Enviando solicitud...</span>
                    </>
                  ) : (
                    <>
                      <Send size={24} className="group-hover:translate-x-1 transition-transform duration-300" />
                      <span>ENVIAR SOLICITUD</span>
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Mensaje de éxito */}
            {success && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center">
                  <Check className="text-green-600 mr-3" size={24} />
                  <p className="text-green-700 font-medium">¡Solicitud enviada correctamente!</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default BecaForm;