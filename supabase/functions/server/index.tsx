import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-c032a97c/health", (c) => {
  return c.json({ status: "ok" });
});

// GET all pedidos
app.get("/make-server-c032a97c/pedidos", async (c) => {
  try {
    const pedidos = await kv.getByPrefix('pedido:');
    
    // Sort by id desc (PV-2042 vs PV-2041)
    pedidos.sort((a, b) => b.id.localeCompare(a.id));
    return c.json({ pedidos });
  } catch (error) {
    console.error('Error fetching pedidos:', error);
    return c.json({ error: 'Failed to fetch pedidos' }, 500);
  }
});

// GET single pedido
app.get("/make-server-c032a97c/pedidos/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const pedido = await kv.get(`pedido:${id}`);
    
    if (!pedido) {
      return c.json({ error: 'Pedido not found' }, 404);
    }
    
    return c.json({ pedido });
  } catch (error) {
    console.error('Error fetching pedido:', error);
    return c.json({ error: 'Failed to fetch pedido' }, 500);
  }
});

// POST bulk init (used just to seed if needed)
app.post("/make-server-c032a97c/pedidos/seed", async (c) => {
  try {
    const body = await c.req.json();
    const { pedidos } = body;
    
    if (pedidos && Array.isArray(pedidos)) {
      for (const p of pedidos) {
        await kv.set(`pedido:${p.id}`, p);
      }
      return c.json({ success: true, count: pedidos.length });
    }
    return c.json({ error: 'Invalid seed format' }, 400);
  } catch (error) {
    return c.json({ error: 'Failed to seed pedidos' }, 500);
  }
});

// POST new pedido
app.post("/make-server-c032a97c/pedidos", async (c) => {
  try {
    const pedido = await c.req.json();
    if (!pedido || !pedido.id) {
      return c.json({ error: 'Invalid pedido data' }, 400);
    }
    
    await kv.set(`pedido:${pedido.id}`, pedido);
    return c.json({ pedido }, 201);
  } catch (error) {
    console.error('Error creating pedido:', error);
    return c.json({ error: 'Failed to create pedido' }, 500);
  }
});

// PUT update pedido
app.put("/make-server-c032a97c/pedidos/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`pedido:${id}`);
    if (!existing) {
      return c.json({ error: 'Pedido not found' }, 404);
    }
    
    const updated = { ...existing, ...updates, data_atualizacao: new Date().toISOString() };
    await kv.set(`pedido:${id}`, updated);
    
    return c.json({ pedido: updated });
  } catch (error) {
    console.error('Error updating pedido:', error);
    return c.json({ error: 'Failed to update pedido' }, 500);
  }
});

Deno.serve(app.fetch);