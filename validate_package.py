"""Validate the research package and conversion fixtures; not an app test suite."""
import json
from pathlib import Path
from math import isclose
P=Path(__file__).parent
files=list(P.rglob('*.json'))
data={str(p.relative_to(P)):json.loads(p.read_text()) for p in files}
ids={s['id'] for s in data['data/sources.json']}
def walk(o):
 if isinstance(o,dict):
  for k,v in o.items():
   if k=='source_ids':assert all(x in ids for x in v),(k,v)
   if k=='source_id':assert v in ids,v
   walk(v)
 elif isinstance(o,list):
  for v in o:walk(v)
for v in data.values():walk(v)
crops=data['data/crops.json']['crops']
assert {c['id'] for c in crops}=={'rice','wheat'}
for c in crops:
 st=c['stages'];assert len(st)==10
 assert len({s['id'] for s in st})==10
 assert st[0]['start_das']==0
 for a,b in zip(st,st[1:]):assert a['end_das_exclusive']==b['start_das']
 assert st[-1]['start_das']==c['harvest_das']
 assert all(s['timing_status']=='illustrative_game_schedule' for s in st)
r=data['data/rainfall.json'];assert len(r['months'])==12
assert isclose(sum(m['rain_mm'] for m in r['months']),791.3)
assert r['annual_mm_reported']==791.1
acre=4046.8564224
assert isclose(75*acre,303514.23168)
assert isclose(52*160/acre,2.055916792583854,rel_tol=1e-7)
rice=3000*.67/.1;wheat=2400/.1
assert rice==20100 and wheat==24000
assert isclose(1000000/rice,49.75124378109453)
assert isclose(1000000/wheat,41.666666666666664)
def per_bowl(total,output):return total/(output/.1) if output>0 else None
assert per_bowl(100,0) is None
assert per_bowl(100,10)==1
assert isclose(94*.25,23.5)
# Independent conservation fixture, including pumping/recharge as internal transfers.
start=1000+100+0+20
rain=50;et=30;runoff=10;conveyance=5;deep=4
# release20; pump100 -> delivered95; soil gains rain+delivery, loses ET/runoff/drain20
end_aquifer=1000+20-100
end_soil=100+50+95-30-10-20
end_pending=16
assert end_aquifer+end_soil+end_pending==start+rain-et-runoff-conveyance-deep
for item in data['assets/references.json']:
 if 'local_file' in item:assert (P/'assets'/item['local_file']).is_file()
print(f'PASS: {len(files)} JSON files, source references, 20 stages, rainfall, nursery scaling, bowl/acre conversions, zero-output and conservation fixtures.')
