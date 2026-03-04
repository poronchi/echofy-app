import fs from 'fs';
import https from 'https';
import path from 'path';

const iconUrl = 'https://cdn-icons-png.flaticon.com/512/3603/3603442.png';
const publicDir = path.resolve('public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete the file async. (But we don't check result)
      reject(err);
    });
  });
};

async function main() {
  console.log('Downloading icons...');
  await downloadFile(iconUrl, path.join(publicDir, 'pwa-192x192.png'));
  await downloadFile(iconUrl, path.join(publicDir, 'pwa-512x512.png'));
  console.log('Icons downloaded.');
}

main();
