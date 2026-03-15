import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { addDays, addMonths, startOfDay, subDays } from "date-fns";

type PlanRow = {
  id: string;
  name: string;
  slug: string;
  product_name: string;
  product_slug: string;
  customer_type: string;
  description: string;
  license_price_cents: number;
  support_price_cents: number;
  display_order: number;
};

type ClientRow = {
  id: string;
  business_name: string;
  primary_contact: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  plan_id: string;
  go_live_date: string | null;
  setup_amount_cents: number;
  setup_paid_at: string | null;
  delivery_amount_cents: number;
  delivery_paid_at: string | null;
  support_next_due_at: string | null;
  created_at: string;
  updated_at: string;
};

type InvoiceRow = {
  id: string;
  client_id: string;
  amount_cents: number;
  due_at: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

const storageDir = path.join(process.cwd(), "storage");
const databasePath = path.join(storageDir, "crm-it.sqlite");

mkdirSync(storageDir, { recursive: true });

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");

function timestamp(date = new Date()) {
  return date.toISOString();
}

function toDate(value: string | null) {
  return value ? new Date(value) : null;
}

function hasColumn(tableName: string, columnName: string) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
    name: string;
  }>;

  return columns.some((column) => column.name === columnName);
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      product_name TEXT NOT NULL DEFAULT 'TASS',
      product_slug TEXT NOT NULL DEFAULT 'tass',
      customer_type TEXT NOT NULL DEFAULT 'travel_agency',
      description TEXT NOT NULL,
      license_price_cents INTEGER NOT NULL,
      support_price_cents INTEGER NOT NULL,
      display_order INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      business_name TEXT NOT NULL,
      primary_contact TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      city TEXT,
      country TEXT,
      notes TEXT,
      plan_id TEXT NOT NULL,
      go_live_date TEXT,
      setup_amount_cents INTEGER NOT NULL,
      setup_paid_at TEXT,
      delivery_amount_cents INTEGER NOT NULL,
      delivery_paid_at TEXT,
      support_next_due_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(plan_id) REFERENCES product_plans(id)
    );

    CREATE TABLE IF NOT EXISTS support_invoices (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      due_at TEXT NOT NULL,
      paid_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(client_id) REFERENCES clients(id)
    );

    CREATE INDEX IF NOT EXISTS idx_support_invoices_client_due
      ON support_invoices (client_id, due_at);
  `);

  if (!hasColumn("product_plans", "product_name")) {
    db.exec("ALTER TABLE product_plans ADD COLUMN product_name TEXT NOT NULL DEFAULT 'TASS';");
  }

  if (!hasColumn("product_plans", "product_slug")) {
    db.exec("ALTER TABLE product_plans ADD COLUMN product_slug TEXT NOT NULL DEFAULT 'tass';");
  }

  if (!hasColumn("product_plans", "customer_type")) {
    db.exec(
      "ALTER TABLE product_plans ADD COLUMN customer_type TEXT NOT NULL DEFAULT 'travel_agency';",
    );
  }
}

function seedDatabase() {
  const now = new Date();

  const planSeeds = [
    {
      name: "Starter",
      slug: "starter",
      product_name: "TASS",
      product_slug: "tass",
      customer_type: "travel_agency",
      description: "Captura de leads, cotización automática e itinerarios base.",
      license_price_cents: 18000,
      support_price_cents: 2000,
      display_order: 1,
    },
    {
      name: "Pro",
      slug: "pro",
      product_name: "TASS",
      product_slug: "tass",
      customer_type: "travel_agency",
      description: "Incluye historial de clientes, seguimiento de pagos y dashboard comercial.",
      license_price_cents: 30000,
      support_price_cents: 3500,
      display_order: 2,
    },
    {
      name: "Elite",
      slug: "elite",
      product_name: "TASS",
      product_slug: "tass",
      customer_type: "travel_agency",
      description: "Implementación personalizada, add-ons y soporte prioritario.",
      license_price_cents: 85000,
      support_price_cents: 7500,
      display_order: 3,
    },
    {
      name: "Resto a medida",
      slug: "restaurant-custom",
      product_name: "Software para Restaurantes",
      product_slug: "restaurant-suite",
      customer_type: "restaurant",
      description: "Implementación personalizada para operación gastronómica. Precio a definir.",
      license_price_cents: 0,
      support_price_cents: 0,
      display_order: 4,
    },
    {
      name: "Corporativo a medida",
      slug: "business-custom",
      product_name: "Software Corporativo",
      product_slug: "business-suite",
      customer_type: "company",
      description: "Solución a medida para otros rubros y puntos de dolor específicos.",
      license_price_cents: 0,
      support_price_cents: 0,
      display_order: 5,
    },
  ].map((plan) => ({
    ...plan,
    created_at: timestamp(now),
    updated_at: timestamp(now),
  }));

  for (const plan of planSeeds) {
    const existingPlan = db
      .prepare("SELECT id FROM product_plans WHERE slug = ?")
      .get(plan.slug) as { id: string } | undefined;

    if (existingPlan) {
      db.prepare(`
        UPDATE product_plans
        SET
          name = ?,
          product_name = ?,
          product_slug = ?,
          customer_type = ?,
          description = ?,
          license_price_cents = ?,
          support_price_cents = ?,
          display_order = ?,
          updated_at = ?
        WHERE slug = ?
      `).run(
        plan.name,
        plan.product_name,
        plan.product_slug,
        plan.customer_type,
        plan.description,
        plan.license_price_cents,
        plan.support_price_cents,
        plan.display_order,
        timestamp(now),
        plan.slug,
      );
    } else {
      db.prepare(`
        INSERT INTO product_plans (
          id, name, slug, product_name, product_slug, customer_type, description,
          license_price_cents, support_price_cents, display_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        plan.name,
        plan.slug,
        plan.product_name,
        plan.product_slug,
        plan.customer_type,
        plan.description,
        plan.license_price_cents,
        plan.support_price_cents,
        plan.display_order,
        plan.created_at,
        plan.updated_at,
      );
    }
  }

  db.exec(`
    UPDATE product_plans SET product_name = 'TASS', product_slug = 'tass', customer_type = 'travel_agency'
    WHERE slug IN ('starter', 'pro', 'elite');
  `);

  const existingClientCount =
    (db.prepare("SELECT COUNT(*) as count FROM clients").get() as { count: number }).count ?? 0;

  if (existingClientCount > 0) {
    return;
  }

  const starter = db.prepare("SELECT * FROM product_plans WHERE slug = 'starter'").get() as PlanRow;
  const pro = db.prepare("SELECT * FROM product_plans WHERE slug = 'pro'").get() as PlanRow;
  const elite = db.prepare("SELECT * FROM product_plans WHERE slug = 'elite'").get() as PlanRow;

  const insertClient = db.prepare(`
    INSERT INTO clients (
      id, business_name, primary_contact, email, phone, city, country, notes, plan_id, go_live_date,
      setup_amount_cents, setup_paid_at, delivery_amount_cents, delivery_paid_at, support_next_due_at, created_at, updated_at
    ) VALUES (
      @id, @business_name, @primary_contact, @email, @phone, @city, @country, @notes, @plan_id, @go_live_date,
      @setup_amount_cents, @setup_paid_at, @delivery_amount_cents, @delivery_paid_at, @support_next_due_at, @created_at, @updated_at
    )
  `);

  const insertInvoice = db.prepare(`
    INSERT INTO support_invoices (
      id, client_id, amount_cents, due_at, paid_at, created_at, updated_at
    ) VALUES (
      @id, @client_id, @amount_cents, @due_at, @paid_at, @created_at, @updated_at
    )
  `);

  const seedClients = [
    {
      id: randomUUID(),
      business_name: "Andes Explorer",
      primary_contact: "Marina Quiroga",
      email: "marina@andesexplorer.travel",
      phone: "+54 9 261 555 0101",
      city: "Mendoza",
      country: "Argentina",
      notes: "Solicitar módulo de itinerarios con branding propio en la entrega final.",
      plan_id: starter.id,
      go_live_date: timestamp(addDays(now, 12)),
      setup_amount_cents: 9000,
      setup_paid_at: timestamp(subDays(now, 9)),
      delivery_amount_cents: 9000,
      delivery_paid_at: null,
      support_next_due_at: timestamp(addMonths(now, 1)),
      created_at: timestamp(now),
      updated_at: timestamp(now),
      invoice_amount_cents: starter.support_price_cents,
      invoice_due_at: timestamp(addMonths(now, 1)),
    },
    {
      id: randomUUID(),
      business_name: "Patagonia Dreams",
      primary_contact: "Luciano Vera",
      email: "operaciones@patagoniadreams.com",
      phone: "+54 9 299 555 0187",
      city: "Neuquén",
      country: "Argentina",
      notes: "Pidió capacitación extendida para el equipo de ventas.",
      plan_id: pro.id,
      go_live_date: timestamp(addDays(now, 4)),
      setup_amount_cents: 15000,
      setup_paid_at: timestamp(subDays(now, 15)),
      delivery_amount_cents: 15000,
      delivery_paid_at: timestamp(subDays(now, 1)),
      support_next_due_at: timestamp(addDays(now, 3)),
      created_at: timestamp(now),
      updated_at: timestamp(now),
      invoice_amount_cents: pro.support_price_cents,
      invoice_due_at: timestamp(addDays(now, 3)),
    },
    {
      id: randomUUID(),
      business_name: "Orbital Travel Network",
      primary_contact: "Carla Benitez",
      email: "direccion@orbitaltravel.net",
      phone: "+54 9 11 5550 4477",
      city: "Buenos Aires",
      country: "Argentina",
      notes: "Elite con futuras integraciones web y email marketing.",
      plan_id: elite.id,
      go_live_date: timestamp(subDays(now, 20)),
      setup_amount_cents: 42500,
      setup_paid_at: timestamp(subDays(now, 48)),
      delivery_amount_cents: 42500,
      delivery_paid_at: timestamp(subDays(now, 18)),
      support_next_due_at: timestamp(subDays(now, 2)),
      created_at: timestamp(now),
      updated_at: timestamp(now),
      invoice_amount_cents: elite.support_price_cents,
      invoice_due_at: timestamp(subDays(now, 2)),
    },
  ];

  for (const client of seedClients) {
    insertClient.run(client);
    insertInvoice.run({
      id: randomUUID(),
      client_id: client.id,
      amount_cents: client.invoice_amount_cents,
      due_at: client.invoice_due_at,
      paid_at: null,
      created_at: timestamp(now),
      updated_at: timestamp(now),
    });
  }
}

export function setupDatabase() {
  initializeDatabase();
  seedDatabase();
}

setupDatabase();

function mapPlan(row: PlanRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    productName: row.product_name,
    productSlug: row.product_slug,
    customerType: row.customer_type,
    description: row.description,
    licensePriceCents: row.license_price_cents,
    supportPriceCents: row.support_price_cents,
    displayOrder: row.display_order,
  };
}

function mapInvoice(row: InvoiceRow) {
  return {
    id: row.id,
    clientId: row.client_id,
    amountCents: row.amount_cents,
    dueAt: new Date(row.due_at),
    paidAt: toDate(row.paid_at),
  };
}

function mapClient(
  row: ClientRow,
  plansById: Map<string, ReturnType<typeof mapPlan>>,
  supportInvoices: ReturnType<typeof mapInvoice>[],
) {
  return {
    id: row.id,
    businessName: row.business_name,
    primaryContact: row.primary_contact,
    email: row.email,
    phone: row.phone,
    city: row.city,
    country: row.country,
    notes: row.notes,
    planId: row.plan_id,
    plan: plansById.get(row.plan_id)!,
    goLiveDate: toDate(row.go_live_date),
    setupAmountCents: row.setup_amount_cents,
    setupPaidAt: toDate(row.setup_paid_at),
    deliveryAmountCents: row.delivery_amount_cents,
    deliveryPaidAt: toDate(row.delivery_paid_at),
    supportNextDueAt: toDate(row.support_next_due_at),
    supportInvoices,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function getPlans() {
  const rows = db
    .prepare("SELECT * FROM product_plans ORDER BY display_order ASC")
    .all() as PlanRow[];

  return rows.map(mapPlan);
}

export function getClients() {
  const plans = getPlans();
  const plansById = new Map(plans.map((plan) => [plan.id, plan]));
  const clientRows = db
    .prepare("SELECT * FROM clients ORDER BY created_at DESC")
    .all() as ClientRow[];
  const invoiceRows = db
    .prepare("SELECT * FROM support_invoices WHERE paid_at IS NULL ORDER BY due_at ASC")
    .all() as InvoiceRow[];

  const invoicesByClient = new Map<string, ReturnType<typeof mapInvoice>[]>();

  for (const invoice of invoiceRows) {
    const mappedInvoice = mapInvoice(invoice);
    const current = invoicesByClient.get(invoice.client_id) ?? [];
    current.push(mappedInvoice);
    invoicesByClient.set(invoice.client_id, current);
  }

  return clientRows.map((row) =>
    mapClient(row, plansById, invoicesByClient.get(row.id)?.slice(0, 1) ?? []),
  );
}

export function getOpenSupportInvoices(limit = 8) {
  const rows = db
    .prepare(
      `
      SELECT
        i.id,
        i.client_id,
        i.amount_cents,
        i.due_at,
        i.paid_at,
        i.created_at as invoice_created_at,
        i.updated_at as invoice_updated_at,
        c.business_name,
        c.primary_contact,
        c.email,
        c.phone,
        c.city,
        c.country,
        c.notes,
        c.plan_id,
        c.go_live_date,
        c.setup_amount_cents,
        c.setup_paid_at,
        c.delivery_amount_cents,
        c.delivery_paid_at,
        c.support_next_due_at,
        c.created_at,
        c.updated_at,
        p.name AS plan_name,
        p.slug AS plan_slug,
        p.description AS plan_description,
        p.license_price_cents,
        p.support_price_cents,
        p.display_order
      FROM support_invoices i
      JOIN clients c ON c.id = i.client_id
      JOIN product_plans p ON p.id = c.plan_id
      WHERE i.paid_at IS NULL
      ORDER BY i.due_at ASC
      LIMIT ?
      `,
    )
    .all(limit) as Array<
    {
      id: string;
      client_id: string;
      amount_cents: number;
      due_at: string;
      paid_at: string | null;
      business_name: string;
      primary_contact: string;
      email: string;
      phone: string | null;
      city: string | null;
      country: string | null;
      notes: string | null;
      plan_id: string;
      go_live_date: string | null;
      setup_amount_cents: number;
      setup_paid_at: string | null;
      delivery_amount_cents: number;
      delivery_paid_at: string | null;
      support_next_due_at: string | null;
      created_at: string;
      updated_at: string;
      plan_name: string;
      plan_slug: string;
      plan_description: string;
      license_price_cents: number;
      support_price_cents: number;
      display_order: number;
    }
  >;

  return rows.map((row) => ({
    id: row.id,
    clientId: row.client_id,
    amountCents: row.amount_cents,
    dueAt: new Date(row.due_at),
    paidAt: toDate(row.paid_at),
    client: {
      id: row.client_id,
      businessName: row.business_name,
      primaryContact: row.primary_contact,
      email: row.email,
      phone: row.phone,
      city: row.city,
      country: row.country,
      notes: row.notes,
      planId: row.plan_id,
      plan: {
        id: row.plan_id,
        name: row.plan_name,
        slug: row.plan_slug,
        description: row.plan_description,
        licensePriceCents: row.license_price_cents,
        supportPriceCents: row.support_price_cents,
        displayOrder: row.display_order,
      },
      goLiveDate: toDate(row.go_live_date),
      setupAmountCents: row.setup_amount_cents,
      setupPaidAt: toDate(row.setup_paid_at),
      deliveryAmountCents: row.delivery_amount_cents,
      deliveryPaidAt: toDate(row.delivery_paid_at),
      supportNextDueAt: toDate(row.support_next_due_at),
      supportInvoices: [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    },
  }));
}

export function createClient(input: {
  planId: string;
  businessName: string;
  primaryContact: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
  goLiveDate?: Date | null;
  setupPaid: boolean;
  deliveryPaid: boolean;
}) {
  const plan = db
    .prepare("SELECT * FROM product_plans WHERE id = ?")
    .get(input.planId) as PlanRow | undefined;

  if (!plan) {
    throw new Error("El plan seleccionado no existe.");
  }

  const now = new Date();
  const setupAmountCents = Math.round(plan.license_price_cents / 2);
  const deliveryAmountCents = plan.license_price_cents - setupAmountCents;
  const firstSupportDueAt = startOfDay(addMonths(input.goLiveDate ?? now, 1));
  const clientId = randomUUID();

  db.prepare(`
    INSERT INTO clients (
      id, business_name, primary_contact, email, phone, city, country, notes, plan_id, go_live_date,
      setup_amount_cents, setup_paid_at, delivery_amount_cents, delivery_paid_at, support_next_due_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    clientId,
    input.businessName,
    input.primaryContact,
    input.email,
    input.phone ?? null,
    input.city ?? null,
    input.country ?? null,
    input.notes ?? null,
    input.planId,
    input.goLiveDate ? timestamp(input.goLiveDate) : null,
    setupAmountCents,
    input.setupPaid ? timestamp(now) : null,
    deliveryAmountCents,
    input.deliveryPaid ? timestamp(now) : null,
    timestamp(firstSupportDueAt),
    timestamp(now),
    timestamp(now),
  );

  db.prepare(`
    INSERT INTO support_invoices (
      id, client_id, amount_cents, due_at, paid_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    clientId,
    plan.support_price_cents,
    timestamp(firstSupportDueAt),
    null,
    timestamp(now),
    timestamp(now),
  );
}

export function markClientInstallmentPaid(clientId: string, installment: "setup" | "delivery") {
  const client = db
    .prepare("SELECT id, setup_paid_at, delivery_paid_at FROM clients WHERE id = ?")
    .get(clientId) as
    | {
        id: string;
        setup_paid_at: string | null;
        delivery_paid_at: string | null;
      }
    | undefined;

  if (!client) {
    throw new Error("El cliente no existe.");
  }

  const column = installment === "setup" ? "setup_paid_at" : "delivery_paid_at";
  const currentValue = installment === "setup" ? client.setup_paid_at : client.delivery_paid_at;

  if (currentValue) {
    return;
  }

  const now = timestamp(new Date());
  db.prepare(`UPDATE clients SET ${column} = ?, updated_at = ? WHERE id = ?`).run(
    now,
    now,
    clientId,
  );
}

export function markSupportInvoicePaid(invoiceId: string) {
  const invoice = db
    .prepare(
      `
      SELECT i.*, p.support_price_cents
      FROM support_invoices i
      JOIN clients c ON c.id = i.client_id
      JOIN product_plans p ON p.id = c.plan_id
      WHERE i.id = ?
      `,
    )
    .get(invoiceId) as (InvoiceRow & { support_price_cents: number }) | undefined;

  if (!invoice) {
    throw new Error("La factura no existe.");
  }

  const now = new Date();
  const nextDueAt = startOfDay(addMonths(new Date(invoice.due_at), 1));

  const transaction = db.transaction(() => {
    db.prepare(
      "UPDATE support_invoices SET paid_at = ?, updated_at = ? WHERE id = ?",
    ).run(timestamp(now), timestamp(now), invoiceId);

    db.prepare(`
      INSERT INTO support_invoices (
        id, client_id, amount_cents, due_at, paid_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      invoice.client_id,
      invoice.support_price_cents,
      timestamp(nextDueAt),
      null,
      timestamp(now),
      timestamp(now),
    );

    db.prepare(
      "UPDATE clients SET support_next_due_at = ?, updated_at = ? WHERE id = ?",
    ).run(timestamp(nextDueAt), timestamp(now), invoice.client_id);
  });

  transaction();
}
