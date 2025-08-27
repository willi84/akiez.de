import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const SHEET_ID = "1Q3oGpVqS8k_PV9unRqxYvKFDF0q5qtah2-2QG36K_-c";
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const data = execSync(`curl -s "${url}"`).toString();
const json = JSON.parse(data.substring(47, data.length - 2));
console.log(json.table.cols);
console.log(json.table.rows);
const targets = [];
const colNames = json.table.cols[0].label !== '' ? json.table.cols.map((c: any) => c.label) : json.table.rows[0].c.map((_: any, i: number) => `${_.v}`);
for (const row of json.table.rows) {
    const entry: any = {};
    row.c.forEach((cell: any, i: number) => {
        const value = cell ? cell.v : null;
        if(value === colNames[i]) return; // skip header row
        entry[colNames[i]] = cell ? cell.v : null;
    });
    if(entry.name && entry.ziel && entry.status) targets.push({from: `/${entry.name}`, to: entry.ziel, status: entry.status});
    console.log(entry);
}

// const redirects = [
//   { from: '/home', to: '/' },
//   { from: '/kiezbeirat', to: 'https://adlerkiez.de/' },
// ];
const result: any = {
  "version": 3,
  "routes": [
    { "src": "^/$", "dest": "/index.html" },
  ]
}
const existingFroms = [];
for (const entry of targets) {
    if(entry.status === 'created') continue; // skip created entries
    const hasProtocol = entry.to.startsWith('http://');
    const hasDomain = entry.to.includes('.') && !entry.to.startsWith('/') && !entry.to.endsWith('.html');
    if(entry.to.startsWith('http') || hasDomain) {
        let target = hasProtocol ? entry.to : `https://${entry.to}`;
        if(!existingFroms.includes(entry.from)){
            existingFroms.push(entry.from);
            result.routes.push({
                "src": `^${entry.from}$`,
                "status": entry.status === 'active' ? 301 : 404,
                "headers": { 
                    "Location": target,
                    "cache-control": "public, max-age=31536000, immutable"
                }
            });
        }
    } else {
        if(!existingFroms.includes(entry.from)){
            existingFroms.push(entry.from);
            // TODO: check for "/"
            result.routes.push({ "src": `^${entry.from}$`, "dest": entry.to, "status": entry.status === 'active' ? 301 : 404 });
        }
    }
}
result.routes.push({ "handle": "filesystem" })
const FILE_CONFIG = 'config.json';
const FILE_LINKS = 'links.json';
const DIR_OUTPUT = '.vercel/output';
const DIR_DATA = 'src/_data';

// write vercel config file
if(!existsSync(DIR_OUTPUT)) {
    mkdirSync(DIR_OUTPUT, { recursive: true });
}
console.log(JSON.stringify(result, null, 2));
writeFileSync(`${DIR_OUTPUT}/${FILE_CONFIG}`, JSON.stringify(result, null, 2));

// write links file for 11ty
if(!existsSync(DIR_DATA)) {
    mkdirSync(DIR_DATA, { recursive: true });
}
writeFileSync(`${DIR_DATA}/${FILE_LINKS}`, JSON.stringify(targets, null, 2));
