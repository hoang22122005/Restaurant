import React, { useEffect, useState, useMemo } from 'react';
import { paymentService } from '../api/paymentService';
import type { Payment } from '../types';
import { DataTable } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import FormModal, { FormField, inputClass } from '../components/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { formatVND, formatDateTime } from '../utils/formatters';
import { PAYMENT_STATUSES, PAYMENT_METHODS } from '../utils/constants';

const PaymentPage: React.FC = () => {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState<Partial<Payment>>({});
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<Payment | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    try { setData(await paymentService.getAll()); }
    catch { setError('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(p => p.paymentID?.toLowerCase().includes(q) || p.orderID?.toLowerCase().includes(q) || p.method?.toLowerCase().includes(q));
  }, [data, search]);

  const openAdd = () => { setEditing(null); setForm({ method: 'Cash', status: 'Pending', amount: 0 }); setModal(true); };
  const openEdit = (p: Payment) => { setEditing(p); setForm(p); setModal(true); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await paymentService.update(editing.paymentID, form);
      else await paymentService.create(form);
      setModal(false); load();
    } catch { alert('Save failed'); } finally { setSaving(false); }
  };

  const onDelete = async () => {
    if (!del) return; setSaving(true);
    try { await paymentService.remove(del.paymentID); setDel(null); load(); }
    catch { alert('Delete failed'); } finally { setSaving(false); }
  };

  const columns = [
    { header: 'ID', accessor: 'paymentID' as keyof Payment },
    { header: 'Order ID', accessor: 'orderID' as keyof Payment },
    { header: 'Method', accessor: 'method' as keyof Payment },
    { header: 'Amount', accessor: (p: Payment) => <span className="font-semibold text-blue-600">{formatVND(p.amount)}</span> },
    { header: 'Time', accessor: (p: Payment) => formatDateTime(p.paymentTime) },
    { header: 'Status', accessor: (p: Payment) => <StatusBadge status={p.status} /> },
  ];

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Payments" description="Manage payment records" onAdd={openAdd} addLabel="Add Payment" onRefresh={load} />
      <SearchInput value={search} onChange={setSearch} placeholder="Search by ID, order, method..." />
      <DataTable columns={columns} data={filtered} loading={loading} onEdit={openEdit} onDelete={p => setDel(p)} />

      <FormModal open={modal} title={editing ? 'Edit Payment' : 'Add Payment'} onClose={() => setModal(false)} onSubmit={onSubmit} loading={saving}>
        <FormField label="Order ID" required><input className={inputClass} required value={form.orderID || ''} onChange={e => setForm({ ...form, orderID: e.target.value })} /></FormField>
        <FormField label="Method"><select className={inputClass} value={form.method || 'Cash'} onChange={e => setForm({ ...form, method: e.target.value })}>{PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}</select></FormField>
        <FormField label="Amount" required><input type="number" className={inputClass} required value={form.amount || 0} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></FormField>
        <FormField label="Status"><select className={inputClass} value={form.status || 'Pending'} onChange={e => setForm({ ...form, status: e.target.value })}>{PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}</select></FormField>
      </FormModal>

      <ConfirmDialog open={!!del} title="Delete Payment" message={`Delete payment "${del?.paymentID}"?`} onConfirm={onDelete} onCancel={() => setDel(null)} loading={saving} />
    </div>
  );
};

export default PaymentPage;
