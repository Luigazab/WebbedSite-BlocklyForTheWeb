import React from 'react'
import '../src/index.css'
import {createRoot} from 'react-dom/client'
import {captureWebsiteThumbnail} from '../src/utils/websiteThumbnail.js'
import SavedBlocksPreview from '../src/components/editor/SavedBlocksPreview.jsx'
const files = [{id:'html',filename:'index.html',blocks_json:{blocks:{languageVersion:0,blocks:[{type:'text',fields:{TEXT:'Saved block structure'},x:500,y:700},{type:'link_css_file',fields:{FILENAME:'style.css'},x:500,y:780}]}}},{id:'css',filename:'style.css',blocks_json:{blocks:{blocks:[]}}}]
createRoot(document.getElementById('blocks')).render(<div style={{display:'flex',height:320,position:'relative',marginTop:20,border:'1px solid #888'}}><SavedBlocksPreview file={files[0]} files={files}/></div>)
async function runCheck() {
try {
 const blob=await captureWebsiteThumbnail('<!doctype html><html><head><style>body{margin:0;background:#123456;color:white;font-family:Arial}main{padding:80px}h1{font-size:60px}.card{background:#fff;color:#123456;padding:30px;border-radius:20px;width:400px}@media(max-width:800px){body{background:red}}</style></head><body><main><h1>My created website</h1><div class="card" id="dynamic">Waiting</div></main><script>document.getElementById("dynamic").textContent="JavaScript rendered successfully"</script></body></html>')
 const img=document.getElementById('screenshot');img.src=URL.createObjectURL(blob);await img.decode();
 const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);const pixel=Array.from(ctx.getImageData(0,0,1,1).data);
 document.getElementById('result').textContent=`${img.naturalWidth===1280 && img.naturalHeight===720 && pixel.join(',')==='18,52,86,255'?'PASS':'FAIL'}: screenshot ${img.naturalWidth} × ${img.naturalHeight}, background ${pixel}, ${blob.size} bytes`;
} catch(e){document.getElementById('result').textContent='FAIL: '+e.message}

}
document.getElementById("run").addEventListener("click", runCheck)
