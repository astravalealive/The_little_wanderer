/* Discovery Journal composition contract.
   Complements tests/live/journal-story-honesty.cjs (Silent Pond retired honesty on main).
   Does not re-assert retired Silent Pond copy — that suite owns those strings. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'haigen.html'),'utf8');

assert.ok(fs.existsSync(path.join(root,'tests/live/journal-story-honesty.cjs')),'journal-story-honesty suite must remain the Silent Pond honesty owner');

const journalStart=source.indexOf('function journal(){');
const journalEnd=source.indexOf('const recipes=',journalStart);
assert(journalStart>0&&journalEnd>journalStart,'journal() block missing');
const journalFn=source.slice(journalStart,journalEnd);
assert.match(journalFn,/\$\{chapterJournalBlurb\(\)\}/,'Discovery Journal must embed chapterJournalBlurb()');
assert.match(journalFn,/\$\{boatwrightJournal\(\)\}/,'Discovery Journal must embed boatwrightJournal()');
assert.match(journalFn,/The Discovery Journal/,'Discovery Journal title required');
assert.match(journalFn,/Dylan friendship/,'Discovery Journal must report Dylan friendship');
assert.match(journalFn,/Skölli friendship/,'Discovery Journal must report Skölli friendship');

const boatStart=source.indexOf('function boatwrightJournal(){');
const boatEnd=source.indexOf('function journal(){',boatStart);
assert(boatStart>0&&boatEnd>boatStart,'boatwrightJournal() block missing');
const boatFn=source.slice(boatStart,boatEnd);
assert.match(boatFn,/Nordic Boatwright/,'boatwright section heading required');
assert.match(boatFn,/Timber Lake Raft/,'Tier I raft line required');
assert.match(boatFn,/Saltwick Rowing Skiff/,'Tier II skiff line required');
assert.match(boatFn,/Ocean Longship/,'Tier III longship line required');

const storyStart=source.indexOf('function storyStep(){');
const blurbEnd=source.indexOf('function storyAdvance(',storyStart);
assert(storyStart>0&&blurbEnd>storyStart,'storyStep/chapterJournalBlurb block missing');
const sandbox={
 state:{story:{oldStreamQuestRetired:true,stage:6},friends:{heri:10,skolli:12},discoveries:[],autonomy:false,wood:0,raftBuilt:false,skiffLashing:false},
 pond:{x:1,y:1},
 beasts:[],
 storyPlaces:{},
 storySteps:[{title:'x',objective:'y',place:{x:0,y:0}}],
 safeText:s=>String(s),
 autoThought:()=>'thinking'
};
const chapter=new vm.Script(source.slice(storyStart,blurbEnd)+';chapterJournalBlurb()').runInNewContext(sandbox);
assert.match(chapter,/between chapters/i,'chapter blurb helper must still honour retired story for journal composition');
assert.doesNotMatch(chapter,/Current chapter/i,'retired chapter blurb must not use Current chapter label');

const boatHtml=new vm.Script(boatFn+';boatwrightJournal()').runInNewContext({state:sandbox.state});
assert.match(boatHtml,/Ocean Longship:<\/b> Locked/);
assert.match(boatHtml,/Timber Lake Raft/);

console.log('PASS journal-contract: Discovery Journal composition + boatwright wiring');
