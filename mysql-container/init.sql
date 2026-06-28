-- Crea la base de datos si no existe (idempotente).
CREATE DATABASE IF NOT EXISTS shadow_donaton_db;

-- Otorga el permiso de crear objetos a un usuario llamado 'donaton' desde cualquier host.
GRANT ALL PRIVILEGES ON *.* TO 'donaton'@'%';

-- Aplica los cambios de privilegios.
FLUSH PRIVILEGES;
