import React, { useEffect, useState, useMemo, useRef } from 'react';
import { orderService } from '../api/orderService';
import { employeeService } from '../api/employeeService';
import { customerService } from '../api/customerService';
import { dishService } from '../api/dishService';
import type { Order, Employee, Customer, Dish, OrderDetail } from '../types';
import { useSite } from '../context/SiteContext';
import { DataTable } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import FormModal, { FormField, inputClass } from '../components/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import ErrorState from '../components/ErrorState';
import { formatVND, formatDateTime } from '../utils/formatters';
import { ORDER_STATUSES } from '../utils/constants';
import { ShoppingCart, Receipt, Plus, Trash2, User, Users, Search, ChevronDown, Check } from 'lucide-react';

const OrderPage: React.FC = () => {
  const { branchId, siteId } = useSite();
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<Partial<Order>>({});
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<Order | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedItems, setSelectedItems] = useState<Partial<OrderDetail>[]>([]);
  const [invoice, setInvoice] = useState<Order | null>(null);

  // Custom Select States
  const [empSearch, setEmpSearch] = useState('');
  const [custSearch, setCustSearch] = useState('');
  const [showEmpList, setShowEmpList] = useState(false);
  const [showCustList, setShowCustList] = useState(false);

  const empRef = useRef<HTMLDivElement>(null);
  const custRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (empRef.current && !empRef.current.contains(event.target as Node)) setShowEmpList(false);
      if (custRef.current && !custRef.current.contains(event.target as Node)) setShowCustList(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const load = async () => {
    setLoading(true); setError('');
    try { 
      const [ordersData, dishesData, empData, custData] = await Promise.all([
        orderService.getAll(branchId),
        dishService.getAll(),
        employeeService.getAll(branchId),
        customerService.getAll(branchId)
      ]);
      setData(ordersData);
      setDishes(dishesData);
      setEmployees(empData);
      setCustomers(custData);
    }
    catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [branchId, siteId]);

  const calculateTotal = (items: Partial<OrderDetail>[], vat: number) => {
    const subtotal = items.reduce((sum, item) => {
      const dish = dishes.find(d => d.dishID === item.dishID);
      return sum + (dish ? dish.price * (item.quantity || 0) : 0);
    }, 0);
    return subtotal + (subtotal * (vat / 100));
  };

  const addItem = () => {
    setSelectedItems([...selectedItems, { dishID: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
    setForm(prev => ({ ...prev, totalAmount: calculateTotal(newItems, prev.vat || 10) }));
  };

  const updateItem = (index: number, field: keyof OrderDetail, value: any) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSelectedItems(newItems);
    
    if (field === 'dishID' || field === 'quantity') {
      setForm(prev => ({ ...prev, totalAmount: calculateTotal(newItems, prev.vat || 10) }));
    }
  };

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(o => 
      o.orderID?.toLowerCase().includes(q) || 
      o.status?.toLowerCase().includes(q) || 
      o.customerName?.toLowerCase().includes(q) ||
      o.customerID?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const filteredEmployees = useMemo(() => {
    const q = empSearch.toLowerCase();
    return employees.filter(e => e.fullName.toLowerCase().includes(q) || e.employeeID.toLowerCase().includes(q));
  }, [employees, empSearch]);

  const filteredCustomers = useMemo(() => {
    const q = custSearch.toLowerCase();
    return customers.filter(c => c.fullName.toLowerCase().includes(q) || c.customerID.toLowerCase().includes(q) || c.phoneNumber.includes(q));
  }, [customers, custSearch]);

  const openAdd = () => { 
    setEditing(null); 
    setForm({ status: 'Pending', vat: 10, totalAmount: 0 }); 
    setSelectedItems([]);
    setEmpSearch('');
    setCustSearch('');
    setModal(true); 
  };
  const openEdit = (o: Order) => { 
    setEditing(o); 
    setForm(o); 
    setSelectedItems(o.orderDetails || []);
    setEmpSearch(o.employeeName || '');
    setCustSearch(o.customerName || '');
    setModal(true); 
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const orderPayload = { ...form, orderDetails: selectedItems };
      if (editing) await orderService.update(editing.orderID, orderPayload);
      else await orderService.create(orderPayload);
      setModal(false); load();
    } catch { alert('Save failed'); } finally { setSaving(false); }
  };

  const onDelete = async () => {
    if (!del) return; setSaving(true);
    try { await orderService.remove(del.orderID); setDel(null); load(); }
    catch { alert('Delete failed'); } finally { setSaving(false); }
  };

  const columns = [
    { header: 'Order ID', accessor: 'orderID' as keyof Order },
    { header: 'Time', accessor: (o: Order) => formatDateTime(o.orderTime) },
    { header: 'Customer', accessor: (o: Order) => o.customerName || o.customerID },
    { header: 'Total', accessor: (o: Order) => <span className="font-semibold text-blue-600">{formatVND(o.totalAmount)}</span> },
    { header: 'VAT %', accessor: 'vat' as keyof Order },
    { header: 'Status', accessor: (o: Order) => <StatusBadge status={o.status} /> },
    { header: 'Invoice', accessor: (o: Order) => (
      <button onClick={() => setInvoice(o)} className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
        <Receipt size={18} />
      </button>
    )},
  ];

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Orders" description={`Branch: ${branchId}`} onAdd={openAdd} addLabel="Add Order" onRefresh={load} />
      <SearchInput value={search} onChange={setSearch} placeholder="Search by ID, status, customer..." />
      <DataTable columns={columns} data={filtered} loading={loading} onEdit={openEdit} onDelete={o => setDel(o)} />

      <FormModal open={modal} title={editing ? 'Edit Order' : 'Add Order'} onClose={() => setModal(false)} onSubmit={onSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-6">
          {/* Enhanced Employee Searchable Select */}
          <FormField label="Employee" required>
            <div className="relative" ref={empRef}>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input 
                type="text"
                placeholder="Search employee..."
                className={`${inputClass} pl-10 pr-10 cursor-pointer h-[42px]`}
                value={empSearch}
                onFocus={(e) => { setShowEmpList(true); e.target.select(); }}
                onKeyDown={e => e.key === 'Escape' && setShowEmpList(false)}
                onChange={e => { setEmpSearch(e.target.value); setShowEmpList(true); }}
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={18} />
              </div>

              {showEmpList && (
                <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                  {filteredEmployees.length > 0 ? filteredEmployees.map(e => (
                    <div 
                      key={e.employeeID} 
                      className={`p-3 cursor-pointer hover:bg-blue-50 flex justify-between items-center transition-colors border-b last:border-0 border-gray-50 ${form.employeeID === e.employeeID ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setForm({ ...form, employeeID: e.employeeID });
                        setEmpSearch(e.fullName);
                        setShowEmpList(false);
                      }}
                    >
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{e.fullName}</p>
                        <p className="text-[11px] text-gray-500 font-medium">ID: {e.employeeID} • {e.position}</p>
                      </div>
                      {form.employeeID === e.employeeID && <Check size={16} className="text-blue-600" />}
                    </div>
                  )) : (
                    <div className="p-4 text-center text-gray-400 text-sm italic bg-gray-50">No employees found</div>
                  )}
                </div>
              )}
            </div>
          </FormField>

          {/* Enhanced Customer Searchable Select */}
          <FormField label="Customer" required>
            <div className="relative" ref={custRef}>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <Users size={18} />
              </div>
              <input 
                type="text"
                placeholder="Search customer..."
                className={`${inputClass} pl-10 pr-10 cursor-pointer h-[42px]`}
                value={custSearch}
                onFocus={(e) => { setShowCustList(true); e.target.select(); }}
                onKeyDown={e => e.key === 'Escape' && setShowCustList(false)}
                onChange={e => { setCustSearch(e.target.value); setShowCustList(true); }}
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDown size={18} />
              </div>

              {showCustList && (
                <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                  {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                    <div 
                      key={c.customerID} 
                      className={`p-3 cursor-pointer hover:bg-blue-50 flex justify-between items-center transition-colors border-b last:border-0 border-gray-50 ${form.customerID === c.customerID ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setForm({ ...form, customerID: c.customerID });
                        setCustSearch(c.fullName);
                        setShowCustList(false);
                      }}
                    >
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{c.fullName}</p>
                        <p className="text-[11px] text-gray-500 font-medium">ID: {c.customerID} • {c.phoneNumber}</p>
                      </div>
                      {form.customerID === c.customerID && <Check size={16} className="text-blue-600" />}
                    </div>
                  )) : (
                    <div className="p-4 text-center text-gray-400 text-sm italic bg-gray-50">No customers found</div>
                  )}
                </div>
              )}
            </div>
          </FormField>
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold flex items-center gap-2 text-gray-700"><ShoppingCart size={18}/> Selected Dishes</h3>
            <button type="button" onClick={addItem} className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 flex items-center gap-2 transition-all font-medium">
              <Plus size={16}/> Add Dish
            </button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {selectedItems.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-100 transition-all hover:border-blue-200 group">
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 block">Dish Selection</label>
                  <select 
                    className={inputClass} 
                    value={item.dishID || ''} 
                    onChange={e => updateItem(idx, 'dishID', e.target.value)}
                    required
                  >
                    <option value="">Select a dish</option>
                    {dishes.map(d => (
                      <option key={d.dishID} value={d.dishID}>{d.dishName} ({formatVND(d.price)})</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1 block">Quantity</label>
                  <input 
                    type="number" 
                    min="1" 
                    className={inputClass} 
                    value={item.quantity || 1} 
                    onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                    required 
                  />
                </div>
                <button type="button" onClick={() => removeItem(idx)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={20}/>
                </button>
              </div>
            ))}
            {selectedItems.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">No dishes added to this order yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6 border-t pt-6">
          <FormField label="VAT (%)" required>
            <input type="number" className={inputClass} required value={form.vat || 10} onChange={e => {
              const v = Number(e.target.value);
              setForm({ ...form, vat: v, totalAmount: calculateTotal(selectedItems, v) });
            }} />
          </FormField>
          <FormField label="Status">
            <select className={inputClass} value={form.status || 'Pending'} onChange={e => setForm({ ...form, status: e.target.value })}>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-2xl flex flex-col justify-center shadow-lg shadow-blue-200 text-white">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">Total Amount</span>
            <span className="text-2xl font-black tracking-tight">{formatVND(form.totalAmount || 0)}</span>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog open={!!del} title="Delete Order" message={`Are you sure you want to delete order "${del?.orderID}"? This action cannot be undone.`} onConfirm={onDelete} onCancel={() => setDel(null)} loading={saving} />

      {/* Invoice Modal remains the same */}
      <FormModal open={!!invoice} title="Order Invoice" onClose={() => setInvoice(null)} onSubmit={(e) => { e.preventDefault(); setInvoice(null); }}>
        <div className="bg-white p-4 text-gray-800 rounded-lg">
          <div className="text-center border-b-2 border-gray-100 pb-6 mb-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-blue-600">Restaurant Receipt</h2>
            <p className="text-sm font-bold text-gray-500 mt-1">{invoice?.branchName || 'Official Branch'}</p>
            <div className="flex justify-center gap-4 mt-2">
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">ID: {invoice?.orderID}</span>
              <span className="text-[10px] bg-blue-50 px-2 py-0.5 rounded text-blue-600 font-bold uppercase">{invoice?.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <p className="text-gray-400 uppercase text-[9px] font-black tracking-widest mb-1">Customer Info</p>
              <p className="font-bold text-gray-800">{invoice?.customerName || invoice?.customerID}</p>
              <p className="text-xs text-gray-500">Guest ID: {invoice?.customerID}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl text-right">
              <p className="text-gray-400 uppercase text-[9px] font-black tracking-widest mb-1">Date & Time</p>
              <p className="font-bold text-gray-800">{formatDateTime(invoice?.orderTime || '')}</p>
              <p className="text-xs text-gray-500">Employee: {invoice?.employeeName || invoice?.employeeID}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-8">
            <thead>
              <tr className="text-gray-400 uppercase text-[9px] font-black tracking-widest border-b border-gray-100">
                <th className="text-left py-3">Item Description</th>
                <th className="text-center py-3 w-16">Qty</th>
                <th className="text-right py-3">Price</th>
                <th className="text-right py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoice?.orderDetails?.map((item, idx) => (
                <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-bold text-gray-700">{item.dishName}</td>
                  <td className="py-4 text-center font-medium text-gray-500">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-500">{formatVND(item.price)}</td>
                  <td className="py-4 text-right font-black text-gray-800">{formatVND(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-gray-100 pt-6 space-y-3">
            <div className="flex justify-between text-xs font-bold text-gray-400">
              <span className="uppercase tracking-widest">Subtotal</span>
              <span>{formatVND((invoice?.totalAmount || 0) / (1 + (invoice?.vat || 0) / 100))}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-400">
              <span className="uppercase tracking-widest">Tax ({invoice?.vat}%)</span>
              <span>{formatVND((invoice?.totalAmount || 0) - (invoice?.totalAmount || 0) / (1 + (invoice?.vat || 0) / 100))}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-blue-600 mt-4 pt-4 border-t border-dashed border-gray-200">
              <span className="tracking-tighter">GRAND TOTAL</span>
              <span>{formatVND(invoice?.totalAmount || 0)}</span>
            </div>
          </div>

          <div className="text-center mt-12 bg-gray-50 p-4 rounded-2xl">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-1">Thank You</p>
            <p className="text-xs text-gray-500 italic font-medium">Please keep this receipt for your records.</p>
          </div>
        </div>
        <div className="flex justify-center mt-8 gap-4">
          <button 
            type="button" 
            onClick={() => window.print()} 
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl hover:bg-blue-700 flex items-center gap-3 transition-all font-bold shadow-lg shadow-blue-200"
          >
            <Receipt size={20}/> Print Receipt
          </button>
        </div>
      </FormModal>
    </div>
  );
};

export default OrderPage;
