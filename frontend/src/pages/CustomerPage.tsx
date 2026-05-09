import React, { useEffect, useState, useMemo } from 'react';
import { customerService } from '../api/customerService';
import type { Customer } from '../types';
import { useSite } from '../context/SiteContext';
import { DataTable } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import FormModal, { FormField, inputClass } from '../components/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { CUSTOMER_TYPES } from '../utils/constants';

const CustomerPage: React.FC = () => {
  const { branchId, siteId } = useSite();
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<Customer | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    try { setData(await customerService.getAll(branchId)); }
    catch { setError('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [branchId, siteId]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(c => c.fullName?.toLowerCase().includes(q) || c.phoneNumber?.includes(q));
  }, [data, search]);

  const openAdd = () => { setEditing(null); setForm({ branchID: branchId, customerType: 'Regular' }); setModal(true); };
  const openEdit = (c: Customer) => { setEditing(c); setForm(c); setModal(true); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await customerService.update(editing.customerID, form);
      else await customerService.create({ ...form, branchID: branchId });
      setModal(false); load();
    } catch { alert('Save failed'); } finally { setSaving(false); }
  };

  const onDelete = async () => {
    if (!del) return; setSaving(true);
    try { await customerService.remove(del.customerID); setDel(null); load(); }
    catch { alert('Delete failed'); } finally { setSaving(false); }
  };

  const columns = [
    { header: 'ID', accessor: 'customerID' as keyof Customer },
    { header: 'Full Name', accessor: 'fullName' as keyof Customer },
    { header: 'Phone', accessor: 'phoneNumber' as keyof Customer },
    { header: 'Email', accessor: 'email' as keyof Customer },
    { header: 'Type', accessor: (c: Customer) => <StatusBadge status={c.customerType} /> },
  ];

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Customers" description={`Branch: ${branchId}`} onAdd={openAdd} addLabel="Add Customer" onRefresh={load} />
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name, phone..." />
      <DataTable columns={columns} data={filtered} loading={loading} onEdit={openEdit} onDelete={c => setDel(c)} />

      <FormModal open={modal} title={editing ? 'Edit Customer' : 'Add Customer'} onClose={() => setModal(false)} onSubmit={onSubmit} loading={saving}>
        <FormField label="Full Name" required><input className={inputClass} required value={form.fullName || ''} onChange={e => setForm({ ...form, fullName: e.target.value })} /></FormField>
        <FormField label="Phone" required><input className={inputClass} required value={form.phoneNumber || ''} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} /></FormField>
        <FormField label="Email"><input type="email" className={inputClass} value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></FormField>
        <FormField label="Type"><select className={inputClass} value={form.customerType || 'Regular'} onChange={e => setForm({ ...form, customerType: e.target.value })}>{CUSTOMER_TYPES.map(t => <option key={t}>{t}</option>)}</select></FormField>
      </FormModal>

      <ConfirmDialog open={!!del} title="Delete Customer" message={`Delete "${del?.fullName}"?`} onConfirm={onDelete} onCancel={() => setDel(null)} loading={saving} />
    </div>
  );
};

export default CustomerPage;
