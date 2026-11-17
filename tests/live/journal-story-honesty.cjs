/* Static + runtime contract: journal/story text stays honest when Silent Pond is retired. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'haigen.html'),'utf8');
const ornate=fs.readFileSync(path.join(root,'v127-ornate-ui.js'),'utf8');

assert.match(source,/function chapterJournalBlurb\(\)\{/,'chapterJournalBlurb helper required');
assert.match(source,/if\(state\.story\.oldStreamQuestRetired\)\{\s*return '<p><b>📜 Story:<\/b> '/,'retired Discovery Journal must use between-chapters Story blurb');
assert.match(source,/\$\{chapterJournalBlurb\(\)\}/,'Discovery Journal must render chapterJournalBlurb()');
assert.doesNotMatch(
 source.slice(source.indexOf('function journal(){'),source.indexOf('function journal(){')+280),
 /Current chapter:<\/b> \$\{safeText\(storyStep\(\)/,
 'Discovery Journal must not hardcode Current chapter from storyStep alone'
);

const storyJournal=source.slice(source.indexOf('function storyJournal(){'),source.indexOf('function drawStoryClues(){'));
assert.match(storyJournal,/if\(state\.story\.oldStreamQuestRetired\)\{/,'storyJournal must branch on oldStreamQuestRetired');
assert.match(storyJournal,/Between chapters/,'retired storyJournal must say Between chapters');
assert.match(storyJournal,/The Silent Pond mystery is retired for now/,'retired storyJournal must state Silent Pond is retired');
assert.doesNotMatch(
 storyJournal.slice(storyJournal.indexOf('oldStreamQuestRetired'),storyJournal.indexOf('return;',storyJournal.indexOf('oldStreamQuestRetired'))+8),
 /Chapter I: The Silent Pond/,
 'retired storyJournal branch must not claim Chapter I: The Silent Pond'
);
assert.doesNotMatch(
 storyJournal.slice(storyJournal.indexOf('oldStreamQuestRetired'),storyJournal.indexOf('return;',storyJournal.indexOf('oldStreamQuestRetired'))+8),
 /Investigate the Silent Pond/,
 'retired storyJournal must not enqueue Investigate the Silent Pond'
);

assert.match(source,/oldStreamQuestRetired\?'🌲 Welcome back! Explore the Great Lake and the woodland trails\.'/,'welcome toast must prefer Great Lake when retired');
const welcome=source.match(/setTimeout\(\(\)=>notify\(([^)]+)\)/);
assert(welcome,'welcome notify call missing');
assert.match(welcome[1],/oldStreamQuestRetired\?/);
assert.ok(welcome[1].indexOf('oldStreamQuestRetired')<welcome[1].indexOf('Silent Pond quest awaits'),'Silent Pond awaits must only remain as non-retired fallback');

assert.match(source,/\[state\.story\.oldStreamQuestRetired\?null:storyStep\(\)\.place,'QUEST'/,'map must not paint QUEST marker while retired');
assert.match(source,/oldStreamQuestRetired:!!state\.story\?\.oldStreamQuestRetired/,'v127 bridge must expose oldStreamQuestRetired');
assert.match(ornate,/oldStreamQuestRetired\|\|state\.stage>=6/,'ornate HUD must hide Silent Pond quest when retired');

const storyStart=source.indexOf('function storyStep(){');
const blurbEnd=source.indexOf('function storyAdvance(',storyStart);
assert(storyStart>0&&blurbEnd>storyStart,'storyStep/chapterJournalBlurb block missing');
const sandbox={
 state:{story:{oldStreamQuestRetired:true,stage:6}},
 pond:{x:1200,y:1700},
 beasts:[],
 storyPlaces:{},
 storySteps:[{title:'legacy',objective:'legacy',place:{x:0,y:0}}],
 safeText:s=>String(s)
};
const script=new vm.Script(source.slice(storyStart,blurbEnd)+';({step:storyStep(),blurb:chapterJournalBlurb()})');
const retired=script.runInNewContext(sandbox);
assert.equal(retired.step.title,'The Great Lake');
assert.match(retired.step.objective,/Explore the lake/);
assert.doesNotMatch(retired.step.title,/Silent Pond/i);
assert.doesNotMatch(retired.step.objective,/Silent Pond|Investigate|Restore|Collect nearby/i);
assert.match(retired.blurb,/between chapters/i);
assert.doesNotMatch(retired.blurb,/Current chapter|Silent Pond/i);

sandbox.state.story={oldStreamQuestRetired:false,stage:1,boarHelp:false,boarArrived:false};
sandbox.storySteps=[
 {title:'The forest is listening',objective:'Explore.',place:{x:1,y:1}},
 {title:'Dylan notices something',objective:'Investigate tracks.',place:{x:2,y:2}}
];
const active=script.runInNewContext(sandbox);
assert.equal(active.step.title,'Dylan notices something');
assert.match(active.blurb,/Current chapter/);
assert.doesNotMatch(active.blurb,/between chapters/i);

console.log('PASS journal-story-honesty: retired Silent Pond never presented as active objective');
