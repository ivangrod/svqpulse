import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const csvPath = "/Users/ivan.gutierrez/Desktop/exportacion.csv";
const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "..", "databases", "002-tourist-apartments.sql");

const raw = readFileSync(csvPath, "utf-8");
const lines = raw.split("\n").filter((l) => l.trim().length > 0);

// Skip "Tabla 1" header and column names
const dataLines = lines.slice(2);

function parseCSVLine(line) {
	const fields = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (ch === '"') {
			if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
				current += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
		} else if (ch === ";" && !inQuotes) {
			fields.push(current.trim());
			current = "";
		} else {
			current += ch;
		}
	}
	fields.push(current.trim());
	return fields;
}

function escapeSQL(str) {
	if (!str || str.length === 0) return "NULL";
	return "'" + str.replace(/'/g, "''") + "'";
}

function parseDate(dateStr) {
	if (!dateStr || dateStr.length === 0) return "NULL";
	// Format: DD/MM/YYYY -> YYYY-MM-DD
	const parts = dateStr.split("/");
	if (parts.length !== 3) return "NULL";
	return `'${parts[2]}-${parts[1]}-${parts[0]}'`;
}

function parseInteger(val) {
	if (!val || val.length === 0) return "0";
	const n = parseInt(val, 10);
	return isNaN(n) ? "0" : String(n);
}

let sql = `-- =============================================================
-- Tourist Apartments registered in Seville
-- Source: Junta de Andalucía - Registro de Turismo
-- Coordinates converted from ETRS89/UTM zone 30N (SRID 25830)
-- to WGS84 (SRID 4326) using ST_Transform
-- =============================================================

CREATE TABLE tourist_apartments (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    registration_code TEXT NOT NULL
        CONSTRAINT chk__tourist_apartments__registration_code__max_length
            CHECK (length(registration_code) <= 20),
    name TEXT NOT NULL
        CONSTRAINT chk__tourist_apartments__name__max_length
            CHECK (length(name) <= 300),
    activity TEXT NOT NULL
        CONSTRAINT chk__tourist_apartments__activity__max_length
            CHECK (length(activity) <= 100),
    activity_start_date DATE,
    registration_date DATE,
    group_type TEXT NOT NULL
        CONSTRAINT chk__tourist_apartments__group_type__max_length
            CHECK (length(group_type) <= 100),
    category TEXT NOT NULL
        CONSTRAINT chk__tourist_apartments__category__max_length
            CHECK (length(category) <= 100),
    modality TEXT NOT NULL
        CONSTRAINT chk__tourist_apartments__modality__max_length
            CHECK (length(modality) <= 100),
    specialties TEXT,
    address TEXT NOT NULL
        CONSTRAINT chk__tourist_apartments__address__max_length
            CHECK (length(address) <= 500),
    postal_code TEXT
        CONSTRAINT chk__tourist_apartments__postal_code__max_length
            CHECK (length(postal_code) <= 10),
    locality TEXT
        CONSTRAINT chk__tourist_apartments__locality__max_length
            CHECK (length(locality) <= 100),
    municipality TEXT NOT NULL
        CONSTRAINT chk__tourist_apartments__municipality__max_length
            CHECK (length(municipality) <= 100),
    province TEXT NOT NULL
        CONSTRAINT chk__tourist_apartments__province__max_length
            CHECK (length(province) <= 100),
    total_capacity INTEGER NOT NULL,
    total_accommodation_units INTEGER NOT NULL,
    cadastral_reference TEXT,
    location GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT pk__tourist_apartments PRIMARY KEY (id),
    CONSTRAINT uq__tourist_apartments__registration_code UNIQUE (registration_code)
);

CREATE INDEX idx__tourist_apartments__location ON tourist_apartments USING GIST (location);

-- Seed data
`;

let insertCount = 0;
let skippedCount = 0;

for (const line of dataLines) {
	const fields = parseCSVLine(line);
	if (fields.length < 18) {
		console.warn(`Skipping line with insufficient fields: ${fields[0]}`);
		skippedCount++;
		continue;
	}

	const [
		codRegistro,
		nombre,
		actividad,
		fechaInicioActiv,
		fechaInscripcion,
		grupo,
		categoria,
		modalidad,
		especialidades,
		domicilio,
		codigoPostal,
		localidad,
		municipio,
		provincia,
		totalPlazas,
		totalUdesAlojamiento,
		x,
		y,
		srid,
		refCatastral,
	] = fields;

	// Skip rows without coordinates
	if (!x || !y || x.length === 0 || y.length === 0) {
		console.warn(`Skipping ${codRegistro} - no coordinates`);
		skippedCount++;
		continue;
	}

	const specialtiesVal =
		especialidades === "No disponible" ? "NULL" : escapeSQL(especialidades);
	const nameVal = nombre && nombre.length > 0 ? escapeSQL(nombre) : escapeSQL(codRegistro);

	sql += `INSERT INTO tourist_apartments (registration_code, name, activity, activity_start_date, registration_date, group_type, category, modality, specialties, address, postal_code, locality, municipality, province, total_capacity, total_accommodation_units, cadastral_reference, location)
VALUES (${escapeSQL(codRegistro)}, ${nameVal}, ${escapeSQL(actividad)}, ${parseDate(fechaInicioActiv)}, ${parseDate(fechaInscripcion)}, ${escapeSQL(grupo)}, ${escapeSQL(categoria)}, ${escapeSQL(modalidad)}, ${specialtiesVal}, ${escapeSQL(domicilio)}, ${codigoPostal ? escapeSQL(codigoPostal) : "NULL"}, ${localidad ? escapeSQL(localidad) : "NULL"}, ${escapeSQL(municipio)}, ${escapeSQL(provincia)}, ${parseInteger(totalPlazas)}, ${parseInteger(totalUdesAlojamiento)}, ${refCatastral ? escapeSQL(refCatastral) : "NULL"}, ST_Transform(ST_SetSRID(ST_MakePoint(${x}, ${y}), 25830), 4326));
`;
	insertCount++;
}

writeFileSync(outputPath, sql, "utf-8");
console.log(`Generated ${insertCount} INSERT statements (${skippedCount} skipped) -> ${outputPath}`);
