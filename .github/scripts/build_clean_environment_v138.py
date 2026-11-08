#!/usr/bin/env python3
"""Generate isolated environment sprites from the game's original illustrated atlas.
This is a new asset. Preserve the original unchanged for immediate rollback.
"""
from pathlib import Path
from collections import deque
from PIL import Image, ImageDraw, ImageFilter
from io import BytesIO
import numpy as np, base64, json
root=Path(__file__).resolve().parents[2]
old=root/'assets/haigen-approved-environment-atlas.webp'
frames={
 "tree":(0,0,136,127),"fir":(145,0,105,151),"bush":(262,0,96,83),
 "rock":(369,0,92,68),"stump":(266,95,88,74),
 "mushroom":(362,83,90,74),"tent":(0,169,206,138),
 "cottage":(212,174,300,143),"flowerBush":(0,316,92,83),
 "ore":(101,322,91,76),"logs":(202,322,105,75),
 "barrel":(319,321,75,89),"campfire":(404,324,100,85)
}
im=Image.open(old).convert('RGBA')
assert im.size==(512,416)
dst=Image.new('RGBA',im.size,(0,0,0,0))
report={"source":old.name,"output":"haigen-environment-clean-v138.webp","frames":{}}
def components(alpha):
 h,w=alpha.shape
 occupied=alpha>=48
 visited=np.zeros((h,w),dtype=np.uint8)
 result=[]
 for yy in range(h):
  for xx in range(w):
   if visited[yy,xx] or not occupied[yy,xx]:continue
   queue=deque([(xx,yy)]);visited[yy,xx]=1
   pixels=[];minx=maxx=xx;miny=maxy=yy
   while queue:
    x,y=queue.pop();pixels.append((x,y))
    minx=min(minx,x);maxx=max(maxx,x);miny=min(miny,y);maxy=max(maxy,y)
    for dy in (-1,0,1):
     for dx in (-1,0,1):
      if not(dx or dy):continue
      nx=x+dx;ny=y+dy
      if nx<0 or nx>=w or ny<0 or ny>=h or visited[ny,nx] or not occupied[ny,nx]:continue
      visited[ny,nx]=1;queue.append((nx,ny))
   result.append({"size":len(pixels),"bbox":(minx,miny,maxx+1,maxy+1),"pixels":pixels})
 return sorted(result,key=lambda c:c['size'],reverse=True)
def isolate(name,src):
 alpha=np.asarray(src.getchannel('A'))
 comps=components(alpha)
 assert comps,name
 biggest=comps[0];bx0,by0,bx1,by1=biggest['bbox']
 mask=np.zeros(alpha.shape,dtype=np.uint8)
 kept=[]
 for index,component in enumerate(comps):
  size=component['size'];x0,y0,x1,y1=component['bbox']
  cx=(x0+x1)/2;cy=(y0+y1)/2
  # Main silhouette plus legitimate nearby separate parts, e.g. campfire sparks.
  include=index==0
  if not include:
   inside=(bx0-3<=cx<=bx1+3 and by0-4<=cy<=by1+4)
   substantial=size>=max(12,biggest['size']*.012)
   include=inside and substantial
   if name=='campfire' and bx0-6<=cx<=bx1+6 and by0-25<=cy<=by1+4:
    include=include or size>=4
  if include:
   kept.append(index)
   for px,py in component['pixels']:mask[py,px]=255
 smooth=Image.fromarray(mask,'L').filter(ImageFilter.MaxFilter(5))
 rgba=np.asarray(src).copy()
 rgba[:,:,3]=np.minimum(rgba[:,:,3],np.asarray(smooth))
 result=Image.fromarray(rgba,'RGBA')
 # The ore tile has an extra dark horizontal fragment below the main rock.
 # Trim only that known lower-left stray line; keep the valuable glint details.
 if name=='ore':
  px=np.asarray(result).copy()
  px[69:,:72,3]=0
  result=Image.fromarray(px,'RGBA')
 # Remove now-clear surrounding empty frame space. Keep the ORIGINAL bitmap
 # size and drawing semantics, but re-centre the silhouette on its prop anchor.
 box=result.getchannel('A').getbbox()
 if box:
  sprite=result.crop(box)
  scale=min(1.0,(src.width-6)/sprite.width,(src.height-3)/sprite.height)
  if scale<1:
   sprite=sprite.resize((max(1,round(sprite.width*scale)),max(1,round(sprite.height*scale))),Image.Resampling.LANCZOS)
  centered=Image.new('RGBA',src.size,(0,0,0,0))
  centered.alpha_composite(sprite,((src.width-sprite.width)//2,src.height-sprite.height-1))
  result=centered
 orig_count=int(np.count_nonzero(alpha>=48))
 clean_count=int(np.count_nonzero(np.asarray(result.getchannel('A'))>=48))
 stats={
  'rect':frames[name],"components":[{'size':c['size'],'bbox':c['bbox']} for c in comps[:9]],
  'kept_component_ids':kept,'removed_visible_pixels':orig_count-clean_count,
  'original_visible_pixels':orig_count,
  'removed_fraction':round((orig_count-clean_count)/max(1,orig_count),4),
  'alpha_bbox':result.getchannel('A').getbbox(),
  'edge_alpha_before':{side:round(float(n),3) for side,n in zip(('left','right','top','bottom'),(
      np.mean(alpha[:,0]>48),np.mean(alpha[:,-1]>48),np.mean(alpha[0,:]>48),np.mean(alpha[-1,:]>48)))},
  'edge_alpha_after':{side:round(float(n),3) for side,n in zip(('left','right','top','bottom'),(
      np.mean(rgba[:,0,3]>48),np.mean(rgba[:,-1,3]>48),np.mean(rgba[0,:,3]>48),np.mean(rgba[-1,:,3]>48)))}
 }
 return result,stats
before=Image.new('RGBA',(1100,1200),(46,54,52,255))
after=Image.new('RGBA',(1100,1200),(46,54,52,255))
for i,(name,(x,y,w,h)) in enumerate(frames.items()):
 raw=im.crop((x,y,x+w,y+h))
 clean,stats=isolate(name,raw)
 report['frames'][name]=stats
 dst.alpha_composite(clean,(x,y))
 for canvas,tile in ((before,raw),(after,clean)):
  col=i%4;row=i//4
  sx=col*274+9;sy=row*287+33
  plate=Image.new('RGBA',(246,236),(228,229,218,255))
  d=ImageDraw.Draw(plate)
  for cy in range(0,236,16):
   for cx in range(0,246,16):
    if (cx//16+cy//16)%2:d.rectangle((cx,cy,cx+15,cy+15),fill=(194,205,191,255))
  scale=min(236/w,226/h)
  tw=max(1,int(w*scale));th=max(1,int(h*scale))
  plate.alpha_composite(tile.resize((tw,th),Image.Resampling.NEAREST),((246-tw)//2,(236-th)//2))
  canvas.alpha_composite(plate,(sx,sy))
  ImageDraw.Draw(canvas).text((sx,sy-17),name,fill=(255,232,170,255))
def encode(img):
 b=BytesIO();img.convert('RGB').save(b,'JPEG',quality=85,optimize=True)
 return base64.b64encode(b.getvalue()).decode('ascii')
report['before_jpeg_base64']=encode(before)
report['after_jpeg_base64']=encode(after)
out=root/'assets/haigen-environment-clean-v138.webp'
dst.save(out,'WEBP',lossless=True,method=6)
check=Image.open(out).convert('RGBA')
assert check.size==im.size
for name,(x,y,w,h) in frames.items():
 tile=np.asarray(check.crop((x,y,x+w,y+h)).getchannel('A'))
 assert int(np.count_nonzero(tile>=48))>=300, f'Over-cleaned {name}'
# Require identified contamination removed on each confirmed suspect.
for name in ('rock','fir','bush','stump','mushroom','ore','logs','flowerBush'):
 assert report['frames'][name]['removed_visible_pixels']>15, f'Failed to isolate bleed on {name}'
report['output_size_bytes']=out.stat().st_size
j=root/'assets/environment-clean-preview-v138.json'
j.write_text(json.dumps(report,indent=2)+'\n')
print('Clean environment atlas: '+str(out)+' bytes='+str(out.stat().st_size))
for k,s in report['frames'].items():
 print(k,'components',len(s['components']),'removed',s['removed_visible_pixels'],
       'fraction',s['removed_fraction'],'kept',s['kept_component_ids'])
