import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Tag, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Trash2, 
  Edit2, 
  X, 
  ChevronRight, 
  Monitor, 
  Factory,
  Users
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface ProductModel {
  id: string;
  name: string;
  basePrice: number;
  category: string;
  createdAt: string;
}

export interface ProductionUnitMaster {
  id: string;
  name: string;
  location: string;
  supervisor: string;
  capacity: string;
  modelRates?: { modelId: string; rate: number }[];
}

export interface SupplierMaster {
  id: string;
  name: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  paymentTerms: string;
  notes: string;
  createdAt: string;
}

export interface ExpenseMaster {
  id: string;
  name: string;
  createdAt: string;
}

export interface IncomeMaster {
  id: string;
  name: string;
  createdAt: string;
}

export interface TransportMaster {
  id: string;
  name: string;
  createdAt: string;
}

export interface CustomerMaster {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  createdAt: string;
}

export default function ProductMaster() {
  const [activeTab, setActiveTab] = useState<'models' | 'units' | 'suppliers' | 'expenses' | 'income' | 'customers' | 'transports'>('models');
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [units, setUnits] = useState<ProductionUnitMaster[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierMaster[]>([]);
  const [expenses, setExpenses] = useState<ExpenseMaster[]>([]);
  const [incomes, setIncomes] = useState<IncomeMaster[]>([]);
  const [customers, setCustomers] = useState<CustomerMaster[]>([]);
  const [transports, setTransports] = useState<TransportMaster[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);
  
  const [productFormData, setProductFormData] = useState<Partial<ProductModel>>({ category: 'Nighty' });
  const [unitFormData, setUnitFormData] = useState<Partial<ProductionUnitMaster>>({ modelRates: [] });
  const [supplierFormData, setSupplierFormData] = useState<Partial<SupplierMaster>>({ paymentTerms: 'Net 30' });
  const [expenseFormData, setExpenseFormData] = useState<Partial<ExpenseMaster>>({});
  const [incomeFormData, setIncomeFormData] = useState<Partial<IncomeMaster>>({});
  const [customerFormData, setCustomerFormData] = useState<Partial<CustomerMaster>>({});
  const [transportFormData, setTransportFormData] = useState<Partial<TransportMaster>>({});

  useEffect(() => {
    const deduplicateByIdLocal = <T extends { id: string }>(items: T[]): T[] => {
      const seen = new Set<string>();
      return items.filter(item => {
        if (!item || !item.id) return false;
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    };

    const savedProducts = localStorage.getItem('inven_product_master');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        const deduped = deduplicateByIdLocal(parsed);
        setProducts(deduped);
        if (deduped.length !== parsed.length) {
          localStorage.setItem('inven_product_master', JSON.stringify(deduped));
        }
      } catch (e) { console.error(e); }
    } else {
      const demo = [
        { id: 'MOD-001', name: 'Flora Summer XL', basePrice: 450, category: 'Nighty', createdAt: new Date().toISOString() },
        { id: 'MOD-002', name: 'Royal Silk XXL', basePrice: 850, category: 'Premium', createdAt: new Date().toISOString() }
      ];
      setProducts(demo);
      localStorage.setItem('inven_product_master', JSON.stringify(demo));
    }

    const savedUnits = localStorage.getItem('inven_unit_master');
    if (savedUnits) {
       try {
         const parsed = JSON.parse(savedUnits);
         const deduped = deduplicateByIdLocal(parsed);
         setUnits(deduped);
         if (deduped.length !== parsed.length) {
           localStorage.setItem('inven_unit_master', JSON.stringify(deduped));
         }
       } catch (e) { console.error(e); }
    } else {
      const demoUnits = [
        { id: 'U-001', name: 'UNIT-1', location: 'Floor A', supervisor: 'Rahul Sharma', capacity: '500 pcs/day' },
        { id: 'U-002', name: 'UNIT-2', location: 'Floor B', supervisor: 'Sriya Patel', capacity: '300 pcs/day' },
        { id: 'U-003', name: 'UNIT-3', location: 'Annex 1', supervisor: 'Amit Kumar', capacity: '450 pcs/day' }
      ];
      setUnits(demoUnits);
      localStorage.setItem('inven_unit_master', JSON.stringify(demoUnits));
    }

    const savedSuppliers = localStorage.getItem('inven_suppliers');
    if (savedSuppliers) {
      try {
        const parsed = JSON.parse(savedSuppliers);
        const deduped = deduplicateByIdLocal(parsed);
        setSuppliers(deduped);
        if (deduped.length !== parsed.length) {
          localStorage.setItem('inven_suppliers', JSON.stringify(deduped));
        }
      } catch (e) { console.error(e); }
    } else {
      const demoSuppliers = [
        {
          id: 'SUP-0001',
          name: 'Janice Miller',
          companyName: 'TechFlow Solutions',
          contactPerson: 'Janice Miller',
          phone: '+91 98765 43210',
          email: 'janice@techflow.io',
          address: '42 Textile Park, Surat',
          gstNumber: '24AAAAA0000A1Z5',
          paymentTerms: 'Net 15',
          notes: 'Main fabric vendor',
          createdAt: new Date().toISOString()
        }
      ];
      setSuppliers(demoSuppliers);
      localStorage.setItem('inven_suppliers', JSON.stringify(demoSuppliers));
    }

    const savedExpenses = localStorage.getItem('inven_expense_master');
    if (savedExpenses) {
      try {
        const parsed = JSON.parse(savedExpenses);
        const deduped = deduplicateByIdLocal(parsed);
        setExpenses(deduped);
        if (deduped.length !== parsed.length) {
          localStorage.setItem('inven_expense_master', JSON.stringify(deduped));
        }
      } catch (e) { console.error(e); }
    } else {
      const demoExpenses = [
        { id: 'EXP-001', name: 'Machine Maintenance', createdAt: new Date().toISOString() }
      ];
      setExpenses(demoExpenses);
      localStorage.setItem('inven_expense_master', JSON.stringify(demoExpenses));
    }

    const savedIncomes = localStorage.getItem('inven_income_master');
    if (savedIncomes) {
      try {
        const parsed = JSON.parse(savedIncomes);
        const deduped = deduplicateByIdLocal(parsed);
        setIncomes(deduped);
        if (deduped.length !== parsed.length) {
          localStorage.setItem('inven_income_master', JSON.stringify(deduped));
        }
      } catch (e) { console.error(e); }
    } else {
      const demoIncomes = [
        { id: 'INC-CAT-001', name: 'Product Sales', createdAt: new Date().toISOString() },
        { id: 'INC-CAT-002', name: 'Service Fee', createdAt: new Date().toISOString() },
        { id: 'INC-CAT-003', name: 'Investments', createdAt: new Date().toISOString() }
      ];
      setIncomes(demoIncomes);
      localStorage.setItem('inven_income_master', JSON.stringify(demoIncomes));
    }

    const savedCustomers = localStorage.getItem('inven_customers');
    if (savedCustomers) {
      try {
        const parsed = JSON.parse(savedCustomers);
        const deduped = deduplicateByIdLocal(parsed);
        setCustomers(deduped);
        if (deduped.length !== parsed.length) {
          localStorage.setItem('inven_customers', JSON.stringify(deduped));
        }
      } catch (e) { console.error(e); }
    } else {
      const demoCustomers = [
        {
          id: 'CUS-0001',
          name: 'Anjali Sharma',
          phone: '+91 91234 56789',
          email: 'anjali@demo.com',
          address: '101 Rose Gardens, Mumbai',
          gstNumber: '27AAAAA0000A1Z5',
          createdAt: new Date().toISOString()
        }
      ];
      setCustomers(demoCustomers);
      localStorage.setItem('inven_customers', JSON.stringify(demoCustomers));
    }

    const savedTransports = localStorage.getItem('inven_transports');
    if (savedTransports) {
      try {
        const parsed = JSON.parse(savedTransports);
        const deduped = deduplicateByIdLocal(parsed);
        setTransports(deduped);
        if (deduped.length !== parsed.length) {
          localStorage.setItem('inven_transports', JSON.stringify(deduped));
        }
      } catch (e) { console.error(e); }
    } else {
      const demoTransports = [
        { id: 'TRN-001', name: 'JayanthiTransport', createdAt: new Date().toISOString() },
        { id: 'TRN-002', name: 'V-Xpress', createdAt: new Date().toISOString() }
      ];
      setTransports(demoTransports);
      localStorage.setItem('inven_transports', JSON.stringify(demoTransports));
    }
  }, []);

  const saveProducts = (data: ProductModel[]) => {
    setProducts(data);
    localStorage.setItem('inven_product_master', JSON.stringify(data));
  };

  const saveUnits = (data: ProductionUnitMaster[]) => {
    setUnits(data);
    localStorage.setItem('inven_unit_master', JSON.stringify(data));
  };

  const saveSuppliers = (data: SupplierMaster[]) => {
    setSuppliers(data);
    localStorage.setItem('inven_suppliers', JSON.stringify(data));
  };

  const saveExpenses = (data: ExpenseMaster[]) => {
    setExpenses(data);
    localStorage.setItem('inven_expense_master', JSON.stringify(data));
  };

  const saveIncomes = (data: IncomeMaster[]) => {
    setIncomes(data);
    localStorage.setItem('inven_income_master', JSON.stringify(data));
  };

  const saveCustomers = (data: CustomerMaster[]) => {
    setCustomers(data);
    localStorage.setItem('inven_customers', JSON.stringify(data));
  };

  const saveTransports = (data: TransportMaster[]) => {
    setTransports(data);
    localStorage.setItem('inven_transports', JSON.stringify(data));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'models') {
      if (editingId) {
        const updated = products.map(p => p.id === editingId ? { ...p, ...productFormData as ProductModel } : p);
        saveProducts(updated);
      } else {
        // ID Generation from Settings for Product Model
        const settingsRaw = localStorage.getItem('inven_settings');
        let generatedId = '';
        let settingsParsed: any = null;
        if (settingsRaw) {
          try { settingsParsed = JSON.parse(settingsRaw); } catch (e) {}
        }
        
        const prefix = settingsParsed?.modelPrefix || 'MOD';
        let nextId = settingsParsed?.nextModelId || 1;
        
        let exists = true;
        while (exists) {
          generatedId = `${prefix}-${nextId.toString().padStart(3, '0')}`;
          exists = products.some(p => p && p.id === generatedId);
          if (exists) {
            nextId++;
          }
        }
        
        if (settingsParsed) {
          localStorage.setItem('inven_settings', JSON.stringify({
            ...settingsParsed,
            nextModelId: nextId + 1
          }));
        }

        const newProduct: ProductModel = {
          ...productFormData as ProductModel,
          id: generatedId,
          createdAt: new Date().toISOString(),
        };
        saveProducts([newProduct, ...products]);
      }
    } else if (activeTab === 'units') {
      if (editingId) {
        const updated = units.map(u => u.id === editingId ? { ...u, ...unitFormData as ProductionUnitMaster } : u);
        saveUnits(updated);
      } else {
        let generatedId = '';
        let exists = true;
        while (exists) {
          generatedId = `U-${Math.floor(100 + Math.random() * 900)}`;
          exists = units.some(u => u && u.id === generatedId);
        }

        const newUnit: ProductionUnitMaster = {
          ...unitFormData as ProductionUnitMaster,
          id: generatedId,
        };
        saveUnits([newUnit, ...units]);
      }
    } else if (activeTab === 'suppliers') {
      if (editingId) {
        const updated = suppliers.map(s => s.id === editingId ? { ...s, ...supplierFormData as SupplierMaster } : s);
        saveSuppliers(updated);
      } else {
        // ID Generation from Settings
        const settingsRaw = localStorage.getItem('inven_settings');
        let generatedId = '';
        let settingsParsed: any = null;
        if (settingsRaw) {
          try { settingsParsed = JSON.parse(settingsRaw); } catch (e) {}
        }
        
        const prefix = settingsParsed?.supplierPrefix || 'SUP';
        let nextId = settingsParsed?.nextSupplierId || 1;
        
        let exists = true;
        while (exists) {
          generatedId = `${prefix}-${nextId.toString().padStart(4, '0')}`;
          exists = suppliers.some(s => s && s.id === generatedId);
          if (exists) {
            nextId++;
          }
        }
        
        if (settingsParsed) {
          localStorage.setItem('inven_settings', JSON.stringify({
            ...settingsParsed,
            nextSupplierId: nextId + 1
          }));
        }

        const newSupplier: SupplierMaster = {
          ...supplierFormData as SupplierMaster,
          id: generatedId,
          createdAt: new Date().toISOString(),
        };
        saveSuppliers([newSupplier, ...suppliers]);
      }
    } else if (activeTab === 'expenses') {
      if (editingId) {
        const updated = expenses.map(e => e.id === editingId ? { ...e, ...expenseFormData as ExpenseMaster } : e);
        saveExpenses(updated);
      } else {
        let generatedId = '';
        let exists = true;
        while (exists) {
          generatedId = `EXP-${Math.floor(100 + Math.random() * 900)}`;
          exists = expenses.some(e => e && e.id === generatedId);
        }

        const newExpense: ExpenseMaster = {
          ...expenseFormData as ExpenseMaster,
          id: generatedId,
          createdAt: new Date().toISOString(),
        };
        saveExpenses([newExpense, ...expenses]);
      }
    } else if (activeTab === 'income') {
      if (editingId) {
         const updated = incomes.map(b => b.id === editingId ? { ...b, ...incomeFormData as IncomeMaster } : b);
         saveIncomes(updated);
      } else {
        let generatedId = '';
        let exists = true;
        while (exists) {
          generatedId = `INC-CAT-${Math.floor(100 + Math.random() * 900)}`;
          exists = incomes.some(b => b && b.id === generatedId);
        }

        const newIncome: IncomeMaster = {
          ...incomeFormData as IncomeMaster,
          id: generatedId,
          createdAt: new Date().toISOString(),
        };
        saveIncomes([newIncome, ...incomes]);
      }
    } else if (activeTab === 'customers') {
      if (editingId) {
        const updated = customers.map(c => c.id === editingId ? { ...c, ...customerFormData as CustomerMaster } : c);
        saveCustomers(updated);
      } else {
        let generatedId = '';
        let exists = true;
        while (exists) {
          generatedId = `CUS-${Math.floor(1000 + Math.random() * 9000)}`;
          exists = customers.some(c => c && c.id === generatedId);
        }

        const newCustomer: CustomerMaster = {
          ...customerFormData as CustomerMaster,
          id: generatedId,
          createdAt: new Date().toISOString(),
        };
        saveCustomers([newCustomer, ...customers]);
      }
    } else if (activeTab === 'transports') {
      if (editingId) {
        const updated = transports.map(t => t.id === editingId ? { ...t, ...transportFormData as TransportMaster } : t);
        saveTransports(updated);
      } else {
        let generatedId = '';
        let exists = true;
        while (exists) {
          generatedId = `TRN-${Math.floor(100 + Math.random() * 900)}`;
          exists = transports.some(t => t && t.id === generatedId);
        }

        const newTransport: TransportMaster = {
          ...transportFormData as TransportMaster,
          id: generatedId,
          createdAt: new Date().toISOString(),
        };
        saveTransports([newTransport, ...transports]);
      }
    }

    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setProductFormData({ category: 'Nighty' });
    setUnitFormData({ modelRates: [] });
    setSupplierFormData({ paymentTerms: 'Net 30' });
    setExpenseFormData({});
    setIncomeFormData({});
    setCustomerFormData({});
    setTransportFormData({});
  };

  const deleteItem = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    const id = itemToDelete.id;
    if (activeTab === 'models') {
      saveProducts(products.filter(p => p.id !== id));
    } else if (activeTab === 'units') {
      saveUnits(units.filter(u => u.id !== id));
    } else if (activeTab === 'suppliers') {
      saveSuppliers(suppliers.filter(s => s.id !== id));
    } else if (activeTab === 'customers') {
      saveCustomers(customers.filter(c => c.id !== id));
    } else if (activeTab === 'transports') {
      saveTransports(transports.filter(t => t.id !== id));
    } else if (activeTab === 'income') {
      saveIncomes(incomes.filter(b => b.id !== id));
    } else {
      saveExpenses(expenses.filter(e => e.id !== id));
    }
    
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const filteredItems = activeTab === 'models' 
    ? products.filter(p => p && (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p?.id || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : activeTab === 'units' 
      ? units.filter(u => u && (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u?.id || '').toLowerCase().includes(searchQuery.toLowerCase()))
      : activeTab === 'suppliers'
        ? suppliers.filter(s => s && ((s.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (s.id || '').toLowerCase().includes(searchQuery.toLowerCase())))
        : activeTab === 'customers'
          ? customers.filter(c => c && ((c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.id || '').toLowerCase().includes(searchQuery.toLowerCase())))
          : activeTab === 'transports'
            ? transports.filter(t => t && ((t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (t.id || '').toLowerCase().includes(searchQuery.toLowerCase())))
            : activeTab === 'income'
              ? incomes.filter(b => b && ((b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (b.id || '').toLowerCase().includes(searchQuery.toLowerCase())))
              : expenses.filter(e => e && ((e.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.id || '').toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Data Management</h2>
          <p className="text-sm text-slate-500">Configure core product models and production units.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab === 'models' ? 'Model' : activeTab === 'units' ? 'Unit' : activeTab === 'suppliers' ? 'Supplier' : activeTab === 'customers' ? 'Customer' : activeTab === 'transports' ? 'Transport' : activeTab === 'income' ? 'Income Category' : 'Expense'}
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 w-fit rounded-2xl">
        <button 
          onClick={() => { setActiveTab('models'); setSearchQuery(''); }}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === 'models' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Product Models
        </button>
        <button 
          onClick={() => { setActiveTab('units'); setSearchQuery(''); }}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === 'units' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Production Units
        </button>
        <button 
          onClick={() => { setActiveTab('suppliers'); setSearchQuery(''); }}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === 'suppliers' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Suppliers
        </button>
        <button 
          onClick={() => { setActiveTab('expenses'); setSearchQuery(''); }}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === 'expenses' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Expenses
        </button>
        <button 
          onClick={() => { setActiveTab('income'); setSearchQuery(''); }}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === 'income' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Income
        </button>
        <button 
          onClick={() => { setActiveTab('customers'); setSearchQuery(''); }}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === 'customers' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Customers
        </button>
        <button 
          onClick={() => { setActiveTab('transports'); setSearchQuery(''); }}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeTab === 'transports' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Transports
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeTab === 'models' ? (
          (filteredItems as ProductModel[]).filter(p => p && p.name).map((product) => (
            <div key={product.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="flex gap-1">
                    <button 
                      onClick={() => { setEditingId(product.id); setProductFormData(product); setIsFormOpen(true); }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteItem(product.id, product.name)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{product.id}</p>
                  <h4 className="text-lg font-bold text-slate-800">{product.name}</h4>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Base Price</p>
                  <p className="text-xl font-bold text-slate-900">₹{product.basePrice}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-indigo-600 uppercase shadow-sm">
                    {product.category}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : activeTab === 'units' ? (
          (filteredItems as ProductionUnitMaster[]).filter(u => u && u.name).map((unit) => (
            <div key={unit.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="flex gap-1">
                    <button 
                      onClick={() => { setEditingId(unit.id); setUnitFormData(unit); setIsFormOpen(true); }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteItem(unit.id, unit.name)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Factory className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{unit.id}</p>
                  <h4 className="text-lg font-bold text-slate-800">{unit.name}</h4>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Supervisor</span>
                  <span className="text-slate-800 font-bold">{unit.supervisor}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Location</span>
                  <span className="text-slate-800 font-bold">{unit.location}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Capacity</span>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">{unit.capacity}</span>
                </div>
                {unit.modelRates && unit.modelRates.length > 0 && (
                  <div className="pt-2 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Model Rates</p>
                    <div className="space-y-1">
                      {unit.modelRates.map(mr => {
                        const model = products.find(p => p && p.id === mr.modelId);
                        return (
                          <div key={mr.modelId} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 font-medium">{model?.name || 'Unknown'}</span>
                            <span className="text-slate-900 font-bold">₹{mr.rate}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : activeTab === 'suppliers' ? (
          (filteredItems as SupplierMaster[]).filter(s => s && (s.companyName || s.name)).map((supplier) => (
            <div key={supplier.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{supplier.id}</p>
                  <h4 className="text-xl font-extrabold text-slate-800 truncate leading-tight">{supplier.companyName}</h4>
                  <p className="text-sm text-slate-500 font-medium">{supplier.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                   <span className="text-slate-400">GST: {supplier.gstNumber || 'N/A'}</span>
                   <span className="text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-full">{supplier.paymentTerms}</span>
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {supplier.phone}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2 leading-relaxed">{supplier.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-50">
                <button 
                  onClick={() => { setEditingId(supplier.id); setSupplierFormData(supplier); setIsFormOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#f0f4ff] text-indigo-600 text-sm font-bold hover:bg-opacity-80 transition-all active:scale-95"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => deleteItem(supplier.id, supplier.companyName)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#fff0f0] text-rose-600 text-sm font-bold hover:bg-opacity-80 transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : activeTab === 'customers' ? (
          (filteredItems as CustomerMaster[]).filter(c => c && c.name).map((customer) => (
            <div key={customer.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex items-start gap-4 mb-6">
                 <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                    <Users className="w-7 h-7" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{customer.id}</p>
                    <h4 className="text-xl font-extrabold text-slate-800 truncate leading-tight">{customer.name}</h4>
                    <p className="text-sm text-slate-500 font-medium">Customer</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">GST: {customer.gstNumber || 'N/A'}</span>
                 </div>
                 
                 <div className="space-y-2.5">
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                       <Phone className="w-4 h-4 text-slate-400" />
                       {customer.phone}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                       <Mail className="w-4 h-4 text-slate-400" />
                       <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                       <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                       <span className="line-clamp-2 leading-relaxed">{customer.address}</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-50">
                 <button 
                    onClick={() => { setEditingId(customer.id); setCustomerFormData(customer); setIsFormOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#f0f4ff] text-indigo-600 text-sm font-bold hover:bg-opacity-80 transition-all active:scale-95"
                 >
                    <Edit2 className="w-4 h-4" />
                    Edit
                 </button>
                 <button 
                    onClick={() => deleteItem(customer.id, customer.name)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#fff0f0] text-rose-600 text-sm font-bold hover:bg-opacity-80 transition-all active:scale-95"
                 >
                    <Trash2 className="w-4 h-4" />
                    Delete
                 </button>
              </div>
            </div>
          ))
        ) : activeTab === 'transports' ? (
          (filteredItems as TransportMaster[]).filter(t => t && t.name).map((transport) => (
            <div key={transport.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="flex gap-1">
                    <button 
                      onClick={() => { setEditingId(transport.id); setTransportFormData(transport); setIsFormOpen(true); }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteItem(transport.id, transport.name)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{transport.id}</p>
                  <h4 className="text-lg font-bold text-slate-800">{transport.name}</h4>
                </div>
              </div>
            </div>
          ))
        ) : activeTab === 'income' ? (
          (filteredItems as IncomeMaster[]).filter(b => b && b.name).map((income) => (
            <div key={income.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="flex gap-1">
                    <button 
                      onClick={() => { setEditingId(income.id); setIncomeFormData(income); setIsFormOpen(true); }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteItem(income.id, income.name)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 italic font-black text-xl">
                  ₹
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{income.id}</p>
                  <h4 className="text-lg font-bold text-slate-800">{income.name}</h4>
                </div>
              </div>
            </div>
          ))
        ) : (
          (filteredItems as ExpenseMaster[]).filter(e => e && e.name).map((expense) => (
            <div key={expense.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="flex gap-1">
                    <button 
                      onClick={() => { setEditingId(expense.id); setExpenseFormData(expense); setIsFormOpen(true); }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteItem(expense.id, expense.name)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 italic font-black text-xl">
                  ₹
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{expense.id}</p>
                  <h4 className="text-lg font-bold text-slate-800">{expense.name}</h4>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {editingId ? 'Edit' : 'Add New'} {activeTab === 'models' ? 'Model' : activeTab === 'units' ? 'Production Unit' : activeTab === 'suppliers' ? 'Supplier' : activeTab === 'customers' ? 'Customer' : activeTab === 'transports' ? 'Transport' : 'Expense Category'}
                </h3>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {activeTab === 'models' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Model Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                      value={productFormData.name || ''}
                      onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Base Price (₹)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                      value={productFormData.basePrice || ''}
                      onChange={(e) => setProductFormData({...productFormData, basePrice: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Category</label>
                    <select 
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm appearance-none cursor-pointer"
                      value={productFormData.category || 'Nighty'}
                      onChange={(e) => setProductFormData({...productFormData, category: e.target.value})}
                    >
                      <option>Nighty</option>
                      <option>Premium</option>
                      <option>Standard</option>
                    </select>
                  </div>
                </>
              ) : activeTab === 'units' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Unit Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. UNIT-1"
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                      value={unitFormData.name || ''}
                      onChange={(e) => setUnitFormData({...unitFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Supervisor</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                      value={unitFormData.supervisor || ''}
                      onChange={(e) => setUnitFormData({...unitFormData, supervisor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Location</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                      value={unitFormData.location || ''}
                      onChange={(e) => setUnitFormData({...unitFormData, location: e.target.value})}
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Capacity</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. 500 pcs/day"
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                      value={unitFormData.capacity || ''}
                      onChange={(e) => setUnitFormData({...unitFormData, capacity: e.target.value})}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1 text-indigo-600">Model Specific Rates (₹)</label>
                      <button 
                        type="button"
                        onClick={() => {
                          const currentRates = unitFormData.modelRates || [];
                          const availableModel = products.find(p => p && !currentRates.some(r => r && r.modelId === p.id));
                          if (availableModel) {
                            setUnitFormData({
                              ...unitFormData,
                              modelRates: [...currentRates, { modelId: availableModel.id, rate: availableModel.basePrice }]
                            });
                          } else if (products.length > 0 && products[0]) {
                            setUnitFormData({
                              ...unitFormData,
                              modelRates: [...currentRates, { modelId: products[0].id, rate: products[0].basePrice }]
                            });
                          }
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-xl"
                      >
                        <Plus className="w-3 h-3" />
                        Add Rate
                      </button>
                    </div>

                    <div className="space-y-3">
                      {unitFormData.modelRates?.map((rate, index) => (
                        <div key={index} className="flex gap-3 items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                          <div className="flex-1 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Model</label>
                            <select 
                              className="w-full bg-white border-none rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 appearance-none shadow-sm cursor-pointer"
                              value={rate.modelId}
                              onChange={(e) => {
                                const newModelId = e.target.value;
                                const model = products.find(p => p && p.id === newModelId);
                                const newRates = [...(unitFormData.modelRates || [])];
                                newRates[index].modelId = newModelId;
                                // Automatically update the rate to the model's base price when model is changed
                                if (model) {
                                  newRates[index].rate = model.basePrice;
                                }
                                setUnitFormData({ ...unitFormData, modelRates: newRates });
                              }}
                            >
                              {products.filter(p => p && p.id).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="w-32 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Rate (₹)</label>
                            <input 
                              type="number"
                              className="w-full bg-white border-none rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                              value={rate.rate !== undefined && rate.rate !== null && !isNaN(rate.rate) ? rate.rate : ''}
                              onChange={(e) => {
                                const newRates = [...(unitFormData.modelRates || [])];
                                newRates[index].rate = parseFloat(e.target.value);
                                setUnitFormData({ ...unitFormData, modelRates: newRates });
                              }}
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              const newRates = unitFormData.modelRates?.filter((_, i) => i !== index);
                              setUnitFormData({ ...unitFormData, modelRates: newRates });
                            }}
                            className="p-3 text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-xl shadow-sm border border-slate-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(!unitFormData.modelRates || unitFormData.modelRates.length === 0) && (
                        <p className="text-center py-6 bg-slate-50/50 rounded-2xl text-[11px] text-slate-400 font-medium italic border border-dashed border-slate-200">
                          No specific model rates added.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : activeTab === 'suppliers' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">GST Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                      value={supplierFormData.gstNumber || ''}
                      onChange={(e) => setSupplierFormData({...supplierFormData, gstNumber: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Supplier Name</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                        value={supplierFormData.name || ''}
                        onChange={(e) => setSupplierFormData({...supplierFormData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Company Name</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                        value={supplierFormData.companyName || ''}
                        onChange={(e) => setSupplierFormData({...supplierFormData, companyName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Contact Person</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                        value={supplierFormData.contactPerson || ''}
                        onChange={(e) => setSupplierFormData({...supplierFormData, contactPerson: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Payment Terms</label>
                      <select 
                        className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm appearance-none cursor-pointer"
                        value={supplierFormData.paymentTerms || 'Net 30'}
                        onChange={(e) => setSupplierFormData({...supplierFormData, paymentTerms: e.target.value})}
                      >
                        <option>Net 15</option>
                        <option>Net 30</option>
                        <option>Net 45</option>
                        <option>Due on Receipt</option>
                        <option>Advance</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Phone</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                        value={supplierFormData.phone || ''}
                        onChange={(e) => setSupplierFormData({...supplierFormData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Email</label>
                      <input 
                        required
                        type="email" 
                        className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                        value={supplierFormData.email || ''}
                        onChange={(e) => setSupplierFormData({...supplierFormData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Address</label>
                    <textarea 
                      required
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm resize-none"
                      rows={2}
                      value={supplierFormData.address || ''}
                      onChange={(e) => setSupplierFormData({...supplierFormData, address: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Notes</label>
                    <textarea 
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm resize-none"
                      rows={2}
                      value={supplierFormData.notes || ''}
                      onChange={(e) => setSupplierFormData({...supplierFormData, notes: e.target.value})}
                    />
                  </div>
                </>
              ) : activeTab === 'customers' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Customer Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                      value={customerFormData.name || ''}
                      onChange={(e) => setCustomerFormData({...customerFormData, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Phone</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                        value={customerFormData.phone || ''}
                        onChange={(e) => setCustomerFormData({...customerFormData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Email</label>
                      <input 
                        required
                        type="email" 
                        className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                        value={customerFormData.email || ''}
                        onChange={(e) => setCustomerFormData({...customerFormData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">GST Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                      value={customerFormData.gstNumber || ''}
                      onChange={(e) => setCustomerFormData({...customerFormData, gstNumber: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Address</label>
                    <textarea 
                      required
                      className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm resize-none"
                      rows={2}
                      value={customerFormData.address || ''}
                      onChange={(e) => setCustomerFormData({...customerFormData, address: e.target.value})}
                    />
                  </div>
                </>
              ) : activeTab === 'transports' ? (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Transport Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. JayanthiTransport"
                        className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                        value={transportFormData.name || ''}
                        onChange={(e) => setTransportFormData({...transportFormData, name: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              ) : activeTab === 'income' ? (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Income Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Service Fee"
                        className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                        value={incomeFormData.name || ''}
                        onChange={(e) => setIncomeFormData({...incomeFormData, name: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Expense Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Machine Maintenance"
                        className="w-full bg-[#f8faff] border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-700 shadow-sm"
                        value={expenseFormData.name || ''}
                        onChange={(e) => setExpenseFormData({...expenseFormData, name: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                >
                  Save {activeTab === 'models' ? 'Model' : activeTab === 'units' ? 'Unit' : activeTab === 'suppliers' ? 'Supplier' : activeTab === 'customers' ? 'Customer' : activeTab === 'transports' ? 'Transport' : 'Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">
              Are you sure you want to delete <span className="font-bold text-slate-700">"{itemToDelete?.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => { setIsDeleteDialogOpen(false); setItemToDelete(null); }}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
