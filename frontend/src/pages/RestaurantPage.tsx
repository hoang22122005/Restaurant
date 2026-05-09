import React, { useEffect, useState, useMemo } from 'react';
import { restaurantService } from '../api/restaurantService';
import type { Restaurant } from '../types';
import { DataTable } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import FormModal, { FormField, inputClass } from '../components/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorState from '../components/ErrorState';

const empty: Partial<Restaurant> = { restaurantName: '', type: '', brand: '', taxCode: 0 };

const RestaurantPage: React.FC = () => {
  const [data, setData] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<Restaurant | null>(null);

  const load = async () => { setLoading(true); setError(''); try { setData(await restaurantService.getAll()); } catch { setError('Failed to load'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(r => r.restaurantName?.toLowerCase().includes(q) || r.brand?.toLowerCase().includes(q) || r.type?.toLowerCase().includes(q));
  }, [data, search]);

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (r: Restaurant) => { setEditing(r); setForm(r); setModal(true); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await restaurantService.update(editing.restaurantID, form);
      else await restaurantService.create(form);
      setModal(false); load();
    } catch { alert('Save failed'); }
    finally { setSaving(false); }
  };

  const onDelete = async () => {
    if (!del) return; setSaving(true);
    try { await restaurantService.remove(del.restaurantID); setDel(null); load(); }
    catch { alert('Delete failed'); }
    finally { setSaving(false); }
  };

  const columns = [
    { header: 'ID', accessor: 'restaurantID' as keyof Restaurant },
    { header: 'Name', accessor: 'restaurantName' as keyof Restaurant },
    { header: 'Type', accessor: 'type' as keyof Restaurant },
    { header: 'Brand', accessor: 'brand' as keyof Restaurant },
    { header: 'Tax Code', accessor: 'taxCode' as keyof Restaurant },
  ];

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Restaurants" description="Manage restaurant chain information" onAdd={openAdd} addLabel="Add Restaurant" onRefresh={load} />
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name, brand, type..." />
      <DataTable columns={columns} data={filtered} loading={loading} onEdit={openEdit} onDelete={r => setDel(r)} />

      <FormModal open={modal} title={editing ? 'Edit Restaurant' : 'Add Restaurant'} onClose={() => setModal(false)} onSubmit={onSubmit} loading={saving}>
        <FormField label="Name" required><input className={inputClass} required value={form.restaurantName || ''} onChange={e => setForm({ ...form, restaurantName: e.target.value })} /></FormField>
        <FormField label="Type" required><input className={inputClass} required value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} /></FormField>
        <FormField label="Brand" required><input className={inputClass} required value={form.brand || ''} onChange={e => setForm({ ...form, brand: e.target.value })} /></FormField>
        <FormField label="Tax Code"><input type="number" className={inputClass} value={form.taxCode || 0} onChange={e => setForm({ ...form, taxCode: Number(e.target.value) })} /></FormField>
      </FormModal>

      <ConfirmDialog open={!!del} title="Delete Restaurant" message={`Are you sure you want to delete "${del?.restaurantName}"?`} onConfirm={onDelete} onCancel={() => setDel(null)} loading={saving} />
    </div>
  );
};

export default RestaurantPage;
