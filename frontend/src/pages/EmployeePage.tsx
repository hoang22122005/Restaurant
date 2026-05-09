import React, { useEffect, useState, useMemo } from 'react';
import { employeeService } from '../api/employeeService';
import type { Employee } from '../types';
import { useSite } from '../context/SiteContext';
import { DataTable } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import FormModal, { FormField, inputClass } from '../components/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { formatVND, formatDate } from '../utils/formatters';
import { EMPLOYEE_POSITIONS } from '../utils/constants';

const EmployeePage: React.FC = () => {
  const { branchId, siteId } = useSite();
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Partial<Employee>>({});
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<Employee | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    try { setData(await employeeService.getAll(branchId)); }
    catch { setError('Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [branchId, siteId]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(e => e.fullName?.toLowerCase().includes(q) || e.position?.toLowerCase().includes(q));
  }, [data, search]);

  const openAdd = () => { setEditing(null); setForm({ branchID: branchId, status: 'Active', gender: 'Male' }); setModal(true); };
  const openEdit = (e: Employee) => { setEditing(e); setForm(e); setModal(true); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await employeeService.update(editing.employeeID, form);
      else await employeeService.create({ ...form, branchID: branchId });
      setModal(false); load();
    } catch { alert('Save failed'); } finally { setSaving(false); }
  };

  const onDelete = async () => {
    if (!del) return; setSaving(true);
    try { await employeeService.remove(del.employeeID); setDel(null); load(); }
    catch { alert('Delete failed'); } finally { setSaving(false); }
  };

  const columns = [
    { header: 'ID', accessor: 'employeeID' as keyof Employee },
    { header: 'Full Name', accessor: 'fullName' as keyof Employee },
    { header: 'Position', accessor: 'position' as keyof Employee },
    { header: 'Salary', accessor: (e: Employee) => <span className="font-semibold text-blue-600">{formatVND(e.salary)}</span> },
    { header: 'Hire Date', accessor: (e: Employee) => formatDate(e.hireDate) },
    { header: 'Status', accessor: (e: Employee) => <StatusBadge status={e.status} /> },
  ];

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Employees" description={`Branch: ${branchId}`} onAdd={openAdd} addLabel="Add Employee" onRefresh={load} />
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name, position..." />
      <DataTable columns={columns} data={filtered} loading={loading} onEdit={openEdit} onDelete={e => setDel(e)} />

      <FormModal open={modal} title={editing ? 'Edit Employee' : 'Add Employee'} onClose={() => setModal(false)} onSubmit={onSubmit} loading={saving}>
        <FormField label="Full Name" required><input className={inputClass} required value={form.fullName || ''} onChange={e => setForm({ ...form, fullName: e.target.value })} /></FormField>
        <FormField label="Gender"><select className={inputClass} value={form.gender || 'Male'} onChange={e => setForm({ ...form, gender: e.target.value })}><option>Male</option><option>Female</option></select></FormField>
        <FormField label="Date of Birth"><input type="date" className={inputClass} value={form.dateOfBirth || ''} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></FormField>
        <FormField label="Position"><select className={inputClass} value={form.position || ''} onChange={e => setForm({ ...form, position: e.target.value })}><option value="">Select...</option>{EMPLOYEE_POSITIONS.map(p => <option key={p}>{p}</option>)}</select></FormField>
        <FormField label="Salary"><input type="number" className={inputClass} value={form.salary || 0} onChange={e => setForm({ ...form, salary: Number(e.target.value) })} /></FormField>
        <FormField label="Hire Date"><input type="date" className={inputClass} value={form.hireDate || ''} onChange={e => setForm({ ...form, hireDate: e.target.value })} /></FormField>
        <FormField label="Status"><select className={inputClass} value={form.status || 'Active'} onChange={e => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option></select></FormField>
      </FormModal>

      <ConfirmDialog open={!!del} title="Delete Employee" message={`Delete "${del?.fullName}"?`} onConfirm={onDelete} onCancel={() => setDel(null)} loading={saving} />
    </div>
  );
};

export default EmployeePage;
