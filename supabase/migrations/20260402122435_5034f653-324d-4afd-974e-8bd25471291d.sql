
UPDATE cargos dest
SET titulolongocargo = src.titulolongocargo
FROM cargos src
WHERE src.codigocargo = dest.codigocargo
  AND src.owner_admin_id = 'a7fdff88-b39f-4e6d-8826-4070ec9d5ed5'
  AND src.titulolongocargo IS NOT NULL
  AND dest.titulolongocargo IS NULL
  AND dest.owner_admin_id != 'a7fdff88-b39f-4e6d-8826-4070ec9d5ed5';

-- Para os que não têm correspondência no ambiente fonte, copiar o tituloreduzido
UPDATE cargos
SET titulolongocargo = tituloreduzido
WHERE titulolongocargo IS NULL;
