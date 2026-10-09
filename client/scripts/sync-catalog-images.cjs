/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node asset maintenance script. */
// Refresh optimized local copies after changing product photos in config/media/products.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const client = path.resolve(__dirname, '..');
const source = path.resolve(client, '../config/media/products');
const output = path.join(client, 'public/catalog');
async function files(dir) {
 const entries = await fs.readdir(dir, {withFileTypes:true});
 const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(dir,entry.name)) : [path.join(dir,entry.name)]));
 return nested.flat().filter(file => /\.(png|jpe?g|webp|avif)$/i.test(file));
}
(async()=>{
 await fs.mkdir(output,{recursive:true});
 const mapping = {};
 const originals = await files(source);
 let sourceBytes=0, optimizedBytes=0;
 // Limit parallel work to two decoders to avoid memory spikes on small machines.
 for(let i=0;i<originals.length;i+=2) {
  await Promise.all(originals.slice(i,i+2).map(async file => {
   const data = await fs.readFile(file);
   const name = crypto.createHash('sha256').update(data).digest('hex').slice(0,16)+'.webp';
   const target = path.join(output,name);
   const info = await sharp(data).rotate().resize({width:720,height:720,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toFile(target);
   const relative = path.relative(source,file).split(path.sep).join('/');
   mapping['media/products/'+relative]='/catalog/'+name;
   sourceBytes+=data.length;optimizedBytes+=info.size;
  }));
 }
 await fs.writeFile(path.join(client,'lib/catalog-images.json'),JSON.stringify(mapping,null,2)+'\n');
 console.log(JSON.stringify({images:originals.length,sourceBytes,optimizedBytes}));
})().catch(error=>{console.error(error);process.exitCode=1});
