import React, { useEffect, useState, useMemo } from 'react';
import { orderService } from '../api/orderService';
import type { Order } from '../types';
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
import { dishService } from '../api/dishService';
import type { Dish, OrderDetail } from '../types';
import { ShoppingCart, Receipt, Plus, Trash2 } from 'lucide-react';

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
  const [selectedItems, setSelectedItems] = useState<Partial<OrderDetail>[]>([]);
  const [invoice, setInvoice] = useState<Order | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    try { 
      const [ordersData, dishesData] = await Promise.all([
        orderService.getAll(branchId),
        dishService.getAll()
      ]);
      setData(ordersData);
      setDishes(dishesData);
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
    return data.filter(o => o.orderID?.toLowerCase().includes(q) || o.status?.toLowerCase().includes(q) || o.customerName?.toLowerCase().includes(q));
  }, [data, search]);

  const openAdd = () => { 
    setEditing(null); 
    setForm({ status: 'Pending', vat: 10, totalAmount: 0 }); 
    setSelectedItems([]);
    setModal(true); 
  };
  const openEdit = (o: Order) => { 
    setEditing(o); 
    setForm(o); 
    setSelectedItems(o.orderDetails || []);
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
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Employee ID" required><input className={inputClass} required value={form.employeeID || ''} onChange={e => setForm({ ...form, employeeID: e.target.value })} /></FormField>
          <FormField label="Customer ID" required><input className={inputClass} required value={form.customerID || ''} onChange={e => setForm({ ...form, customerID: e.target.value })} /></FormField>
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold flex items-center gap-2"><ShoppingCart size={18}/> Selected Dishes</h3>
            <button type="button" onClick={addItem} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 flex items-center gap-1">
              <Plus size={14}/> Add Dish
            </button>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {selectedItems.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Dish</label>
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
                  <label className="text-xs text-gray-500 mb-1 block">Qty</label>
                  <input 
                    type="number" 
                    min="1" 
                    className={inputClass} 
                    value={item.quantity || 1} 
                    onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                    required 
                  />
                </div>
                <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18}/>
                </button>
              </div>
            ))}
            {selectedItems.length === 0 && (
              <div className="text-center py-4 text-gray-400 text-sm italic">No dishes added yet.</div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
          <FormField label="VAT (%)" required><input type="number" className={inputClass} required value={form.vat || 10} onChange={e => {
            const v = Number(e.target.value);
            setForm({ ...form, vat: v, totalAmount: calculateTotal(selectedItems, v) });
          }} /></FormField>
          <FormField label="Status"><select className={inputClass} value={form.status || 'Pending'} onChange={e => setForm({ ...form, status: e.target.value })}>{ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}</select></FormField>
          <div className="bg-blue-50 p-3 rounded-lg flex flex-col justify-center border border-blue-100">
            <span className="text-xs text-blue-600 font-medium">TOTAL AMOUNT</span>
            <span className="text-lg font-bold text-blue-700">{formatVND(form.totalAmount || 0)}</span>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog open={!!del} title="Delete Order" message={`Delete order "${del?.orderID}"?`} onConfirm={onDelete} onCancel={() => setDel(null)} loading={saving} />

      {/* Invoice Modal */}
      <FormModal open={!!invoice} title="Order Invoice" onClose={() => setInvoice(null)} onSubmit={(e) => { e.preventDefault(); setInvoice(null); }}>
        <div className="bg-white p-2 text-gray-800">
          <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-blue-600">Restaurant Receipt</h2>
            <p className="text-sm text-gray-500 mt-1">{invoice?.branchName || 'Official Branch'}</p>
            <p className="text-xs text-gray-400">Order ID: {invoice?.orderID}</p>
          </div>

          <div className="flex justify-between text-sm mb-6 bg-gray-50 p-3 rounded-lg">
            <div>
              <p className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Customer</p>
              <p className="font-semibold">{invoice?.customerName || invoice?.customerID}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Date & Time</p>
              <p className="font-semibold">{formatDateTime(invoice?.orderTime || '')}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead className="border-b text-gray-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoice?.orderDetails?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-medium">{item.dishName}</td>
                  <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-600">{formatVND(item.price)}</td>
                  <td className="py-3 text-right font-semibold">{formatVND(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatVND((invoice?.totalAmount || 0) / (1 + (invoice?.vat || 0) / 100))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">VAT ({invoice?.vat}%)</span>
              <span>{formatVND((invoice?.totalAmount || 0) - (invoice?.totalAmount || 0) / (1 + (invoice?.vat || 0) / 100))}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-blue-600 mt-2 border-t-2 border-blue-100 pt-2">
              <span>GRAND TOTAL</span>
              <span>{formatVND(invoice?.totalAmount || 0)}</span>
            </div>
          </div>

          <div className="text-center mt-8 text-xs text-gray-400 italic">
            Thank you for dining with us! Please come again.
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button type="button" onClick={() => window.print()} className="bg-gray-800 text-white px-6 py-2 rounded-xl hover:bg-gray-700 flex items-center gap-2 transition-all">
            <Receipt size={18}/> Print Receipt
          </button>
        </div>
      </FormModal>
    </div>
  );
};

export default OrderPage;
