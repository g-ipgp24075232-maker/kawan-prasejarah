/** Resize photographs in the browser before saving them to localStorage.
 * This avoids quota errors and supports ordinary photos from phones. */
export interface PreparedImage {data:string;message:string;}
export interface ImageOptions {maxDimension?:number;maxDataChars?:number;}

const MAX_FILE_BYTES=18_000_000;
const SUPPORTED=['image/png','image/jpeg','image/webp','image/gif'];
export async function prepareImage(file:File,options:ImageOptions={}):Promise<PreparedImage>{
  if(!SUPPORTED.includes(file.type))throw new Error('Format tidak disokong. Gunakan gambar PNG, JPG, WEBP atau GIF. Fail SVG perlu ditukar kepada PNG.');
  if(file.size>MAX_FILE_BYTES)throw new Error('Gambar terlalu besar (had 18 MB). Sila pilih gambar yang lebih kecil.');
  const maxDimension=options.maxDimension??1500;
  const maxChars=options.maxDataChars??440_000;
  if(file.type==='image/gif'&&file.size<maxChars*.70){
    const data=await readFile(file);
    return {data,message:'GIF berjaya dimuat naik. Animasi dikekalkan.'};
  }
  const sourceUrl=URL.createObjectURL(file);
  try{
    const image=await new Promise<HTMLImageElement>((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=()=>reject(new Error('Gambar tidak dapat dibaca. Cuba PNG atau JPG.'));
      img.src=sourceUrl;
    });
    let scale=Math.min(1,maxDimension/Math.max(image.naturalWidth,image.naturalHeight));
    let quality=.84;
    for(let attempt=0;attempt<14;attempt++){
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      const ctx=canvas.getContext('2d');
      if(!ctx)throw new Error('Pelayar tidak menyokong pemprosesan imej. Cuba Chrome atau Edge.');
      ctx.drawImage(image,0,0,canvas.width,canvas.height);
      let data=canvas.toDataURL('image/webp',quality);
      if(!data.startsWith('data:image/webp;'))data=canvas.toDataURL('image/jpeg',quality);
      if(data.length<=maxChars){
        return {data,message:file.type==='image/gif'
          ?'GIF terlalu besar, jadi bingkai pertama digunakan sebagai gambar statik.'
          :'Gambar berjaya dimuat naik dan dikecilkan secara automatik.'};
      }
      if(quality>.53)quality=Math.max(.52,quality-.11);
      else {scale*=.77;quality=.78;}
    }
    throw new Error('Gambar tidak dapat dikecilkan. Sila gunakan imej yang lebih ringkas.');
  }finally{
    URL.revokeObjectURL(sourceUrl);
  }
}
function readFile(file:File):Promise<string>{
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(new Error('Gambar tidak dapat dibaca.'));
    reader.onerror=()=>reject(new Error('Gambar tidak dapat dibaca.'));
    reader.readAsDataURL(file);
  });
}
