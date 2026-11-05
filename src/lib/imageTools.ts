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

/** Prepare a full-size, front-facing cartoon as a registered portrait frame.
 * Centre-crop landscape screenshots identically, remove only connected
 * near-white background pixels (not the white inside character eyes). */
export async function prepareAvatarPose(file:File):Promise<PreparedImage>{
  if(!SUPPORTED.includes(file.type))throw new Error('Gunakan gambar PNG, JPG, WEBP atau GIF.');
  if(file.size>MAX_FILE_BYTES)throw new Error('Gambar melebihi had 18 MB.');
  const url=URL.createObjectURL(file);
  try{
    const image=await new Promise<HTMLImageElement>((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=()=>reject(new Error('Imej avatar tidak dapat dibaca.'));
      img.src=url;
    });
    const w=image.naturalWidth,h=image.naturalHeight;
    const landscape=w>h*1.16;
    const cropWidth=landscape?Math.min(w,h*.70):w;
    const cropLeft=(w-cropWidth)/2;
    const outputH=520;
    const outputW=Math.max(1,Math.round(cropWidth/h*outputH));
    const canvas=document.createElement('canvas');
    canvas.width=outputW;canvas.height=outputH;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)throw new Error('Pelayar tidak boleh memproses gambar.');
    ctx.clearRect(0,0,outputW,outputH);
    ctx.drawImage(image,cropLeft,0,cropWidth,h,0,0,outputW,outputH);
    const rgba=ctx.getImageData(0,0,outputW,outputH);
    const data=rgba.data;
    const len=outputW*outputH;
    const visited=new Uint8Array(len);
    const queue=new Int32Array(len);
    let begin=0,end=0;
    const isBackground=(i:number)=>{
      const p=i*4,r=data[p],g=data[p+1],b=data[p+2];
      const low=Math.min(r,g,b),high=Math.max(r,g,b);
      return data[p+3]<24 || (low>220&&high-low<20);
    };
    const push=(i:number)=>{
      if(visited[i]||!isBackground(i))return;
      visited[i]=1;queue[end++]=i;
    };
    for(let x=0;x<outputW;x++){push(x);push((outputH-1)*outputW+x);}
    for(let y=0;y<outputH;y++){push(y*outputW);push(y*outputW+outputW-1);}
    while(begin<end){
      const p=queue[begin++];
      if(p>=outputW)push(p-outputW);
      if(p+outputW<len)push(p+outputW);
      if(p%outputW>0)push(p-1);
      if(p%outputW<outputW-1)push(p+1);
      data[p*4+3]=0;
    }
    ctx.putImageData(rgba,0,0);
    let imageData=canvas.toDataURL('image/webp',.85);
    if(!imageData.startsWith('data:image/webp;'))
      imageData=canvas.toDataURL('image/png');
    if(imageData.length>650_000)
      throw new Error('Fail avatar masih terlalu besar. Cuba gambar PNG atau JPG yang lebih kecil.');
    return {data:imageData,message:'Gambar Aki berjaya disediakan (latar putih dibuang jika boleh).'};
  } finally {URL.revokeObjectURL(url);}
}
