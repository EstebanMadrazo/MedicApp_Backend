# MedicApp_Backend
Este repositorio contiene el código del backend para la aplicación de citas médicas. La arquitectura del backend está basada en microservicios, permitiendo gestionar funcionalidades independientes como usuarios, citas, pagos, chat y especialidades médicas. La aplicación sigue los estándares de seguridad y protección de datos requeridos por las leyes mexicanas, como la LFPDPPP.

# Tabla de Contenidos
Descripción del Proyecto
Arquitectura
Requisitos
Instalación y Configuración
Ejecutar la Aplicación
APIs y Documentación
Cumplimiento Normativo
Contribuir
Licencia

# Descripción del Proyecto
El backend de esta aplicación de citas médicas está diseñado para proporcionar servicios como la gestión de usuarios, autenticación, creación y gestión de citas, procesamiento de pagos, chat entre médicos y pacientes, y recuperación de especialidades médicas. Los servicios se exponen a través de varias APIs REST, con una excepción para la recuperación de especialidades médicas, que utiliza una API SOAP.

# Arquitectura
La aplicación utiliza una arquitectura de microservicios para distribuir las funcionalidades de manera modular. Los componentes principales son:

Microservicio de Usuarios: Gestiona el registro, actualización y autenticación de los usuarios.
Microservicio de Login/Autenticación: Maneja la autenticación y emisión de tokens JWT.
Microservicio de Citas: Administra la creación, cancelación y reprogramación de citas médicas.
Microservicio de Pagos: Procesa los pagos de las citas médicas.
Microservicio de Chat: Permite la comunicación entre el médico y el paciente después de agendar una cita.
Microservicio de Especialidades (SOAP): Proporciona una lista de especialidades médicas.
API Gateway: Actúa como punto de entrada para el frontend (aplicación móvil en React Native), gestionando el enrutamiento de solicitudes y la seguridad.
Cada microservicio tiene su propia base de datos, siguiendo el principio de separación de datos para asegurar la independencia y escalabilidad.

# Requisitos
Node.js (v18 o superior)
Docker y Docker Compose (para contenedores)
Base de datos (PostgreSQL, MongoDB, etc. según cada microservicio)
Redis (para la gestión de sesiones y caché)

# Instalación y Configuración
Clona el repositorio:

# Ejecutar la Aplicación
Para iniciar el backend en un entorno de desarrollo local:


# Endpoints principales
POST /api/v1/auth/login - Autenticación de usuarios.
GET /api/v1/users - Obtener información de los usuarios.
POST /api/v1/appointments - Crear una cita.
POST /api/v1/payments - Realizar un pago.
POST /api/v1/chat - Enviar un mensaje al chat.
Para la API SOAP de especialidades, la especificación WSDL está disponible en la ruta /api/v1/specialties/wsdl.

# Cumplimiento Normativo
La aplicación cumple con los requisitos de la LFPDPPP en México y sigue las recomendaciones de la NOM-024-SSA3-2012 para la gestión de datos médicos. El backend incluye mecanismos de cifrado de datos, control de acceso y auditoría para proteger la información sensible.
