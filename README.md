# CRM-IT

Sistema interno para IT Integral Solution orientado a la gestión comercial y operativa de sus productos de software.

## Stack

- Next.js 16 + React 19 + TypeScript
- SQLite local con `better-sqlite3`
- Capa de datos desacoplada para migrar luego a PostgreSQL u otro motor

## Alcance inicial

- Alta de clientes por rubro y producto
- Registro del producto y plan contratado
- Control del pago inicial 50% y pago final 50%
- Seguimiento del soporte mensual y sus vencimientos
- Estadísticas comerciales por producto y paquete

## Desarrollo local

```bash
npm install
npm run db:seed
npm run dev
```

## Notas

- La identidad visual toma como base el branding de IT Integral Solution.
- TASS quedó modelado como un producto dentro del portfolio general.
- El archivo `project-log.txt` se usa para continuidad entre sesiones.
