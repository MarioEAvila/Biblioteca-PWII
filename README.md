# Biblioteca "Alfonso Reyes" - PWII

Aplicacion web para administrar una biblioteca: catalogo de libros, usuarios, prestamos, listas de espera, multas, autorizacion de solicitudes y reportes.

## Integrantes

- Ana Cecilia Lopez Villagran
- Mario Enrique Avila Ortiz
- Rene Samuel Martinez Torres
- Karol Joanna Carreno Paez

## Stack

- **Back End:** Node.js + Express 5 + MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Validacion:** Zod
- **Front End:** HTML + CSS + Bootstrap + JavaScript vanilla

## Estructura del repositorio

```text
.
|-- backend/
|   |-- src/
|   |   |-- config/              # Variables de entorno y conexion MongoDB
|   |   |-- middlewares/         # Auth, permisos y manejo de errores
|   |   |-- models/              # Modelos Mongoose
|   |   |-- modules/             # Logica por dominio
|   |   |-- routes/              # Rutas Express
|   |   |-- utils/               # Logger y utilidades
|   |   `-- server.js            # Entry point del backend
|   |-- .env.example
|   `-- package.json
`-- Biblioteca/                 # Frontend estatico
    |-- index.html
    |-- login.html
    |-- register.html
    |-- admin/
    |-- css/
    `-- js/
```

## Configuracion

El backend usa las siguientes variables de entorno:

```env
MONGODB_URI="mongodb://127.0.0.1:27017/biblioteca"
PORT=3000
JWT_SECRET="biblioteca_alfonso_reyes_2026_secreto"
FRONTEND_ORIGIN="http://127.0.0.1:5500,http://localhost:5500"
```

`FRONTEND_ORIGIN` acepta varios origenes separados por coma. Esto permite usar Live Server desde `127.0.0.1:5500` o `localhost:5500`.

## Instalacion y ejecucion

### Back End

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Tambien se puede iniciar en modo normal:

```powershell
npm start
```

La API queda disponible en:

```text
http://localhost:3000
```

Para verificar que el servidor esta activo:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

### Front End

Abrir la carpeta `Biblioteca/` con un servidor estatico, por ejemplo Live Server de VS Code.

Ruta usual:

```text
http://127.0.0.1:5500/Biblioteca/index.html
```

## Autenticacion y roles

Todas las rutas protegidas requieren:

```text
Authorization: Bearer <token>
```

Roles principales:

- **USER:** consulta catalogo, solicita/presta libros, ve sus prestamos, listas de espera y multas.
- **ADMIN:** administra usuarios, libros, prestamos, listas de espera, multas, autorizaciones y reportes.

Rutas publicas:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`

## Endpoints

### Auth

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| POST | `/auth/register` | Publico | Registra un usuario |
| POST | `/auth/login` | Publico | Inicia sesion y devuelve JWT |
| GET | `/auth/me` | USER/ADMIN | Devuelve el usuario autenticado |

### Books

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| GET | `/books` | USER/ADMIN | Lista libros |
| GET | `/books/:id` | USER/ADMIN | Obtiene un libro |
| POST | `/books` | ADMIN | Crea libro |
| PUT | `/books/:id` | ADMIN | Actualiza libro |
| DELETE | `/books/:id` | ADMIN | Elimina libro |

### Users

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| GET | `/users` | ADMIN | Lista usuarios |
| GET | `/users/:id` | ADMIN | Obtiene usuario |
| POST | `/users` | ADMIN | Crea usuario |
| PUT | `/users/:id` | ADMIN | Actualiza usuario |
| DELETE | `/users/:id` | ADMIN | Elimina usuario |

### Loans

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| GET | `/loans` | USER/ADMIN | Lista prestamos propios o todos si es admin |
| GET | `/loans/:id` | USER/ADMIN | Obtiene prestamo propio o cualquiera si es admin |
| POST | `/loans` | USER/ADMIN | Crea prestamo directo y descuenta stock |
| PUT | `/loans/:id/return` | USER/ADMIN | Marca como devuelto y restaura stock |
| DELETE | `/loans/:id` | ADMIN | Elimina prestamo |

### Loan Requests

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| GET | `/loans/requests` | USER/ADMIN | Lista solicitudes propias o todas si es admin |
| GET | `/loans/requests/:id` | USER/ADMIN | Obtiene solicitud propia o cualquiera si es admin |
| POST | `/loans/requests` | USER/ADMIN | Crea solicitud pendiente |
| PUT | `/loans/requests/:id/approve` | ADMIN | Aprueba solicitud, crea prestamo y descuenta stock |
| PUT | `/loans/requests/:id/reject` | ADMIN | Rechaza solicitud |
| DELETE | `/loans/requests/:id` | USER/ADMIN | Cancela solicitud pendiente |

### Holds

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| GET | `/holds` | USER/ADMIN | Lista esperas propias o todas si es admin |
| GET | `/holds/:id` | USER/ADMIN | Obtiene espera propia o cualquiera si es admin |
| POST | `/holds` | USER/ADMIN | Agrega usuario a lista si no hay stock |
| PUT | `/holds/:id` | ADMIN | Cambia estado o posicion |
| DELETE | `/holds/:id` | USER/ADMIN | Cancela espera y reordena la fila |

### Fines

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| GET | `/fines` | USER/ADMIN | Lista multas propias o todas si es admin |
| GET | `/fines/:id` | USER/ADMIN | Obtiene multa propia o cualquiera si es admin |
| POST | `/fines` | ADMIN | Crea multa |
| PUT | `/fines/:id` | USER/ADMIN | Usuario puede pagar; admin puede administrar |
| DELETE | `/fines/:id` | ADMIN | Elimina multa |

### Reports

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| GET | `/reports/dashboard` | ADMIN | Resumen general |
| GET | `/reports/most-borrowed-books?limit=10` | ADMIN | Libros mas prestados |
| GET | `/reports/users-with-most-fines?limit=10` | ADMIN | Usuarios con mas multas |
| GET | `/reports/overdue-loans` | ADMIN | Prestamos vencidos |
| GET | `/reports/user-activity/:userId` | ADMIN | Actividad completa de usuario |

## Modelos principales

- **User:** usuarios y administradores.
- **Book:** catalogo, stock y datos bibliograficos.
- **Loan:** prestamos activos, vencidos y devueltos.
- **LoanRequest:** solicitudes pendientes de autorizacion.
- **Hold:** listas de espera por libro.
- **Fine:** multas pendientes o pagadas.
- **Log:** bitacora del sistema.

## Flujo de pruebas recomendado

1. Iniciar MongoDB y el backend.
2. Verificar `GET /health`.
3. Registrar o iniciar sesion con un usuario.
4. Iniciar sesion con un administrador.
5. Probar catalogo de libros desde el frontend.
6. Crear libro como administrador y confirmar que aparece en catalogo.
7. Solicitar prestamo, devolverlo y validar que el stock cambia.
8. Agregarse y cancelarse de una lista de espera cuando el libro no tiene copias.
9. Crear/pagar una multa y validar los totales.
10. Entrar a reportes como administrador y actualizar el panel.

## Estado del backend

El backend queda preparado para operar con MongoDB, rutas protegidas por JWT, permisos por rol, validaciones de entrada y flujos principales conectados con el frontend existente.
