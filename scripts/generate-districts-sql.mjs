import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const geojsonPath = join(__dirname, "..", "databases", "sources", "districts_seville.geojson");
const outputPath = join(__dirname, "..", "databases", "004-districts.sql");

const raw = readFileSync(geojsonPath, "utf-8");
const geojson = JSON.parse(raw);

function escapeSQL(str) {
	if (str === null || str === undefined || String(str).length === 0) return "NULL";
	return "'" + String(str).replace(/'/g, "''") + "'";
}

function nullableInt(val) {
	if (val === null || val === undefined) return "NULL";
	const n = parseInt(val, 10);
	return isNaN(n) ? "NULL" : String(n);
}

let sql = `-- =============================================================
-- Districts of Seville
-- Source: GeoJSON districts_seville.geojson (EPSG:4326)
-- Geometries stored as MultiPolygon (normalized from Polygon/MultiPolygon)
-- =============================================================

CREATE TABLE districts (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    name TEXT NOT NULL
        CONSTRAINT chk__districts__name__max_length
            CHECK (length(name) <= 200),
    group_name TEXT NOT NULL
        CONSTRAINT chk__districts__group_name__max_length
            CHECK (length(group_name) <= 200),
    address TEXT NOT NULL
        CONSTRAINT chk__districts__address__max_length
            CHECK (length(address) <= 500),
    phone TEXT
        CONSTRAINT chk__districts__phone__max_length
            CHECK (length(phone) <= 20),
    fax TEXT
        CONSTRAINT chk__districts__fax__max_length
            CHECK (length(fax) <= 20),
    web TEXT
        CONSTRAINT chk__districts__web__max_length
            CHECK (length(web) <= 500),
    area_km2 NUMERIC(10, 2) NOT NULL,
    population_2016 INTEGER,
    men_2016 INTEGER,
    women_2016 INTEGER,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT pk__districts PRIMARY KEY (id)
);

CREATE INDEX idx__districts__geometry ON districts USING GIST (geometry);

-- Seed data
`;

let insertCount = 0;

for (const feature of geojson.features) {
	const props = feature.properties;
	const geom = feature.geometry;

	const name = escapeSQL(props.Distri_11D);
	const groupName = escapeSQL(props.Distri_6D);
	const address = escapeSQL(props.Direccion);
	const phone = props.Telefono ? escapeSQL(String(props.Telefono)) : "NULL";
	const fax = props.Fax ? escapeSQL(String(props.Fax)) : "NULL";
	const web = escapeSQL(props.Web);
	const areaKm2 = props.Area ? parseFloat(props.Area).toFixed(2) : "0.00";
	const population2016 = nullableInt(props.POB_2016);
	const men2016 = nullableInt(props.HOMBRES_16);
	const women2016 = nullableInt(props.MUJERES_16);

	const geomJson = JSON.stringify(geom);

	sql += `INSERT INTO districts (name, group_name, address, phone, fax, web, area_km2, population_2016, men_2016, women_2016, geometry)
VALUES (${name}, ${groupName}, ${address}, ${phone}, ${fax}, ${web}, ${areaKm2}, ${population2016}, ${men2016}, ${women2016}, ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON('${geomJson.replace(/'/g, "''")}'), 4326)));
`;
	insertCount++;
}

writeFileSync(outputPath, sql, "utf-8");
console.log(`Generated ${insertCount} INSERT statements -> ${outputPath}`);
