-- INVENTA.AI — Seed demo (db/seed.sql): Distribuidora San Martín, Lima
insert into companies (id, name, country, plan) values
 ('11111111-1111-1111-1111-111111111111','Distribuidora San Martín','PE','growth');
insert into suppliers (company_id, name, lead_time_days, rating) values
 ('11111111-1111-1111-1111-111111111111','Alicorp',4,4.8),
 ('11111111-1111-1111-1111-111111111111','Gloria',3,4.7),
 ('11111111-1111-1111-1111-111111111111','Backus AB InBev',2,4.9);
insert into skus (company_id, code, name, category, cost, price, stock, stock_min, stock_max, abc, xyz) values
 ('11111111-1111-1111-1111-111111111111','SKU-001','Aceite Primor Premium 1L','Consumo masivo',9.40,11.90,180,400,1400,'A','X'),
 ('11111111-1111-1111-1111-111111111111','SKU-003','Leche Gloria Evaporada x24','Lácteos',78.50,96.00,96,200,700,'A','X'),
 ('11111111-1111-1111-1111-111111111111','SKU-005','Coca-Cola 2L x8','Bebidas',58.00,72.00,64,150,600,'A','Y'),
 ('11111111-1111-1111-1111-111111111111','SKU-011','Galletas Casino (descont.)','Confitería',5.90,6.50,3200,200,800,'C','Z');
insert into purchase_orders (company_id, code, total, status, ai_rationale) values
 ('11111111-1111-1111-1111-111111111111','OC-2026-184',12830,'pending','Evita quiebre en 2.9 días. Margen protegido S/ 2,140.'),
 ('11111111-1111-1111-1111-111111111111','OC-2026-185',22440,'pending','Fin de semana + campaña: demanda +38%.');
