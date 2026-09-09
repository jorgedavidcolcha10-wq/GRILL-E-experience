# GRILL'E V2

Base funcional para una plataforma de pedidos de GRILL'E con:

- Home moderna y minimalista.
- Menú y categorías.
- Búsqueda.
- Carrito con cantidades.
- Checkout.
- Delivery / retiro / consumo en local.
- Pedidos persistidos en `data/db.json`.
- Panel `/admin`.
- Dashboard, pedidos, productos y ventas.
- PWA base.
- Adaptador preparado para PagoPlux Sandbox/Production.

## Requisitos

Node.js 18+ recomendado.

## Instalación

```bash
npm install
npm start
```

Abrir:

- Cliente: http://localhost:3000
- Admin: http://localhost:3000/admin/login.html

Credenciales por defecto:

- Email: `admin@grille.ec`
- Password: `CambiaEstaClave123!`

Para producción, configura variables de entorno y cambia la contraseña.

## PagoPlux

El proyecto NO inventa la integración de PagoPlux. El endpoint:

`POST /api/payments/pagoplux/create`

es un adaptador temporal. Cuando se entregue el script jQuery/documentación oficial de PagoPlux de GRILL'E, se debe sustituir por la integración exacta de Sandbox y Production, incluyendo retorno y webhook/firma.

Nunca colocar claves privadas en JavaScript del navegador.

## Próximas mejoras

1. Base de datos PostgreSQL/MySQL.
2. Gestión de imágenes desde admin.
3. Extras/opciones de productos.
4. Zonas de delivery configurables.
5. Cupones/promociones.
6. Notificaciones en tiempo real.
7. Integración real de PagoPlux.
8. Roles de administrador.
9. Auditoría y logs.
10. HTTPS, rate limiting, validación y endurecimiento de seguridad.
