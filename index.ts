import { existsSync, mkdirSync, writeFileSync } from 'fs';


const redirects = [
  { from: '/home', to: '/' },
  { from: '/kiezbeirat', to: 'https://adlerkiez.de/' },
];
const result: any = {
  "version": 3,
  "routes": [
    { "src": "^/$", "dest": "/index.html" },
    // {
    //   "src": "^/rbb-bussgeld$",
    //   "status": 308,
    //   "headers": { "Location": "https://www.rbb24.de/panorama/beitrag/2025/08/berlin-bussgeld-katalog-verschenke-kisten.html" }
    // },
    // { "src": "^/repair$", "dest": "/support/repair.html" },
    // { "src": "^/home$", "dest": "/" },
    // { "handle": "filesystem" }
  ]
}
let htmlLinks = ''

for (const { from, to } of redirects) {
    if(to.startsWith('http')) {
        result.routes.push({
            "src": `^${from}$`,
            "status": 308,
            "headers": { 
                "Location": to,
                "cache-control": "public, max-age=31536000, immutable"
            }
        });
    } else {
        // TODO: check for "/" and existance
        result.routes.push({ "src": `^${from}$`, "dest": to });
    }
    htmlLinks += `<li><a href="${to}">${from} → ${to}</a></li>\n`;
}
result.routes.push({ "handle": "filesystem" })
const FILE = 'config.json';
const DIR = '.vercel/output';
if(!existsSync(DIR)) {
    mkdirSync(DIR, { recursive: true });
}
console.log(result)
writeFileSync(`${DIR}/${FILE}`, JSON.stringify(result, null, 2));


// create public/index.html
if(!existsSync('public')) {
    mkdirSync('public');
}
const HTML = `adlerkiez.de url shortener\n<ul>\n${htmlLinks}</ul>\n`;
writeFileSync('public/index.html', HTML, { encoding: 'utf-8' });
