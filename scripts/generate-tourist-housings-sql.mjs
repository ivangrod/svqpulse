import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const csvPath = "/Users/ivan.gutierrez/Desktop/vut.csv";
const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "..", "databases", "003-tourist-housings.sql");

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
	const parts = dateStr.split("/");
	if (parts.length !== 3) return "NULL";
	return `'${parts[2]}-${parts[1]}-${parts[0]}'`;
}

function parseInteger(val) {
	if (!val || val.length === 0) return "0";
	const n = parseInt(val, 10);
	return isNaN(n) ? "0" : String(n);
}

// Column indices:
// 0: COD_REGISTRO, 1: NOMBRE, 2: ACTIVIDAD, 3: FECHA_INICIO_ACTIV,
// 4: FECHA_INSCRIPCION, 5: DOMICILIO_ESTAB, 6: LOCALIDAD, 7: MUNICIPIO,
// 8: CODIGO_POSTAL, 9: PROVINCIA, 10: TIPO_VIVIENDA, 11: TOTAL_HABITACIONES,
// 12: TOTAL_PLAZAS, 13: X, 14: Y, 15: SRID, 16: REF_CATASTRAL

let sql = `-- =============================================================
-- Tourist Housings (Viviendas de Uso Turístico) registered in Seville
-- Source: Junta de Andalucía - Registro de Turismo
-- Coordinates converted from ETRS89/UTM zone 30N (SRID 25830)
-- to WGS84 (SRID 4326) using ST_Transform
-- =============================================================

CREATE TABLE tourist_housings (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    registration_code TEXT NOT NULL
        CONSTRAINT chk__tourist_housings__registration_code__max_length
            CHECK (length(registration_code) <= 20),
    name TEXT
        CONSTRAINT chk__tourist_housings__name__max_length
            CHECK (length(name) <= 300),
    activity TEXT NOT NULL
        CONSTRAINT chk__tourist_housings__activity__max_length
            CHECK (length(activity) <= 100),
    activity_start_date DATE,
    registration_date DATE,
    address TEXT NOT NULL
        CONSTRAINT chk__tourist_housings__address__max_length
            CHECK (length(address) <= 500),
    postal_code TEXT
        CONSTRAINT chk__tourist_housings__postal_code__max_length
            CHECK (length(postal_code) <= 10),
    locality TEXT
        CONSTRAINT chk__tourist_housings__locality__max_length
            CHECK (length(locality) <= 100),
    municipality TEXT NOT NULL
        CONSTRAINT chk__tourist_housings__municipality__max_length
            CHECK (length(municipality) <= 100),
    province TEXT NOT NULL
        CONSTRAINT chk__tourist_housings__province__max_length
            CHECK (length(province) <= 100),
    housing_type TEXT
        CONSTRAINT chk__tourist_housings__housing_type__max_length
            CHECK (length(housing_type) <= 100),
    total_rooms INTEGER NOT NULL,
    total_capacity INTEGER NOT NULL,
    cadastral_reference TEXT,
    location GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT pk__tourist_housings PRIMARY KEY (id),
    CONSTRAINT uq__tourist_housings__registration_code UNIQUE (registration_code)
);

CREATE INDEX idx__tourist_housings__location ON tourist_housings USING GIST (location);

-- Seed data
`;

let insertCount = 0;
let skippedCount = 0;

for (const line of dataLines) {
	const f = parseCSVLine(line);

	const x = f[13];
	const y = f[14];

	if (!x || !y || x.length === 0 || y.length === 0) {
		skippedCount++;
		console.log(`Skipped (no coordinates): ${f[0]}`);
		continue;
	}

	const registrationCode = escapeSQL(f[0]);
	const name = escapeSQL(f[1]);
	const activity = escapeSQL(f[2]);
	const activityStartDate = parseDate(f[3]);
	const registrationDate = parseDate(f[4]);
	const address = escapeSQL(f[5]);
	const locality = f[6] && f[6].length > 0 ? escapeSQL(f[6]) : "NULL";
	const municipality = escapeSQL(f[7]);
	const postalCode = f[8] && f[8].length > 0 ? escapeSQL(f[8]) : "NULL";
	const province = escapeSQL(f[9]);
	const housingType = f[10] && f[10].length > 0 ? escapeSQL(f[10]) : "NULL";
	const totalRooms = parseInteger(f[11]);
	const totalCapacity = parseInteger(f[12]);
	const cadastralReference = f[16] && f[16].length > 0 ? escapeSQL(f[16]) : "NULL";

	sql += `INSERT INTO tourist_housings (registration_code, name, activity, activity_start_date, registration_date, address, postal_code, locality, municipality, province, housing_type, total_rooms, total_capacity, cadastral_reference, location)\nVALUES (${registrationCode}, ${name}, ${activity}, ${activityStartDate}, ${registrationDate}, ${address}, ${postalCode}, ${locality}, ${municipality}, ${province}, ${housingType}, ${totalRooms}, ${totalCapacity}, ${cadastralReference}, ST_Transform(ST_SetSRID(ST_MakePoint(${x}, ${y}), 25830), 4326));\n`;

	insertCount++;
}

writeFileSync(outputPath, sql, "utf-8");
console.log(`\nGenerated ${insertCount} INSERT statements (${skippedCount} skipped) -> ${outputPath}`);
