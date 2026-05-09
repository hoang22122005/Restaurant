import React, { useEffect, useState, useMemo, useRef } from 'react';
import { branchService } from '../api/branchService';
import { restaurantService } from '../api/restaurantService';
import type { Branch, Restaurant } from '../types';
import { DataTable } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import FormModal, { FormField, inputClass } from '../components/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { User, Building, MapPin, Phone, Mail, Calendar, Info, ChevronDown, Check, Search } from 'lucide-react';

const empty: Partial<Branch> = { branchName: '', address: '', city: '', region: '', phoneNumber: '', email: '', establishedDate: '', status: 'Open', restaurantID: '' };

const BranchPage: React.FC = () => {
  const [data, setData] = useState<Branch[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<Branch | null>(null);

  // Searchable Select State
  const [resSearch, setResSearch] = useState('');
  const [showResList, setShowResList] = useState(false);
  const resRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resRef.current && !resRef.current.contains(event.target as Node)) setShowResList(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const load = async () => { 
    setLoading(true); 
    setError(''); 
    try { 
      const [branchData, resData] = await Promise.all([
        branchService.getAll(),
        restaurantService.getAll()
      ]);
      setData(branchData);
      setRestaurants(resData);
    } catch { 
      setError('Failed to load data'); 
    } finally { 
      setLoading(false); 
    } 
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(b => b.branchName?.toLowerCase().includes(q) || b.city?.toLowerCase().includes(q) || b.address?.toLowerCase().includes(q) || b.branchID?.toLowerCase().includes(q));
  }, [data, search]);

  const filteredRestaurants = useMemo(() => {
    const q = resSearch.toLowerCase();
    return restaurants.filter(r => r.restaurantName.toLowerCase().includes(q) || r.restaurantID.toLowerCase().includes(q));
  }, [restaurants, resSearch]);

  const openAdd = () => { 
    setEditing(null); 
    setForm(empty); 
    setResSearch('');
    setModal(true); 
  };
  const openEdit = (b: Branch) => { 
    setEditing(b); 
    setForm(b); 
    setResSearch(b.restaurantName || '');
    setModal(true); 
  };

  const onSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setSaving(true); 
    try { 
      if (editing) await branchService.update(editing.branchID, form); 
      else await branchService.create(form); 
      setModal(false); 
      load(); 
    } catch { 
      alert('Save failed'); 
    } finally { 
      setSaving(false); 
    } 
  };

  const onDelete = async () => { 
    if (!del) return; 
    setSaving(true); 
    try { 
      await branchService.remove(del.branchID); 
      setDel(null); 
      load(); 
    } catch { 
      alert('Delete failed'); 
    } finally { 
      setSaving(false); 
    } 
  };

  const columns = [
    { header: 'ID', accessor: 'branchID' as keyof Branch },
    { header: 'Name', accessor: 'branchName' as keyof Branch },
    { header: 'City', accessor: 'city' as keyof Branch },
    { header: 'Phone', accessor: 'phoneNumber' as keyof Branch },
    { header: 'Status', accessor: (b: Branch) => <StatusBadge status={b.status} /> },
  ];

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Branches" description="Manage branch locations" onAdd={openAdd} addLabel="Add Branch" onRefresh={load} />
      <SearchInput value={search} onChange={setSearch} placeholder="Search by ID, name, city..." />
      <DataTable columns={columns} data={filtered} loading={loading} onEdit={openEdit} onDelete={b => setDel(b)} />

      <FormModal open={modal} title={editing ? 'Edit Branch' : 'Add Branch'} onClose={() => setModal(false)} onSubmit={onSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-6">
          <FormField label="Branch Name" required>
            <div className="relative">
              <Building size={18} className="absolute left-3 top-3 text-gray-400" />
              <input className={`${inputClass} pl-10`} required value={form.branchName || ''} onChange={e => setForm({ ...form, branchName: e.target.value })} placeholder="Enter branch name" />
            </div>
          </FormField>

          <FormField label="Parent Restaurant" required>
            <div className="relative" ref={resRef}>
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text"
                placeholder="Search restaurant..."
                className={`${inputClass} pl-10 pr-10 cursor-pointer h-[42px]`}
                value={resSearch}
                onFocus={(e) => { setShowResList(true); e.target.select(); }}
                onKeyDown={e => e.key === 'Escape' && setShowResList(false)}
                onChange={e => { setResSearch(e.target.value); setShowResList(true); }}
              />
              <ChevronDown size={18} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />

              {showResList && (
                <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                  {filteredRestaurants.length > 0 ? filteredRestaurants.map(r => (
                    <div 
                      key={r.restaurantID} 
                      className={`p-3 cursor-pointer hover:bg-blue-50 flex justify-between items-center transition-colors border-b last:border-0 border-gray-50 ${form.restaurantID === r.restaurantID ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setForm({ ...form, restaurantID: r.restaurantID });
                        setResSearch(r.restaurantName);
                        setShowResList(false);
                      }}
                    >
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{r.restaurantName}</p>
                        <p className="text-[11px] text-gray-500 font-medium">ID: {r.restaurantID}</p>
                      </div>
                      {form.restaurantID === r.restaurantID && <Check size={16} className="text-blue-600" />}
                    </div>
                  )) : (
                    <div className="p-4 text-center text-gray-400 text-sm italic bg-gray-50">No restaurants found</div>
                  )}
                </div>
              )}
            </div>
          </FormField>

          <FormField label="Phone Number">
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
              <input className={`${inputClass} pl-10`} value={form.phoneNumber || ''} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} placeholder="0123-456-789" />
            </div>
          </FormField>

          <FormField label="Email Address">
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
              <input type="email" className={`${inputClass} pl-10`} value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="branch@example.com" />
            </div>
          </FormField>

          <FormField label="City">
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
              <input className={`${inputClass} pl-10`} value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Hanoi, HCM, etc." />
            </div>
          </FormField>

          <FormField label="Region">
            <div className="relative">
              <Info size={18} className="absolute left-3 top-3 text-gray-400" />
              <input className={`${inputClass} pl-10`} value={form.region || ''} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="North, South, etc." />
            </div>
          </FormField>

          <div className="col-span-2">
            <FormField label="Address">
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                <input className={`${inputClass} pl-10`} value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address..." />
              </div>
            </FormField>
          </div>

          <FormField label="Established Date">
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
              <input type="date" className={`${inputClass} pl-10`} value={form.establishedDate || ''} onChange={e => setForm({ ...form, establishedDate: e.target.value })} />
            </div>
          </FormField>

          <FormField label="Status">
            <select className={inputClass} value={form.status || 'Open'} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </FormField>
        </div>
      </FormModal>

      <ConfirmDialog open={!!del} title="Delete Branch" message={`Are you sure you want to delete branch "${del?.branchName}"? This action cannot be undone.`} onConfirm={onDelete} onCancel={() => setDel(null)} loading={saving} />
    </div>
  );
};

export default BranchPage;
