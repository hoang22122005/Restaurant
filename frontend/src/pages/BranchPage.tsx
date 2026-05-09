import React, { useEffect, useState, useMemo } from 'react';
import { branchService } from '../api/branchService';
import type { Branch } from '../types';
import { DataTable } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import FormModal, { FormField, inputClass } from '../components/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';

const empty: Partial<Branch> = { branchName: '', address: '', city: '', region: '', phoneNumber: '', email: '', establishedDate: '', status: 'Open', restaurantID: '' };

const BranchPage: React.FC = () => {
  const [data, setData] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<Branch | null>(null);

  const load = async () => { setLoading(true); setError(''); try { setData(await branchService.getAll()); } catch { setError('Failed to load'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(b => b.branchName?.toLowerCase().includes(q) || b.city?.toLowerCase().includes(q) || b.address?.toLowerCase().includes(q));
  }, [data, search]);

  const openAdd = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (b: Branch) => { setEditing(b); setForm(b); setModal(true); };
  const onSubmit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { if (editing) await branchService.update(editing.branchID, form); else await branchService.create(form); setModal(false); load(); } catch { alert('Save failed'); } finally { setSaving(false); } };
  const onDelete = async () => { if (!del) return; setSaving(true); try { await branchService.remove(del.branchID); setDel(null); load(); } catch { alert('Delete failed'); } finally { setSaving(false); } };

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
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name, city..." />
      <DataTable columns={columns} data={filtered} loading={loading} onEdit={openEdit} onDelete={b => setDel(b)} />

      <FormModal open={modal} title={editing ? 'Edit Branch' : 'Add Branch'} onClose={() => setModal(false)} onSubmit={onSubmit} loading={saving}>
        <FormField label="Name" required><input className={inputClass} required value={form.branchName || ''} onChange={e => setForm({ ...form, branchName: e.target.value })} /></FormField>
        <FormField label="Address"><input className={inputClass} value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></FormField>
        <FormField label="City"><input className={inputClass} value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} /></FormField>
        <FormField label="Region"><input className={inputClass} value={form.region || ''} onChange={e => setForm({ ...form, region: e.target.value })} /></FormField>
        <FormField label="Phone"><input className={inputClass} value={form.phoneNumber || ''} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} /></FormField>
        <FormField label="Email"><input type="email" className={inputClass} value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></FormField>
        <FormField label="Established Date"><input type="date" className={inputClass} value={form.establishedDate || ''} onChange={e => setForm({ ...form, establishedDate: e.target.value })} /></FormField>
        <FormField label="Status"><select className={inputClass} value={form.status || 'Open'} onChange={e => setForm({ ...form, status: e.target.value })}><option>Open</option><option>Closed</option></select></FormField>
        <FormField label="Restaurant ID" required><input className={inputClass} required value={form.restaurantID || ''} onChange={e => setForm({ ...form, restaurantID: e.target.value })} /></FormField>
      </FormModal>

      <ConfirmDialog open={!!del} title="Delete Branch" message={`Delete branch "${del?.branchName}"?`} onConfirm={onDelete} onCancel={() => setDel(null)} loading={saving} />
    </div>
  );
};

export default BranchPage;
