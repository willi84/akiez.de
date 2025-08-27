import { existsSync, mkdirSync, writeFileSync } from 'fs';


const redirects = [
  { from: '/home', to: '/' },
  { from: '/kiezbeirat', to: 'https://adlerkiez.de/' },
];
const result: any = {
  "version": 3,
  "routes": [
    { "src": "^/$", "dest": "/index.html" },
  ]
}
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
console.log(result)
writeFileSync(`${DIR_OUTPUT}/${FILE_CONFIG}`, JSON.stringify(result, null, 2));

// write links file for 11ty
if(!existsSync(DIR_DATA)) {
    mkdirSync(DIR_DATA, { recursive: true });
}
writeFileSync(`${DIR_DATA}/${FILE_LINKS}`, JSON.stringify(redirects, null, 2));
