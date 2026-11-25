// Frosthold Job 01: deterministic world-space foundation, independent of saves.
// Coordinates are provisional until terrain/obstacle validation in the live engine.
(function(root){
 const origin=Object.freeze({x:-900,y:-4800});
 const rect=(id,x,y,w,h)=>Object.freeze({id,x:origin.x+x,y:origin.y+y,w,h});
 const zones=Object.freeze([
 rect('outer-courtyard',-420,0,840,420),
 rect('great-hall',-420,-300,260,260),
 rect('barracks',160,-300,260,260),
 rect('inner-court',-150,-300,300,300),
 rect('keep',-220,-620,440,280),
 rect('gatehouse',-100,420,200,100),
 rect('approach',-65,520,130,220)
 ]);
 const walls=Object.freeze([
 rect('west-wall',-470,-340,50,810),rect('east-wall',420,-340,50,810),
 rect('south-west',-420,420,320,50),rect('south-east',100,420,320,50),
 rect('north-west',-470,-390,250,50),rect('north-east',220,-390,250,50)
 ]);
 const contains=(r,x,y)=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h;
 const blocked=(x,y)=>walls.some(r=>contains(r,x,y));
 const doors=Object.freeze([
 {id:'gatehouse',x:origin.x,y:origin.y+470},
 {id:'great-hall',x:origin.x-290,y:origin.y-40},
 {id:'barracks',x:origin.x+290,y:origin.y-40},
 {id:'keep',x:origin.x,y:origin.y-340}
 ].map(Object.freeze));
 const api=Object.freeze({origin,zones,walls,doors,blocked});
 if(typeof module==='object'&&module.exports)module.exports=api;else root.FrostholdFoundation=api;
})(typeof globalThis==='object'?globalThis:this);
