import React, { useState } from 'react';

export default function UsuariosTab() {
  const [usuarios, setUsuarios] = useState([
    { id: 1, name: "Admin Principal", email: "admin@gmail.com", role: "Administrador", status: "Activo" },
    { id: 2, name: "Milka Borja", email: "milka@gmail.com", role: "Caja", status: "Activo" },
    { id: 3, name: "Lubswer Catagña", email: "lubswer@gmail.com", role: "Cocina", status: "Activo" },
    { id: 4, name: "Carlos Empleado", email: "carlos@gmail.com", role: "Caja", status: "Inactivo" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Caja'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formError) setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(formData.name.trim()) || formData.name.trim().length < 3) {
      setFormError('El nombre debe tener al menos 3 letras y no puede contener números ni caracteres especiales.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFormError('Por favor, ingresa un correo electrónico válido (ej. nombre@dominio.com).');
      return;
    }


    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      setFormError('La contraseña debe tener al menos 6 caracteres, e incluir al menos una letra y un número.');
      return;
    }
    
    const newUser = {
      id: Date.now(), 
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      status: "Activo"
    };
    
    setUsuarios([...usuarios, newUser]);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', password: '', role: 'Caja' });
  };

  return (
    <div className="space-y-4 font-montserrat">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gestión de Usuarios y Roles</h2>
          <p className="text-xs text-gray-500">Administra los accesos y permisos del personal del establecimiento.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 cursor-pointer transition-colors"
        >
          + Nuevo Usuario
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Nombre del Empleado</th>
              <th className="py-3 px-4 font-semibold">Correo Electrónico</th>
              <th className="py-3 px-4 font-semibold">Rol Asignado</th>
              <th className="py-3 px-4 font-semibold">Estado</th>
              <th className="py-3 px-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {usuarios.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 font-bold text-gray-900">{user.name}</td>
                <td className="py-4 px-4 text-gray-500">{user.email}</td>
                <td className="py-4 px-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    {user.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right space-x-3">
                  <button className="text-gray-500 hover:text-gray-900 underline-offset-2 hover:underline text-xs font-bold cursor-pointer transition-colors">Editar</button>
                  <button className="text-gray-500 hover:text-gray-900 underline-offset-2 hover:underline text-xs font-bold cursor-pointer transition-colors">
                    {user.status === 'Activo' ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Registrar Nuevo Usuario</h3>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                  placeholder="Ej. Milka Borja"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                  placeholder="milka@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rol en el Sistema</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Caja">Caja / Ventas</option>
                  <option value="Cocina">Cocina</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormError('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}