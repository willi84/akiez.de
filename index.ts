import { existsSync, mkdirSync, writeFileSync } from 'fs';


const redirects = [
  { from: '/internal', to: '/' },
  { from: '/kiezbeirat', to: 'https://adlerkiez.de/' },
];
const result: any = {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "redirects": []
}

for (const { from, to } of redirects) {
    result.redirects.push({ source: from, destination: to, permanent: true });
}
const FILE = 'vercel.json';
writeFileSync(FILE, JSON.stringify({ redirects }, null, 2));

// create public/index.html
if(!existsSync('public')) {
    mkdirSync('public');
}
const HTML = 'adlerkiez.de url shortener';
writeFileSync('public/index.html', HTML, { encoding: 'utf-8' });
