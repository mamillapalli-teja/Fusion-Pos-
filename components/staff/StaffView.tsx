
import React, { useState } from 'react';
import { StaffMember } from '../../types';
import { Icon } from '../shared/Icon';

interface StaffViewProps {
  staffMembers: StaffMember[];
  onAddStaff: (member: StaffMember) => void;
  onUpdateStaff: (member: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
}

interface StaffModalProps {
  member?: StaffMember;
  onSave: (data: Partial<StaffMember>) => void;
  onClose: () => void;
}

const StaffModal: React.FC<StaffModalProps> = ({ member, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: member?.name || '',
    role: member?.role || 'Cashier',
    pin: member?.pin || '',
    email: member?.email || '',
    phone: member?.phone || '',
    status: member?.status || 'Active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-xl shadow-2xl w-full max-w-md border border-dark-border flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 bg-dark-bg border-b border-dark-border flex justify-between items-center rounded-t-xl">
          <h3 className="text-lg font-bold text-light-text">{member ? 'Edit Staff Member' : 'Add New Staff'}</h3>
          <button onClick={onClose} className="text-medium-text hover:text-light-text">
            <Icon className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-medium-text mb-1">Full Name</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-medium-text mb-1">Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text focus:ring-2 focus:ring-brand-primary outline-none appearance-none"
              >
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
                <option value="Chef">Chef</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-medium-text mb-1">PIN (4-digits)</label>
              <input
                required
                type="text"
                maxLength={4}
                pattern="\d{4}"
                value={formData.pin}
                onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text focus:ring-2 focus:ring-brand-primary outline-none font-mono tracking-widest text-center"
                placeholder="0000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-medium-text mb-1">Email (Optional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>
          <div>
             <label className="block text-sm font-bold text-medium-text mb-1">Phone (Optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-light-text focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-medium-text mb-1">Status</label>
             <div className="flex bg-dark-bg rounded-lg p-1 border border-dark-border">
                {['Active', 'Inactive'].map((status) => (
                    <button
                        key={status}
                        type="button"
                        onClick={() => setFormData({...formData, status: status as any})}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                            formData.status === status
                            ? 'bg-dark-card text-brand-primary shadow'
                            : 'text-medium-text hover:text-light-text'
                        }`}
                    >
                        {status}
                    </button>
                ))}
             </div>
          </div>
          
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-dark-border hover:bg-dark-border/80 text-light-text font-bold rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg transition-colors shadow-lg shadow-brand-primary/20">
              Save Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export const StaffView: React.FC<StaffViewProps> = ({ staffMembers, onAddStaff, onUpdateStaff, onDeleteStaff }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | undefined>(undefined);

  const handleEdit = (member: StaffMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      onDeleteStaff(id);
    }
  };

  const handleSave = (data: Partial<StaffMember>) => {
    if (editingMember) {
      onUpdateStaff({ ...editingMember, ...data } as StaffMember);
    } else {
      onAddStaff({
        id: `staff_${Date.now()}`,
        joinedDate: new Date(),
        ...data
      } as StaffMember);
    }
    setIsModalOpen(false);
    setEditingMember(undefined);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Manager': return 'bg-purple-900/30 text-purple-400 border-purple-900/50';
      case 'Admin': return 'bg-red-900/30 text-red-400 border-red-900/50';
      case 'Chef': return 'bg-orange-900/30 text-orange-400 border-orange-900/50';
      default: return 'bg-brand-primary/20 text-brand-primary border-brand-primary/50';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-light-text">Staff Management</h1>
            <p className="text-medium-text mt-1">Manage users, roles, and access PINs.</p>
        </div>
        <button
          onClick={() => {
            setEditingMember(undefined);
            setIsModalOpen(true);
          }}
          className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-brand-primary/20 flex items-center gap-2 transition-colors"
        >
          <Icon className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></Icon>
          Add Staff
        </button>
      </div>

      <div className="bg-dark-card rounded-xl border border-dark-border shadow-lg overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-bg border-b border-dark-border text-medium-text text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">PIN</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Joined</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {staffMembers.map(member => (
                <tr key={member.id} className="hover:bg-dark-border/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-secondary/30 flex items-center justify-center text-brand-primary font-bold text-xs">
                            {member.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                        </div>
                        <span className="font-semibold text-light-text">{member.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-medium-text tracking-widest">
                    ••••
                  </td>
                  <td className="p-4 text-sm text-medium-text">
                    {member.email && <div className="mb-0.5">{member.email}</div>}
                    {member.phone && <div className="text-xs opacity-70">{member.phone}</div>}
                    {!member.email && !member.phone && <span className="opacity-50">-</span>}
                  </td>
                  <td className="p-4">
                     <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${member.status === 'Active' ? 'bg-green-900/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                        {member.status}
                     </span>
                  </td>
                  <td className="p-4 text-sm text-medium-text">
                    {new Date(member.joinedDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => handleEdit(member)}
                            className="p-1.5 hover:bg-dark-bg rounded text-brand-primary transition-colors"
                            title="Edit"
                        >
                            <Icon className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></Icon>
                        </button>
                        <button
                            onClick={() => handleDelete(member.id)}
                            className="p-1.5 hover:bg-dark-bg rounded text-red-400 transition-colors"
                            title="Delete"
                        >
                            <Icon className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></Icon>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <StaffModal
          member={editingMember}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMember(undefined);
          }}
        />
      )}
    </div>
  );
};
