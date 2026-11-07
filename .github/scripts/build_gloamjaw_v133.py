#!/usr/bin/env python3
"""Rebuild the exact 28 poses from the two Gloamjaw sheets approved by the creator.
Produces only assets/gloamjaw-approved-v133.png; no saves or game code modified.
"""
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image
import hashlib
import numpy as np

SOURCES=[
 ("https://d2ol7oe51mr4n9.cloudfront.net/user_3K2x5W0tg7Jy3v9iclccNUZQ3l8/0f9c10c4-3cb6-4987-8f3f-d81a0805a79f.jpg",
  "44a2a97cf6f76ae876559ab89a3c2e9660cf456f578ccb75dddf566bbf814950",4,3,(1448,1086)),
 ("https://d2ol7oe51mr4n9.cloudfront.net/user_3K2x5W0tg7Jy3v9iclccNUZQ3l8/fc049dfd-8d63-4c80-ac8d-0e53f0e215ec.jpg",
  "b57749bfb858acce3173769a35138f2b20b2795e06b0087ca63100bcabe34a46",4,4,(1254,1254))
]

def frames():
 for url,expected,cols,rows,size in SOURCES:
  req=Request(url,headers={"User-Agent":"HaigensWorld-ApprovedArtInstaller/1.0"})
  raw=urlopen(req,timeout=60).read()
  digest=hashlib.sha256(raw).hexdigest()
  assert digest==expected,"Approved source checksum mismatch "+digest
  img=Image.open(BytesIO(raw)).convert("RGB")
  assert img.size==size,"Unexpected source dimensions "+str(img.size)
  for r in range(rows):
   for c in range(cols):
    yield img.crop((round(c*img.width/cols),round(r*img.height/rows),
                    round((c+1)*img.width/cols),round((r+1)*img.height/rows)))

def transparent(tile):
 pixels=np.asarray(tile,dtype=np.float32)
 minimum=pixels.min(axis=2)
 spread=pixels.max(axis=2)-minimum
 light=(minimum>145)&(spread<56)
 alpha=np.full(minimum.shape,255,dtype=np.float32)
 alpha[light]=np.clip((211-minimum[light])*255/38,0,255)
 # Remove isolated red image-generation backgrounds, leaving the purple petals.
 red=(pixels[:,:,0]>185)&(pixels[:,:,1]<91)&(pixels[:,:,2]<105)&(pixels[:,:,0]>pixels[:,:,1]*1.85)
 alpha[red]=0
 a=alpha/255
 rgb=pixels.copy()
 edges=(alpha>1)&(alpha<255)
 rgb[edges]=np.clip((pixels[edges]-255*(1-a[edges,None]))/
                    np.maximum(a[edges,None],.005),0,255)
 out=Image.fromarray(np.dstack([rgb,alpha]).clip(0,255).astype("uint8"),"RGBA")
 bbox=out.getchannel("A").point(lambda n:255 if n>25 else 0).getbbox()
 assert bbox is not None,"Blank approved sprite frame"
 return out.crop(bbox)

def main():
 poses=list(frames())
 assert len(poses)==28,"Expected twelve directional + sixteen attack poses"
 atlas=Image.new("RGBA",(512,896),(0,0,0,0))
 for i,frame in enumerate(poses):
  art=transparent(frame)
  ratio=min(120/art.width,122/art.height)
  w=max(1,round(art.width*ratio));h=max(1,round(art.height*ratio))
  art=art.resize((w,h),Image.Resampling.LANCZOS)
  x=i%4*128+(128-w)//2
  y=i//4*128+126-h
  atlas.alpha_composite(art,(x,y))
 for row in range(7):
  for col in range(4):
   assert atlas.crop((col*128,row*128,(col+1)*128,(row+1)*128)).getchannel("A").getbbox(),"Empty cell"
 target=Path("assets/gloamjaw-approved-v133.png")
 target.parent.mkdir(parents=True,exist_ok=True)
 atlas.save(target,optimize=True)
 assert target.stat().st_size>200000,"Boss art unexpectedly tiny"
 print("Gloamjaw approved 28-pose atlas ready:",target,target.stat().st_size,"bytes")

if __name__=="__main__":
 main()
