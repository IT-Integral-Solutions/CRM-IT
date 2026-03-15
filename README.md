# CRM-IT

CRM interno para IT-Integral Solutions orientado a la gestión comercial y operativa de TASS.

## Stack

- Next.js 16 + React 19 + TypeScript
- SQLite local con `better-sqlite3`
- Capa de datos desacoplada para migrar luego a PostgreSQL u otro motor

## Alcance inicial

- Alta de agencias/clientes de TASS
- Registro del plan contratado: Starter, Pro o Elite
- Control del pago inicial 50% y pago final 50%
- Seguimiento del soporte mensual y sus vencimientos
- Estadísticas comerciales por producto

## Desarrollo local

```bash
npm install
npm run db:seed
npm run dev
```

## Notas

- La identidad visual toma como base el branding de IT-Integral Solutions.
- Los precios iniciales y costos de soporte mensual quedaron cargados según el material entregado.
- El archivo `project-log.txt` se usa para continuidad entre sesiones.
