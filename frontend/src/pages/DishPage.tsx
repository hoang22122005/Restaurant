import React, { useEffect, useState, useMemo } from 'react';
import { dishService } from '../api/dishService';
import type { Dish } from '../types';
import { DataTable } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import FormModal, { FormField, inputClass } from '../components/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { formatVND } from '../utils/formatters';
import { DISH_CATEGORIES } from '../utils/constants';

const empty: Partial<Dish> = { dishName: '', price: 0, category: '', description: '', status: 'Available' };

const DishPage: React.FC = () => {
  const [data, setData] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<Dish | null>(null);

  const load = async () => { setLoading(true); setError(''); try { setData(await dishService.getAll()); } catch { setError('Failed to load'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(d => d.dishName?.toLowerCase().includes(q) || d.category?.toLowerCase().includes(q));
  }, [data, search]);

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (d: Dish) => { setEditing(d); setForm(d); setModal(true); };
  const onSubmit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { if (editing) await dishService.update(editing.dishID, form); else await dishService.create(form); setModal(false); load(); } catch { alert('Save failed'); } finally { setSaving(false); } };
  const onDelete = async () => { if (!del) return; setSaving(true); try { await dishService.remove(del.dishID); setDel(null); load(); } catch { alert('Delete failed'); } finally { setSaving(false); } };

  const columns = [
    { header: 'ID', accessor: 'dishID' as keyof Dish },
    { header: 'Name', accessor: 'dishName' as keyof Dish },
    { header: 'Price', accessor: (d: Dish) => <span className="font-semibold text-blue-600">{formatVND(d.price)}</span> },
    { header: 'Category', accessor: 'category' as keyof Dish },
    { header: 'Status', accessor: (d: Dish) => <StatusBadge status={d.status} /> },
  ];

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Menu Dishes" description="Manage restaurant menu items" onAdd={openAdd} addLabel="Add Dish" onRefresh={load} />
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name, category..." />
      <DataTable columns={columns} data={filtered} loading={loading} onEdit={openEdit} onDelete={d => setDel(d)} />

      <FormModal open={modal} title={editing ? 'Edit Dish' : 'Add Dish'} onClose={() => setModal(false)} onSubmit={onSubmit} loading={saving}>
        <FormField label="Name" required><input className={inputClass} required value={form.dishName || ''} onChange={e => setForm({ ...form, dishName: e.target.value })} /></FormField>
        <FormField label="Price" required><input type="number" className={inputClass} required value={form.price || 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></FormField>
        <FormField label="Category"><select className={inputClass} value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })}><option value="">Select...</option>{DISH_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></FormField>
        <FormField label="Description"><input className={inputClass} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
        <FormField label="Status"><select className={inputClass} value={form.status || 'Available'} onChange={e => setForm({ ...form, status: e.target.value })}><option>Available</option><option>Unavailable</option></select></FormField>
      </FormModal>

      <ConfirmDialog open={!!del} title="Delete Dish" message={`Delete dish "${del?.dishName}"?`} onConfirm={onDelete} onCancel={() => setDel(null)} loading={saving} />
    </div>
  );
};

export default DishPage;
