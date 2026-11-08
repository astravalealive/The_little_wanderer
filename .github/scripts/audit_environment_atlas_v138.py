#!/usr/bin/env python3
"""Read-only environment atlas inspection for V138. No artwork is modified."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from collections import Counter
from io import BytesIO
import numpy as np, base64, json
root=Path(__file__).resolve().parents[2]
frames={
 "tree":(0,0,136,127),"fir":(145,0,105,151),"bush":(262,0,96,83),
 "rock":(369,0,92,68),"stump":(266,95,88,74),
 "mushroom":(362,83,90,74),"tent":(0,169,206,138),
 "cottage":(212,174,300,143),"flowerBush":(0,316,92,83),
 "ore":(101,322,91,76),"logs":(202,322,105,75),
 "barrel":(319,321,75,89),"campfire":(404,324,100,85)
}
source=root/'assets/haigen-approved-environment-atlas.webp'
img=Image.open(source).convert("RGBA")
orig=Image.open(source)
report={'source':str(source.relative_to(root)),'image_size':img.size,'mode':orig.mode,'frames':{},'assets':{}}
for name,rect in frames.items():
 x,y,w,h=rect
 crop=img.crop((x,y,x+w,y+h))
 a=np.array(crop.getchannel('A'))
 corners=[crop.getpixel(p) for p in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]]
 opaque=(a>220)
 report['frames'][name]={
  'rect':rect,'alpha_minmax':(int(a.min()),int(a.max())),
  'alpha_coverage':round(float(np.mean(a>16)),4),
  'alpha_opaque':round(float(np.mean(opaque)),4),
  'edge_alpha':{ 'left':round(float(np.mean(a[:,0]>16)),3),
     'right':round(float(np.mean(a[:,-1]>16)),3),
     'top':round(float(np.mean(a[0,:]>16)),3),
     'bottom':round(float(np.mean(a[-1,:]>16)),3)},
  'alpha_bbox':crop.getchannel('A').getbbox(),
  'corners':corners,
  'top_colors':[(list(color),count) for color,count in Counter(crop.getdata()).most_common(5)]
 }
for path in sorted((root/'assets').iterdir()):
 if path.suffix.lower() not in ('.webp','.png','.jpg','.jpeg'):continue
 try:
  art=Image.open(path); alpha=np.asarray(art.convert("RGBA").getchannel('A'))
  report['assets'][path.name]={'size':art.size,'mode':art.mode,
    'alpha_coverage':round(float(np.mean(alpha>16)),4),
    'alpha_edge_fraction':round(float(np.mean(np.concatenate((alpha[0,:],alpha[-1,:],alpha[:,0],alpha[:,-1]))>16)),4)}
 except Exception as exc:report['assets'][path.name]={'error':str(exc)}
def encode(canvas):
 raw=BytesIO();canvas.convert('RGB').save(raw,format='JPEG',quality=88,optimize=True)
 return base64.b64encode(raw.getvalue()).decode()
# White original with crop rectangles and labels to show source bleed.
base=Image.new('RGB',(1024,832),(233,233,230))
base.paste(img.resize((1024,832)),(0,0),img.getchannel('A').resize((1024,832)))
draw=ImageDraw.Draw(base)
for i,(name,rect) in enumerate(frames.items()):
 x,y,w,h=rect
 color=(230,35,70) if name=='rock' else (25,115,205)
 draw.rectangle((x*2,y*2,(x+w)*2-1,(y+h)*2-1),outline=color,width=2)
 draw.rectangle((x*2,y*2,x*2+min(w*2,len(name)*10+11),y*2+18),fill=(18,34,40))
 draw.text((x*2+3,y*2+2),name,fill=(255,255,229))
report['annotated_source_jpeg_base64']=encode(base)
# Contact sheet with checkerboard, source crop exactly as game renders it.
thumb=Image.new('RGB',(1100,1200),(43,51,50));d=ImageDraw.Draw(thumb)
for i,(name,rect) in enumerate(frames.items()):
 x,y,w,h=rect;col=i%4;row=i//4
 sx=col*274+9;sy=row*287+33
 tile=img.crop((x,y,x+w,y+h))
 sc=min(236/w,226/h)
 tw=max(1,int(w*sc));th=max(1,int(h*sc))
 checker=Image.new('RGBA',(246,236),(240,236,225,255));cd=ImageDraw.Draw(checker)
 for yy in range(0,236,16):
  for xx in range(0,246,16):
   if (xx//16+yy//16)%2:cd.rectangle((xx,yy,xx+15,yy+15),fill=(204,210,200,255))
 checker.alpha_composite(tile.resize((tw,th)),((246-tw)//2,(236-th)//2))
 thumb.paste(checker.convert('RGB'),(sx,sy))
 d.text((sx,sy-19),f'{name}  {rect}',fill=(255,231,175))
report['contact_sheet_jpeg_base64']=encode(thumb)
target=root/'assets/environment-atlas-audit-v138.json'
target.write_text(json.dumps(report,indent=2)+'\n')
print('AUDIT '+str(target)+' frames='+str(len(frames))+' assets='+str(len(report['assets'])))
for k in frames:print(k,report['frames'][k]['edge_alpha'],'bbox',report['frames'][k]['alpha_bbox'],'corners',report['frames'][k]['corners'][:1])
