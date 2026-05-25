-- SUPABASE DATABASE SCHEMA SETUP FOR GAYATHRI TEXTILES
-- Description: Run this SQL script in your Supabase SQL Editor (console.supabase.com)
--             to create the database tables, set up row-level security (RLS), 
--             and create automatic triggers that unpack your app's localStorage 
--             collections into queryable normalized SQL tables in real-time.

-- PART 1: CORE REAL-TIME SYNCHRONIZATION ENGINE TABLE

CREATE TABLE IF NOT EXISTS public.inven_sync (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for our core engine
ALTER TABLE public.inven_sync ENABLE ROW LEVEL SECURITY;

-- Set up open RLS policies (adjust to dynamic auth roles if managing security credentials)
DROP POLICY IF EXISTS "Allow public select" ON public.inven_sync;
DROP POLICY IF EXISTS "Allow public insert" ON public.inven_sync;
DROP POLICY IF EXISTS "Allow public update" ON public.inven_sync;
DROP POLICY IF EXISTS "Allow public delete" ON public.inven_sync;

CREATE POLICY "Allow public select" ON public.inven_sync FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.inven_sync FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.inven_sync FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.inven_sync FOR DELETE USING (true);


-- PART 2: STRUCTURAL ANALYTICAL BUSINESS TABLES

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


-- PART 3: ROW LEVEL SECURITY FOR RELATION TABLES

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


-- PART 4: AUTOMATED UNPACKING FUNCTION & TRIGGERS

CREATE OR REPLACE FUNCTION public.unpack_inven_sync_payload()
RETURNS TRIGGER AS $$
BEGIN
    -- Unpack suppliers registry
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
        
    -- Unpack customers registry
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
        
    -- Unpack fabrics and inventory items
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

    -- Unpack recorded expenses
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

    -- Unpack recorded incomes
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

    -- Unpack production task entries
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

    -- Unpack invoices
    ELSIF NEW.key = 'inven_generated_invoices' THEN
        DELETE FROM public.inven_generated_invoices WHERE true;
        WITH deduped AS (
            SELECT 
                (item->>'id')::text as id,
                (item->>'invoiceNo')::text as invoice_no,
                public.safe_cast_to_date(item->>'date') as date,
                (item->>'term')::text as term,
                (item-> 'buyer'->>'name')::text as buyer_name,
                (item-> 'buyer'->>'address')::text as buyer_address,
                (item-> 'buyer'->>'phone')::text as buyer_phone,
                (item-> 'buyer'->>'gstin')::text as buyer_gstin,
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

    -- Unpack product models
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

    -- Unpack production units
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

    -- Unpack expense category masters
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

    -- Unpack income category masters
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

    -- Unpack transports registry
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

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_unpack_inven_sync ON public.inven_sync;
CREATE TRIGGER trigger_unpack_inven_sync
AFTER INSERT OR UPDATE ON public.inven_sync
FOR EACH ROW
EXECUTE FUNCTION public.unpack_inven_sync_payload();

-- TRIGGER UNPACKING FOR ANY EXISTING DATA IN INVEN_SYNC IMMEDIATELY
-- This ensures that if you already pushed data from the app but then created/re-created these tables or triggers,
-- all your historical data is unpacked into the sub-tables instantly!
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
);
