#!/usr/bin/env python3
"""Preserve V124 approved Skölli art and produce a dedicated animated fox atlas.

Input is the existing transparent 4x8 companion sheet (Dylan's approved V125
rabbit file is deliberately never opened or modified).
"""
from pathlib import Path
from PIL import Image, ImageEnhance

root=Path(__file__).resolve().parents[2]
src_path=root/'assets/haigen-companions-v124.png'
img=Image.open(src_path).convert('RGBA')
assert img.size==(256,512),f'Unexpected source sheet {img.size}'
canvas=Image.new('RGBA',(384,480))
def one(src_row,src_col,target_row,target_col,pose='normal'):
    cell=img.crop((src_col*64,src_row*64,(src_col+1)*64,(src_row+1)*64))
    box=cell.getchannel('A').getbbox()
    if not box: raise ValueError(f'Blank fox artwork {src_row},{src_col}')
    cell=cell.crop(box)
    if pose=='sleep':
        cell=cell.resize((cell.width, max(10,round(cell.height*.67))),Image.Resampling.NEAREST)
    elif pose=='sniff':
        cell=cell.rotate(-7,resample=Image.Resampling.NEAREST,expand=True)
    elif pose=='pounce':
        cell=cell.rotate(10,resample=Image.Resampling.NEAREST,expand=True)
    # Match Dylan's 96px cell proportions, with the animal's feet on a shared baseline.
    factor=min(87/cell.width,88/cell.height)
    tile=cell.resize((round(cell.width*factor),round(cell.height*factor)),Image.Resampling.NEAREST)
    x=target_col*96+(96-tile.width)//2
    y=target_row*96+92-tile.height
    if y<target_row*96: raise ValueError('Fox sprite clipped')
    canvas.alpha_composite(tile,(x,y))
for row in range(4):
    for col in range(4):
        one(4+row,col,row,col)
for col,(row,frame,pose) in enumerate([
    (4,0,'sleep'),(4,2,'normal'),(6,1,'sniff'),(6,2,'pounce')
]):
    one(row,frame,4,col,pose)
dst=root/'assets/skolli-fox-v126.png'
canvas.save(dst,optimize=True)
assert dst.stat().st_size>10000
for row in range(5):
    for col in range(4):
        crop=canvas.crop((col*96,row*96,(col+1)*96,(row+1)*96))
        assert crop.getchannel('A').getbbox(),(row,col)
print(f'Skölli 20-pose transparent atlas: {dst}, {dst.stat().st_size} bytes')
