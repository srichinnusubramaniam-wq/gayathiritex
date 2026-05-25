import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Cloud, Database, Key, Check, Copy, AlertCircle, UploadCloud, DownloadCloud, ExternalLink } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';
import { syncAllToSupabase, syncAllFromSupabase, subscribeToSyncStatus, forceTriggerUnpack } from '../lib/sync';

export default function Settings() {
  const [supplierPrefix, setSupplierPrefix] = useState('SUP');
  const [nextSupplierId, setNextSupplierId] = useState(1);
  const [modelPrefix, setModelPrefix] = useState('MOD');
  const [nextModelId, setNextModelId] = useState(1);
  const [prodPrefix, setProdPrefix] = useState('PRD');
  const [nextProdId, setNextProdId] = useState(1);
  const [invoicePrefix, setInvoicePrefix] = useState('GT');
  const [invoiceYear, setInvoiceYear] = useState('25-26');
  const [nextInvoiceId, setNextInvoiceId] = useState(1);
  const [companyName, setCompanyName] = useState('GAYATHRI TEXTILES');
  const [companyAddress, setCompanyAddress] = useState('No.25B, South Vaniyar Street, Near TDCC BANK, Thathiengarpet, Trichy, Tamil Nadu - 621214');
  const [companyLogo, setCompanyLogo] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [isSaved, setIsSaved] = useState(false);

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error' | 'not-configured'>('idle');
  const [lastSync, setLastSync] = useState('');
  const [syncError, setSyncError] = useState('');
  const [copied, setCopied] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const settings = localStorage.getItem('inven_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setSupplierPrefix(parsed.supplierPrefix || 'SUP');
      setNextSupplierId(parsed.nextSupplierId || 1);
      setModelPrefix(parsed.modelPrefix || 'MOD');
      setNextModelId(parsed.nextModelId || 1);
      setProdPrefix(parsed.prodPrefix || 'PRD');
      setNextProdId(parsed.nextProdId || 1);
      setInvoicePrefix(parsed.invoicePrefix || 'GT');
      setInvoiceYear(parsed.invoiceYear || '25-26');
      setNextInvoiceId(parsed.nextInvoiceId || 1);
      setCompanyName(parsed.companyName || 'GAYATHRI TEXTILES');
      setCompanyAddress(parsed.companyAddress || 'No.25B, South Vaniyar Street, Near TDCC BANK, Thathiengarpet, Trichy, Tamil Nadu - 621214');
      setCompanyLogo(parsed.companyLogo || '');
      setLowStockThreshold(parsed.lowStockThreshold || 10);
    }

    // Load Supabase initial values
    const sbConfig = getSupabaseConfig();
    if (sbConfig) {
      setSupabaseUrl(sbConfig.url || '');
      setSupabaseKey(sbConfig.anonKey || '');
    }

    // Subscribe to sync engine events
    const unsubscribe = subscribeToSyncStatus((status, time, err) => {
      setSyncStatus(status);
      if (time) setLastSync(time);
      if (err) setSyncError(err);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = () => {
    const settings = {
      supplierPrefix,
      nextSupplierId,
      modelPrefix,
      nextModelId,
      prodPrefix,
      nextProdId,
      invoicePrefix,
      invoiceYear,
      nextInvoiceId,
      companyName,
      companyAddress,
      companyLogo,
      lowStockThreshold
    };
    localStorage.setItem('inven_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSupabase = () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      saveSupabaseConfig(null);
      setActionFeedback({ type: 'success', message: 'Credentials cleared. Supabase deactivated.' });
    } else {
      const urlString = supabaseUrl.trim();
      let isValid = false;
      try {
        const u = new URL(urlString);
        isValid = u.protocol === 'http:' || u.protocol === 'https:';
      } catch (_) {
        isValid = false;
      }

      if (!isValid) {
        setActionFeedback({ type: 'error', message: 'Invalid URL format. Must start with http:// or https://' });
        setTimeout(() => setActionFeedback(null), 4000);
        return;
      }

      saveSupabaseConfig({ url: urlString, anonKey: supabaseKey.trim() });
      setActionFeedback({ type: 'success', message: 'Supabase credentials saved successfully!' });
      // Trigger event to notify sync engine
      window.dispatchEvent(new Event('inven_localstorage_sync'));
    }
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleManualPush = async () => {
    setActionFeedback(null);
    const result = await syncAllToSupabase();
    if (result.success) {
      setActionFeedback({ type: 'success', message: result.message });
    } else {
      setActionFeedback({ type: 'error', message: result.message });
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleManualPull = async () => {
    if (!window.confirm('This will OVERWRITE all current information in this browser session with the dataset retrieved from Supabase. Do you wish to continue?')) {
      return;
    }
    setActionFeedback(null);
    const result = await syncAllFromSupabase();
    if (result.success) {
      setActionFeedback({ type: 'success', message: result.message });
    } else {
      setActionFeedback({ type: 'error', message: result.message });
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleForceUnpack = async () => {
    setActionFeedback(null);
    const result = await forceTriggerUnpack();
    if (result.success) {
      setActionFeedback({ type: 'success', message: result.message });
    } else {
      setActionFeedback({ type: 'error', message: result.message });
    }
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const [activeSqlTab, setActiveSqlTab] = useState<'sync' | 'full' | 'upgrade'>('sync');

  const syncSchema = `-- Copy and execute this SQL statement in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS inven_sync (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE inven_sync ENABLE ROW LEVEL SECURITY;

-- Allow anonymous & authenticated access for storage operations
CREATE POLICY "Allow public select" ON inven_sync FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON inven_sync FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON inven_sync FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON inven_sync FOR DELETE USING (true);`;

  const fullSchema = `-- SUPABASE FULL RELATIONAL SCHEMAS & AUTO-UNPACKING TRIGGERS
-- This script creates the 12 business and master tables and creates triggers that
-- automatically extract your records from 'inven_sync' on the fly.

-- 1. Suppliers Registry
CREATE TABLE IF NOT EXISTS public.inven_suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company_name TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    gst_number TEXT,
    payment_terms TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
);

-- 2. Customers Registry
CREATE TABLE IF NOT EXISTS public.inven_customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE
);

-- 3. Fabrics & Goods Inventory
CREATE TABLE IF NOT EXISTS public.inven_inventory (
    id TEXT PRIMARY KEY,
    supplier_id TEXT,
    supplier_name TEXT,
    fabric_type TEXT,
    price_per_meter NUMERIC,
    quantity NUMERIC,
    unit TEXT,
    entry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE,
    payment_status TEXT,
    paid_amount NUMERIC
);

-- 4. Expenses Records
CREATE TABLE IF NOT EXISTS public.inven_expense_records (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    category_name TEXT,
    amount NUMERIC,
    date DATE,
    payment_mode TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
);

-- 5. Incomes Records
CREATE TABLE IF NOT EXISTS public.inven_income_records (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    category_name TEXT,
    amount NUMERIC,
    date DATE,
    payment_mode TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE
);

-- 6. Production Tasks & Assignments
CREATE TABLE IF NOT EXISTS public.inven_production (
    id TEXT PRIMARY KEY,
    inventory_item_id TEXT,
    fabric_type TEXT,
    unit TEXT,
    size TEXT,
    model_name TEXT,
    quantity NUMERIC,
    rate NUMERIC,
    assigned_at TIMESTAMP WITH TIME ZONE,
    assigned_date DATE,
    expected_date DATE,
    status TEXT,
    all_pieces_delivered BOOLEAN,
    all_meters_delivered BOOLEAN,
    balance_pieces NUMERIC,
    balance_meters NUMERIC,
    finished_pieces NUMERIC,
    finished_meters NUMERIC,
    customer_id TEXT,
    paid_amount NUMERIC,
    payment_status TEXT,
    payment_date DATE
);

-- 7. Invoices Table
CREATE TABLE IF NOT EXISTS public.inven_generated_invoices (
    id TEXT PRIMARY KEY,
    invoice_no TEXT,
    date DATE,
    term TEXT,
    buyer_name TEXT,
    buyer_address TEXT,
    buyer_phone TEXT,
    buyer_gstin TEXT,
    items JSONB,
    total_qty NUMERIC,
    discount NUMERIC,
    taxable_amount NUMERIC,
    cgst NUMERIC,
    sgst NUMERIC,
    igst NUMERIC,
    round_off NUMERIC,
    total_amount NUMERIC,
    amount_in_words TEXT,
    transport TEXT,
    ship_to_name TEXT,
    ship_to_address TEXT,
    lr_date DATE,
    status TEXT,
    paid_amount NUMERIC
);

-- 8. Product Models Master List
CREATE TABLE IF NOT EXISTS public.inven_product_master (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_price NUMERIC,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE
);

-- 9. Production Units Master List
CREATE TABLE IF NOT EXISTS public.inven_unit_master (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    supervisor TEXT,
    capacity TEXT,
    model_rates JSONB
);

-- 10. Expense Categories Master List
CREATE TABLE IF NOT EXISTS public.inven_expense_master (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE
);

-- 11. Income Categories Master List
CREATE TABLE IF NOT EXISTS public.inven_income_master (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE
);

-- 12. Transports Registry Master List
CREATE TABLE IF NOT EXISTS public.inven_transports (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS Policies on tables
ALTER TABLE public.inven_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_expense_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_generated_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_product_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_unit_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_expense_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_income_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_transports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on suppliers" ON public.inven_suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on suppliers" ON public.inven_suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on suppliers" ON public.inven_suppliers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on suppliers" ON public.inven_suppliers FOR DELETE USING (true);

CREATE POLICY "Allow public select on customers" ON public.inven_customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on customers" ON public.inven_customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on customers" ON public.inven_customers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on customers" ON public.inven_customers FOR DELETE USING (true);

CREATE POLICY "Allow public select on inventory" ON public.inven_inventory FOR SELECT USING (true);
CREATE POLICY "Allow public insert on inventory" ON public.inven_inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on inventory" ON public.inven_inventory FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on inventory" ON public.inven_inventory FOR DELETE USING (true);

CREATE POLICY "Allow public select on expense_records" ON public.inven_expense_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert on expense_records" ON public.inven_expense_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on expense_records" ON public.inven_expense_records FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on expense_records" ON public.inven_expense_records FOR DELETE USING (true);

CREATE POLICY "Allow public select on income_records" ON public.inven_income_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert on income_records" ON public.inven_income_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on income_records" ON public.inven_income_records FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on income_records" ON public.inven_income_records FOR DELETE USING (true);

CREATE POLICY "Allow public select on production" ON public.inven_production FOR SELECT USING (true);
CREATE POLICY "Allow public insert on production" ON public.inven_production FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on production" ON public.inven_production FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on production" ON public.inven_production FOR DELETE USING (true);

CREATE POLICY "Allow public select on invoices" ON public.inven_generated_invoices FOR SELECT USING (true);
CREATE POLICY "Allow public insert on invoices" ON public.inven_generated_invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on invoices" ON public.inven_generated_invoices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on invoices" ON public.inven_generated_invoices FOR DELETE USING (true);

-- Policies for Product Models Master List
CREATE POLICY "Allow public select on product_master" ON public.inven_product_master FOR SELECT USING (true);
CREATE POLICY "Allow public insert on product_master" ON public.inven_product_master FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on product_master" ON public.inven_product_master FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on product_master" ON public.inven_product_master FOR DELETE USING (true);

-- Policies for Production Units Master List
CREATE POLICY "Allow public select on unit_master" ON public.inven_unit_master FOR SELECT USING (true);
CREATE POLICY "Allow public insert on unit_master" ON public.inven_unit_master FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on unit_master" ON public.inven_unit_master FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on unit_master" ON public.inven_unit_master FOR DELETE USING (true);

-- Policies for Expense Categories Master List
CREATE POLICY "Allow public select on expense_master" ON public.inven_expense_master FOR SELECT USING (true);
CREATE POLICY "Allow public insert on expense_master" ON public.inven_expense_master FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on expense_master" ON public.inven_expense_master FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on expense_master" ON public.inven_expense_master FOR DELETE USING (true);

-- Policies for Income Categories Master List
CREATE POLICY "Allow public select on income_master" ON public.inven_income_master FOR SELECT USING (true);
CREATE POLICY "Allow public insert on income_master" ON public.inven_income_master FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on income_master" ON public.inven_income_master FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on income_master" ON public.inven_income_master FOR DELETE USING (true);

-- Policies for Transports Master List
CREATE POLICY "Allow public select on transports" ON public.inven_transports FOR SELECT USING (true);
CREATE POLICY "Allow public insert on transports" ON public.inven_transports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on transports" ON public.inven_transports FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on transports" ON public.inven_transports FOR DELETE USING (true);

-- Create a robust date-caster function to handle diverse formats (e.g. DD/MM/YYYY vs YYYY-MM-DD) perfectly
CREATE OR REPLACE FUNCTION public.safe_cast_to_date(val TEXT)
RETURNS DATE AS $$
BEGIN
    IF val IS NULL OR val = '' THEN
        RETURN NULL;
    END IF;
    -- check if format is DD/MM/YYYY or similar
    IF val ~ '^\d{1,2}/\d{1,2}/\d{4}' THEN
        RETURN to_date(val, 'DD/MM/YYYY');
    ELSIF val ~ '^\d{4}-\d{1,2}-\d{1,2}' THEN
        RETURN val::date;
    ELSE
        -- Fallback, try automatic casting and return null if failure
        BEGIN
            RETURN val::date;
        EXCEPTION WHEN OTHERS THEN
            RETURN NULL;
        END;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fully detailed automatic triggers to map keys:
CREATE OR REPLACE FUNCTION public.unpack_inven_sync_payload()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.key = 'inven_suppliers' THEN
        DELETE FROM public.inven_suppliers WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, (item->>'contactPerson')::text, 'Unnamed') as name,
                (item->>'companyName')::text as company_name,
                (item->>'contactPerson')::text as contact_person,
                (item->>'phone')::text as phone,
                (item->>'email')::text as email,
                (item->>'address')::text as address,
                (item->>'gstNumber')::text as gst_number,
                (item->>'paymentTerms')::text as payment_terms,
                (item->>'notes')::text as notes,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_suppliers (id, name, company_name, contact_person, phone, email, address, gst_number, payment_terms, notes, created_at)
        SELECT id, name, company_name, contact_person, phone, email, address, gst_number, payment_terms, notes, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;
        
    ELSIF NEW.key = 'inven_customers' THEN
        DELETE FROM public.inven_customers WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, 'Unnamed') as name,
                (item->>'phone')::text as phone,
                (item->>'email')::text as email,
                (item->>'address')::text as address,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_customers (id, name, phone, email, address, created_at)
        SELECT id, name, phone, email, address, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;
        
    ELSIF NEW.key = 'inven_inventory' THEN
        DELETE FROM public.inven_inventory WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                (item->>'supplierId')::text as supplier_id,
                (item->>'supplierName')::text as supplier_name,
                (item->>'fabricType')::text as fabric_type,
                (item->>'pricePerMeter')::numeric as price_per_meter,
                (item->>'quantity')::numeric as quantity,
                (item->>'unit')::text as unit,
                public.safe_cast_to_date(item->>'entryDate') as entry_date,
                (item->>'createdAt')::timestamp with time zone as created_at,
                (item->>'paymentStatus')::text as payment_status,
                (item->>'paidAmount')::numeric as paid_amount,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_inventory (id, supplier_id, supplier_name, fabric_type, price_per_meter, quantity, unit, entry_date, created_at, payment_status, paid_amount)
        SELECT id, supplier_id, supplier_name, fabric_type, price_per_meter, quantity, unit, entry_date, created_at, payment_status, paid_amount
        FROM deduped WHERE id IS NOT NULL AND rn = 1;
        
    ELSIF NEW.key = 'inven_expense_records' THEN
        DELETE FROM public.inven_expense_records WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                (item->>'categoryId')::text as category_id,
                (item->>'categoryName')::text as category_name,
                (item->>'amount')::numeric as amount,
                public.safe_cast_to_date(item->>'date') as date,
                (item->>'paymentMode')::text as payment_mode,
                (item->>'notes')::text as notes,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_expense_records (id, category_id, category_name, amount, date, payment_mode, notes, created_at)
        SELECT id, category_id, category_name, amount, date, payment_mode, notes, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;
        
    ELSIF NEW.key = 'inven_income_records' THEN
        DELETE FROM public.inven_income_records WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                (item->>'categoryId')::text as category_id,
                (item->>'categoryName')::text as category_name,
                (item->>'amount')::numeric as amount,
                public.safe_cast_to_date(item->>'date') as date,
                (item->>'paymentMode')::text as payment_mode,
                (item->>'notes')::text as notes,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_income_records (id, category_id, category_name, amount, date, payment_mode, notes, created_at)
        SELECT id, category_id, category_name, amount, date, payment_mode, notes, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_production' THEN
        DELETE FROM public.inven_production WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                (item->>'inventoryItemId')::text as inventory_item_id,
                (item->>'fabricType')::text as fabric_type,
                (item->>'unit')::text as unit,
                (item->>'size')::text as size,
                (item->>'modelName')::text as model_name,
                (item->>'quantity')::numeric as quantity,
                (item->>'rate')::numeric as rate,
                (item->>'assignedAt')::timestamp with time zone as assigned_at,
                public.safe_cast_to_date(item->>'assignedDate') as assigned_date,
                public.safe_cast_to_date(item->>'expectedDate') as expected_date,
                (item->>'status')::text as status,
                (item->>'allPiecesDelivered')::boolean as all_pieces_delivered,
                (item->>'allMetersDelivered')::boolean as all_meters_delivered,
                (item->>'balancePieces')::numeric as balance_pieces,
                (item->>'balanceMeters')::numeric as balance_meters,
                (item->>'finishedPieces')::numeric as finished_pieces,
                (item->>'finishedMeters')::numeric as finished_meters,
                (item->>'customerId')::text as customer_id,
                (item->>'paidAmount')::numeric as paid_amount,
                (item->>'paymentStatus')::text as payment_status,
                public.safe_cast_to_date(item->>'paymentDate') as payment_date,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_production (id, inventory_item_id, fabric_type, unit, size, model_name, quantity, rate, assigned_at, assigned_date, expected_date, status, all_pieces_delivered, all_meters_delivered, balance_pieces, balance_meters, finished_pieces, finished_meters, customer_id, paid_amount, payment_status, payment_date)
        SELECT id, inventory_item_id, fabric_type, unit, size, model_name, quantity, rate, assigned_at, assigned_date, expected_date, status, all_pieces_delivered, all_meters_delivered, balance_pieces, balance_meters, finished_pieces, finished_meters, customer_id, paid_amount, payment_status, payment_date
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_generated_invoices' THEN
        DELETE FROM public.inven_generated_invoices WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                (item->>'invoiceNo')::text as invoice_no,
                public.safe_cast_to_date(item->>'date') as date,
                (item->>'term')::text as term,
                (item->'buyer'->>'name')::text as buyer_name,
                (item->'buyer'->>'address')::text as buyer_address,
                (item->'buyer'->>'phone')::text as buyer_phone,
                (item->'buyer'->>'gstin')::text as buyer_gstin,
                COALESCE((item->'items'), '[]'::jsonb) as items,
                (item->>'totalQty')::numeric as total_qty,
                (item->>'discount')::numeric as discount,
                (item->>'taxableAmount')::numeric as taxable_amount,
                (item->>'cgst')::numeric as cgst,
                (item->>'sgst')::numeric as sgst,
                (item->>'igst')::numeric as igst,
                (item->>'roundOff')::numeric as round_off,
                (item->>'totalAmount')::numeric as total_amount,
                (item->>'amountInWords')::text as amount_in_words,
                (item->>'transport')::text as transport,
                (item->>'shipToName')::text as ship_to_name,
                (item->>'shipToAddress')::text as ship_to_address,
                public.safe_cast_to_date(item->>'lrDate') as lr_date,
                (item->>'status')::text as status,
                (item->>'paidAmount')::numeric as paid_amount,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_generated_invoices (id, invoice_no, date, term, buyer_name, buyer_address, buyer_phone, buyer_gstin, items, total_qty, discount, taxable_amount, cgst, sgst, igst, round_off, total_amount, amount_in_words, transport, ship_to_name, ship_to_address, lr_date, status, paid_amount)
        SELECT id, invoice_no, date, term, buyer_name, buyer_address, buyer_phone, buyer_gstin, items, total_qty, discount, taxable_amount, cgst, sgst, igst, round_off, total_amount, amount_in_words, transport, ship_to_name, ship_to_address, lr_date, status, paid_amount
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_product_master' THEN
        DELETE FROM public.inven_product_master WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, 'Unnamed') as name,
                (item->>'basePrice')::numeric as base_price,
                (item->>'category')::text as category,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_product_master (id, name, base_price, category, created_at)
        SELECT id, name, base_price, category, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_unit_master' THEN
        DELETE FROM public.inven_unit_master WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, 'Unnamed') as name,
                (item->>'location')::text as location,
                (item->>'supervisor')::text as supervisor,
                (item->>'capacity')::text as capacity,
                COALESCE((item->'modelRates'), '[]'::jsonb) as model_rates,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_unit_master (id, name, location, supervisor, capacity, model_rates)
        SELECT id, name, location, supervisor, capacity, model_rates
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_expense_master' THEN
        DELETE FROM public.inven_expense_master WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, 'Unnamed') as name,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_expense_master (id, name, created_at)
        SELECT id, name, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_income_master' THEN
        DELETE FROM public.inven_income_master WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, 'Unnamed') as name,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_income_master (id, name, created_at)
        SELECT id, name, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_transports' THEN
        DELETE FROM public.inven_transports WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, 'Unnamed') as name,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_transports (id, name, created_at)
        SELECT id, name, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_unpack_inven_sync ON public.inven_sync;
CREATE TRIGGER trigger_unpack_inven_sync AFTER INSERT OR UPDATE ON public.inven_sync FOR EACH ROW EXECUTE FUNCTION public.unpack_inven_sync_payload();

-- Trigger unpacking for existing sync data immediately to populate relational tables
UPDATE public.inven_sync SET updated_at = NOW() WHERE key IN (
  'inven_suppliers', 
  'inven_customers', 
  'inven_inventory', 
  'inven_expense_records', 
  'inven_income_records', 
  'inven_production', 
  'inven_generated_invoices',
  'inven_product_master',
  'inven_unit_master',
  'inven_expense_master',
  'inven_income_master',
  'inven_transports'
);`;

  const upgradeSchema = `-- UPGRADE SCRIPT FOR EXISTING TABLES (COLUMN ALIGNMENT)
-- Run this script in your Supabase SQL Editor if you encounter errors like:
-- "column does not exist" or "relation does not exist".
-- This safely adds the newest attributes and creates master tables without destroying existing data.

-- Create master tables if missing
CREATE TABLE IF NOT EXISTS public.inven_product_master (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_price NUMERIC,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.inven_unit_master (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    supervisor TEXT,
    capacity TEXT,
    model_rates JSONB
);

CREATE TABLE IF NOT EXISTS public.inven_expense_master (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.inven_income_master (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.inven_transports (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.inven_product_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_unit_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_expense_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_income_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inven_transports ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies Setup
DROP POLICY IF EXISTS "Allow public select on product_master" ON public.inven_product_master;
DROP POLICY IF EXISTS "Allow public insert on product_master" ON public.inven_product_master;
DROP POLICY IF EXISTS "Allow public update on product_master" ON public.inven_product_master;
DROP POLICY IF EXISTS "Allow public delete on product_master" ON public.inven_product_master;
CREATE POLICY "Allow public select on product_master" ON public.inven_product_master FOR SELECT USING (true);
CREATE POLICY "Allow public insert on product_master" ON public.inven_product_master FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on product_master" ON public.inven_product_master FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on product_master" ON public.inven_product_master FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select on unit_master" ON public.inven_unit_master;
DROP POLICY IF EXISTS "Allow public insert on unit_master" ON public.inven_unit_master;
DROP POLICY IF EXISTS "Allow public update on unit_master" ON public.inven_unit_master;
DROP POLICY IF EXISTS "Allow public delete on unit_master" ON public.inven_unit_master;
CREATE POLICY "Allow public select on unit_master" ON public.inven_unit_master FOR SELECT USING (true);
CREATE POLICY "Allow public insert on unit_master" ON public.inven_unit_master FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on unit_master" ON public.inven_unit_master FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on unit_master" ON public.inven_unit_master FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select on expense_master" ON public.inven_expense_master;
DROP POLICY IF EXISTS "Allow public insert on expense_master" ON public.inven_expense_master;
DROP POLICY IF EXISTS "Allow public update on expense_master" ON public.inven_expense_master;
DROP POLICY IF EXISTS "Allow public delete on expense_master" ON public.inven_expense_master;
CREATE POLICY "Allow public select on expense_master" ON public.inven_expense_master FOR SELECT USING (true);
CREATE POLICY "Allow public insert on expense_master" ON public.inven_expense_master FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on expense_master" ON public.inven_expense_master FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on expense_master" ON public.inven_expense_master FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select on income_master" ON public.inven_income_master;
DROP POLICY IF EXISTS "Allow public insert on income_master" ON public.inven_income_master;
DROP POLICY IF EXISTS "Allow public update on income_master" ON public.inven_income_master;
DROP POLICY IF EXISTS "Allow public delete on income_master" ON public.inven_income_master;
CREATE POLICY "Allow public select on income_master" ON public.inven_income_master FOR SELECT USING (true);
CREATE POLICY "Allow public insert on income_master" ON public.inven_income_master FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on income_master" ON public.inven_income_master FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on income_master" ON public.inven_income_master FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select on transports" ON public.inven_transports;
DROP POLICY IF EXISTS "Allow public insert on transports" ON public.inven_transports;
DROP POLICY IF EXISTS "Allow public update on transports" ON public.inven_transports;
DROP POLICY IF EXISTS "Allow public delete on transports" ON public.inven_transports;
CREATE POLICY "Allow public select on transports" ON public.inven_transports FOR SELECT USING (true);
CREATE POLICY "Allow public insert on transports" ON public.inven_transports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on transports" ON public.inven_transports FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on transports" ON public.inven_transports FOR DELETE USING (true);

-- Align inven_inventory
ALTER TABLE public.inven_inventory ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE public.inven_inventory ADD COLUMN IF NOT EXISTS paid_amount NUMERIC;

-- Align inven_production
ALTER TABLE public.inven_production ADD COLUMN IF NOT EXISTS balance_pieces NUMERIC;
ALTER TABLE public.inven_production ADD COLUMN IF NOT EXISTS balance_meters NUMERIC;
ALTER TABLE public.inven_production ADD COLUMN IF NOT EXISTS finished_pieces NUMERIC;
ALTER TABLE public.inven_production ADD COLUMN IF NOT EXISTS finished_meters NUMERIC;
ALTER TABLE public.inven_production ADD COLUMN IF NOT EXISTS customer_id TEXT;
ALTER TABLE public.inven_production ADD COLUMN IF NOT EXISTS paid_amount NUMERIC;
ALTER TABLE public.inven_production ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE public.inven_production ADD COLUMN IF NOT EXISTS payment_date DATE;

-- Align inven_generated_invoices
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS discount NUMERIC;
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS taxable_amount NUMERIC;
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS cgst NUMERIC;
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS sgst NUMERIC;
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS igst NUMERIC;
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS round_off NUMERIC;
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS amount_in_words TEXT;
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS transport TEXT;
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS ship_to_name TEXT;
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS ship_to_address TEXT;
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS lr_date DATE;
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.inven_generated_invoices ADD COLUMN IF NOT EXISTS paid_amount NUMERIC;

-- Recreate trigger function with full column parsing
-- Create safe_cast_to_date helper if it wasn't present
CREATE OR REPLACE FUNCTION public.safe_cast_to_date(val TEXT)
RETURNS DATE AS $$
BEGIN
    IF val IS NULL OR val = '' THEN
        RETURN NULL;
    END IF;
    -- check if format is DD/MM/YYYY or similar
    IF val ~ '^\d{1,2}/\d{1,2}/\d{4}' THEN
        RETURN to_date(val, 'DD/MM/YYYY');
    ELSIF val ~ '^\d{4}-\d{1,2}-\d{1,2}' THEN
        RETURN val::date;
    ELSE
        -- Fallback, try automatic casting and return null if failure
        BEGIN
            RETURN val::date;
        EXCEPTION WHEN OTHERS THEN
            RETURN NULL;
        END;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.unpack_inven_sync_payload()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.key = 'inven_suppliers' THEN
        DELETE FROM public.inven_suppliers WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, (item->>'contactPerson')::text, 'Unnamed') as name,
                (item->>'companyName')::text as company_name,
                (item->>'contactPerson')::text as contact_person,
                (item->>'phone')::text as phone,
                (item->>'email')::text as email,
                (item->>'address')::text as address,
                (item->>'gstNumber')::text as gst_number,
                (item->>'paymentTerms')::text as payment_terms,
                (item->>'notes')::text as notes,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_suppliers (id, name, company_name, contact_person, phone, email, address, gst_number, payment_terms, notes, created_at)
        SELECT id, name, company_name, contact_person, phone, email, address, gst_number, payment_terms, notes, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;
        
    ELSIF NEW.key = 'inven_customers' THEN
        DELETE FROM public.inven_customers WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, 'Unnamed') as name,
                (item->>'phone')::text as phone,
                (item->>'email')::text as email,
                (item->>'address')::text as address,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_customers (id, name, phone, email, address, created_at)
        SELECT id, name, phone, email, address, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;
        
    ELSIF NEW.key = 'inven_inventory' THEN
        DELETE FROM public.inven_inventory WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                (item->>'supplierId')::text as supplier_id,
                (item->>'supplierName')::text as supplier_name,
                (item->>'fabricType')::text as fabric_type,
                (item->>'pricePerMeter')::numeric as price_per_meter,
                (item->>'quantity')::numeric as quantity,
                (item->>'unit')::text as unit,
                public.safe_cast_to_date(item->>'entryDate') as entry_date,
                (item->>'createdAt')::timestamp with time zone as created_at,
                (item->>'paymentStatus')::text as payment_status,
                (item->>'paidAmount')::numeric as paid_amount,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_inventory (id, supplier_id, supplier_name, fabric_type, price_per_meter, quantity, unit, entry_date, created_at, payment_status, paid_amount)
        SELECT id, supplier_id, supplier_name, fabric_type, price_per_meter, quantity, unit, entry_date, created_at, payment_status, paid_amount
        FROM deduped WHERE id IS NOT NULL AND rn = 1;
        
    ELSIF NEW.key = 'inven_expense_records' THEN
        DELETE FROM public.inven_expense_records WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                (item->>'categoryId')::text as category_id,
                (item->>'categoryName')::text as category_name,
                (item->>'amount')::numeric as amount,
                public.safe_cast_to_date(item->>'date') as date,
                (item->>'paymentMode')::text as payment_mode,
                (item->>'notes')::text as notes,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_expense_records (id, category_id, category_name, amount, date, payment_mode, notes, created_at)
        SELECT id, category_id, category_name, amount, date, payment_mode, notes, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;
        
    ELSIF NEW.key = 'inven_income_records' THEN
        DELETE FROM public.inven_income_records WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                (item->>'categoryId')::text as category_id,
                (item->>'categoryName')::text as category_name,
                (item->>'amount')::numeric as amount,
                public.safe_cast_to_date(item->>'date') as date,
                (item->>'paymentMode')::text as payment_mode,
                (item->>'notes')::text as notes,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_income_records (id, category_id, category_name, amount, date, payment_mode, notes, created_at)
        SELECT id, category_id, category_name, amount, date, payment_mode, notes, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_production' THEN
        DELETE FROM public.inven_production WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                (item->>'inventoryItemId')::text as inventory_item_id,
                (item->>'fabricType')::text as fabric_type,
                (item->>'unit')::text as unit,
                (item->>'size')::text as size,
                (item->>'modelName')::text as model_name,
                (item->>'quantity')::numeric as quantity,
                (item->>'rate')::numeric as rate,
                (item->>'assignedAt')::timestamp with time zone as assigned_at,
                public.safe_cast_to_date(item->>'assignedDate') as assigned_date,
                public.safe_cast_to_date(item->>'expectedDate') as expected_date,
                (item->>'status')::text as status,
                (item->>'allPiecesDelivered')::boolean as all_pieces_delivered,
                (item->>'allMetersDelivered')::boolean as all_meters_delivered,
                (item->>'balancePieces')::numeric as balance_pieces,
                (item->>'balanceMeters')::numeric as balance_meters,
                (item->>'finishedPieces')::numeric as finished_pieces,
                (item->>'finishedMeters')::numeric as finished_meters,
                (item->>'customerId')::text as customer_id,
                (item->>'paidAmount')::numeric as paid_amount,
                (item->>'paymentStatus')::text as payment_status,
                public.safe_cast_to_date(item->>'paymentDate') as payment_date,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_production (id, inventory_item_id, fabric_type, unit, size, model_name, quantity, rate, assigned_at, assigned_date, expected_date, status, all_pieces_delivered, all_meters_delivered, balance_pieces, balance_meters, finished_pieces, finished_meters, customer_id, paid_amount, payment_status, payment_date)
        SELECT id, inventory_item_id, fabric_type, unit, size, model_name, quantity, rate, assigned_at, assigned_date, expected_date, status, all_pieces_delivered, all_meters_delivered, balance_pieces, balance_meters, finished_pieces, finished_meters, customer_id, paid_amount, payment_status, payment_date
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_generated_invoices' THEN
        DELETE FROM public.inven_generated_invoices WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                (item->>'invoiceNo')::text as invoice_no,
                public.safe_cast_to_date(item->>'date') as date,
                (item->>'term')::text as term,
                (item->'buyer'->>'name')::text as buyer_name,
                (item->'buyer'->>'address')::text as buyer_address,
                (item->'buyer'->>'phone')::text as buyer_phone,
                (item->'buyer'->>'gstin')::text as buyer_gstin,
                COALESCE((item->'items'), '[]'::jsonb) as items,
                (item->>'totalQty')::numeric as total_qty,
                (item->>'discount')::numeric as discount,
                (item->>'taxableAmount')::numeric as taxable_amount,
                (item->>'cgst')::numeric as cgst,
                (item->>'sgst')::numeric as sgst,
                (item->>'igst')::numeric as igst,
                (item->>'roundOff')::numeric as round_off,
                (item->>'totalAmount')::numeric as total_amount,
                (item->>'amountInWords')::text as amount_in_words,
                (item->>'transport')::text as transport,
                (item->>'shipToName')::text as ship_to_name,
                (item->>'shipToAddress')::text as ship_to_address,
                public.safe_cast_to_date(item->>'lrDate') as lr_date,
                (item->>'status')::text as status,
                (item->>'paidAmount')::numeric as paid_amount,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_generated_invoices (id, invoice_no, date, term, buyer_name, buyer_address, buyer_phone, buyer_gstin, items, total_qty, discount, taxable_amount, cgst, sgst, igst, round_off, total_amount, amount_in_words, transport, ship_to_name, ship_to_address, lr_date, status, paid_amount)
        SELECT id, invoice_no, date, term, buyer_name, buyer_address, buyer_phone, buyer_gstin, items, total_qty, discount, taxable_amount, cgst, sgst, igst, round_off, total_amount, amount_in_words, transport, ship_to_name, ship_to_address, lr_date, status, paid_amount
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_product_master' THEN
        DELETE FROM public.inven_product_master WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, 'Unnamed') as name,
                (item->>'basePrice')::numeric as base_price,
                (item->>'category')::text as category,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_product_master (id, name, base_price, category, created_at)
        SELECT id, name, base_price, category, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_unit_master' THEN
        DELETE FROM public.inven_unit_master WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, 'Unnamed') as name,
                (item->>'location')::text as location,
                (item->>'supervisor')::text as supervisor,
                (item->>'capacity')::text as capacity,
                COALESCE((item->'modelRates'), '[]'::jsonb) as model_rates,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_unit_master (id, name, location, supervisor, capacity, model_rates)
        SELECT id, name, location, supervisor, capacity, model_rates
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_expense_master' THEN
        DELETE FROM public.inven_expense_master WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, 'Unnamed') as name,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_expense_master (id, name, created_at)
        SELECT id, name, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_income_master' THEN
        DELETE FROM public.inven_income_master WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, 'Unnamed') as name,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_income_master (id, name, created_at)
        SELECT id, name, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;

    ELSIF NEW.key = 'inven_transports' THEN
        DELETE FROM public.inven_transports WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                COALESCE((item->>'name')::text, 'Unnamed') as name,
                (item->>'createdAt')::timestamp with time zone as created_at,
                row_number() over (partition by item->>'id') as rn
            FROM jsonb_array_elements(NEW.value) AS item
        )
        INSERT INTO public.inven_transports (id, name, created_at)
        SELECT id, name, created_at
        FROM deduped WHERE id IS NOT NULL AND rn = 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_unpack_inven_sync ON public.inven_sync;
CREATE TRIGGER trigger_unpack_inven_sync AFTER INSERT OR UPDATE ON public.inven_sync FOR EACH ROW EXECUTE FUNCTION public.unpack_inven_sync_payload();

-- Trigger unpacking for existing sync data immediately to populate relational tables
UPDATE public.inven_sync SET updated_at = NOW() WHERE key IN (
  'inven_suppliers', 
  'inven_customers', 
  'inven_inventory', 
  'inven_expense_records', 
  'inven_income_records', 
  'inven_production', 
  'inven_generated_invoices',
  'inven_product_master',
  'inven_unit_master',
  'inven_expense_master',
  'inven_income_master',
  'inven_transports'
);`;

  const handleCopySql = () => {
    let textToCopy = syncSchema;
    if (activeSqlTab === 'full') {
      textToCopy = fullSchema;
    } else if (activeSqlTab === 'upgrade') {
      textToCopy = upgradeSchema;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500">Configure application preferences and ID patterns.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Company Section */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Company Profile</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Branding & Contact Info</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center group relative">
                  {companyLogo ? (
                    <>
                      <img src={companyLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label htmlFor="logo-upload" className="cursor-pointer text-white text-[10px] font-bold uppercase">Change</label>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">No Logo</p>
                    </div>
                  )}
                  <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</p>
                    <input 
                      type="text" 
                      value={companyName || ''}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    />
                  </div>
                  {!companyLogo && (
                    <label htmlFor="logo-upload" className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-100 transition-colors">
                      Upload Company Logo
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Address & Details</p>
                <textarea 
                  value={companyAddress || ''}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium resize-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inventory & Production IDs */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                <h3 className="font-bold text-slate-800">Production IDs</h3>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supplier ID Prefix</p>
                    <input 
                      type="text" 
                      value={supplierPrefix || ''}
                      onChange={(e) => setSupplierPrefix(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starting ID</p>
                    <input 
                      type="number" 
                      value={nextSupplierId || ''}
                      onChange={(e) => setNextSupplierId(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model ID Prefix</p>
                    <input 
                      type="text" 
                      value={modelPrefix || ''}
                      onChange={(e) => setModelPrefix(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starting ID</p>
                    <input 
                      type="number" 
                      value={nextModelId || ''}
                      onChange={(e) => setNextModelId(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Production Prefix</p>
                    <input 
                      type="text" 
                      value={prodPrefix || ''}
                      onChange={(e) => setProdPrefix(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starting ID</p>
                    <input 
                      type="number" 
                      value={nextProdId || ''}
                      onChange={(e) => setNextProdId(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial & Invoice Sections */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                <h3 className="font-bold text-slate-800">Invoicing IDs</h3>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice Prefix</p>
                    <input 
                      type="text" 
                      value={invoicePrefix || ''}
                      onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Year Part</p>
                    <input 
                      type="text" 
                      value={invoiceYear || ''}
                      onChange={(e) => setInvoiceYear(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Sequence Number</p>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={nextInvoiceId || ''}
                      onChange={(e) => setNextInvoiceId(parseInt(e.target.value) || 1)}
                      className="flex-1 bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                    <button onClick={() => setNextInvoiceId(1)} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Warning Threshold</p>
                    <input 
                      type="number" 
                      value={lowStockThreshold || ''}
                      onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supabase Integration Card */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-50 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Supabase Database</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time Cloud Sync & Backups</p>
                </div>
              </div>
              
              {/* Dynamic status pill */}
              <div className="flex items-center shrink-0">
                {syncStatus === 'synced' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full select-none">
                    <Check className="w-3 h-3" />
                    Connected
                  </span>
                )}
                {syncStatus === 'syncing' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-widest rounded-full select-none font-sans">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Syncing
                  </span>
                )}
                {syncStatus === 'error' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-widest rounded-full select-none">
                    <AlertCircle className="w-3 h-3" />
                    Error
                  </span>
                )}
                {syncStatus === 'not-configured' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full select-none">
                    Disabled
                  </span>
                )}
                {syncStatus === 'idle' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-150 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-full select-none">
                    Active
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              Keep all your inventories, supplier registries, custom invoices, production tasks, and financial records securely synchronized across browsers in real-time.
            </p>

            {/* Input credentials */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supabase URL</p>
                  <span className="text-[8px] text-slate-300 font-bold select-none font-mono">https://*.supabase.co</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium font-mono placeholder:font-sans placeholder:text-slate-400 text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supabase Anonymous API Key</p>
                  <span className="text-[8px] text-slate-300 font-bold select-none font-mono">public key</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium font-mono placeholder:font-sans placeholder:text-slate-400 text-slate-700"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveSupabase}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all font-bold cursor-pointer text-center"
              >
                Apply Supabase Credentials
              </button>
            </div>

            {/* Error message logs if appropriate */}
            {syncStatus === 'error' && syncError && (
              <div className="bg-rose-50 text-rose-600 border border-rose-100 p-4 rounded-2xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="text-[10px] leading-normal">
                  <p className="font-extrabold mb-1">Database Update Fault</p>
                  <p className="font-semibold text-rose-500">{syncError}</p>
                  <p className="mt-2 font-medium text-slate-500">Please make sure the SQL schemas are correctly instantiated in your Supabase Console below.</p>
                </div>
              </div>
            )}

            {/* Actions Toast Indicator */}
            {actionFeedback && (
              <div className={`p-4 rounded-2xl border flex items-center gap-2.5 text-[10px] font-bold ${
                actionFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
              }`}>
                {actionFeedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{actionFeedback.message}</span>
              </div>
            )}

            {/* Action controls */}
            {syncStatus !== 'not-configured' && (
              <div className="pt-4 border-t border-slate-50 space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Manual Collections Maintenance</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleManualPush}
                    disabled={syncStatus === 'syncing'}
                    className="flex items-center justify-center gap-1.5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Push Storage
                  </button>

                  <button
                    onClick={handleManualPull}
                    disabled={syncStatus === 'syncing'}
                    className="flex items-center justify-center gap-1.5 py-3 bg-amber-50 hover:bg-amber-100 text-amber-750 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    Pull Storage
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleForceUnpack}
                  disabled={syncStatus === 'syncing'}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                  title="Force relational triggers in Supabase to process current data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  ⚡ Repopulate Relational Tables (Run Triggers)
                </button>
                
                <p className="text-[10px] text-slate-400 font-semibold text-center mt-2">
                  Last connected sync: <span className="font-mono font-bold text-slate-600">{lastSync || 'Never'}</span>
                </p>
              </div>
            )}

            {/* SQL provision details */}
            <div className="pt-4 border-t border-slate-50 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveSqlTab('sync')}
                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      activeSqlTab === 'sync'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Core Sync Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSqlTab('full')}
                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      activeSqlTab === 'full'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Normalized Tables & Triggers
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSqlTab('upgrade')}
                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      activeSqlTab === 'upgrade'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                    }`}
                  >
                    ⚡ Fix Missing Columns
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-800 transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Script
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-slate-900 rounded-2xl p-4 relative font-mono text-[9px] text-slate-300 overflow-x-auto max-h-48">
                <pre className="whitespace-pre">
                  {activeSqlTab === 'sync' ? syncSchema : activeSqlTab === 'full' ? fullSchema : upgradeSchema}
                </pre>
              </div>
              <p className="text-[9.5px] text-slate-400 leading-normal font-semibold">
                {activeSqlTab === 'sync' 
                  ? "Instantiates the lightweight, robust 'inven_sync' key-value engine required for real-time cloud storage sync."
                  : activeSqlTab === 'full'
                  ? "Sets up the individual tables (suppliers, customers, inventory, expenses, etc.) with automated triggers to unpack JSON sync payloads."
                  : "Safely appends missing columns (e.g. balance_pieces, paid_amount) to existing tables & refreshes relational triggers without destroying stored entries."
                }
              </p>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            <Save className="w-5 h-5" />
            {isSaved ? 'Preferences Saved Successfully' : 'Apply Settings & Update Formats'}
          </button>
        </div>

        <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Format Preview</h3>
              <p className="text-xs text-slate-400 font-bold">Live preview of generated IDs</p>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Supplier ID', val: `${supplierPrefix}-${nextSupplierId.toString().padStart(4, '0')}` },
                { label: 'Model ID', val: `${modelPrefix}-${nextModelId.toString().padStart(3, '0')}` },
                { label: 'Production ID', val: `${prodPrefix}-${nextProdId.toString().padStart(4, '0')}` },
                { label: 'Invoice No', val: `${invoicePrefix}/${invoiceYear}/${nextInvoiceId.toString().padStart(2, '0')}` }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-sm">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-xl font-mono font-black tracking-tighter">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-indigo-600/20 rounded-[24px] border border-indigo-500/30 relative z-10">
            <p className="text-xs font-bold leading-relaxed text-indigo-200">
              Patterns update as you type. These formats will be applied to all new records created across the system.
            </p>
          </div>

          {/* Abstract blobs */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute -left-20 top-40 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
