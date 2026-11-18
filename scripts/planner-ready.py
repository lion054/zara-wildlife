# Makes the company's Tanova tours plannable: a location for each, multi-day tours marked as packages with their nights,
# day trips given a time of day. Load the settings first:  set -a; . ./.env.local; set +a
#   python3 scripts/planner-ready.py scripts/tanova-snapshots/<new-folder>          (dry run: prints what would change)
#   python3 scripts/planner-ready.py scripts/tanova-snapshots/<new-folder> apply    (writes, saving each tour first)
import json, os, sys, urllib.request
BASE=os.environ['TANOVA_API_URL']; KEY=os.environ['TANOVA_API_KEY']; SNAP=sys.argv[1]; APPLY=len(sys.argv)>2 and sys.argv[2]=='apply'
import time
def call(method, path, body=None, tries=6):
    req=urllib.request.Request(BASE+path, method=method, data=json.dumps(body).encode() if body is not None else None,
        headers={'Authorization':'Bearer '+KEY,'Accept':'application/json','Content-Type':'application/json','Idempotency-Key':os.urandom(8).hex()})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            time.sleep(0.7); return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e:
        if e.code==429 and tries>0: time.sleep(8); return call(method,path,body,tries-1)
        return e.code, json.loads(e.read() or b'{}')
KILI,ARUSHA,MATERUNI,TARANGIRE,MKOMAZI,WESTKILI,ZNZ,NORTH=13,16,27,17,23,18,11,30
# Day trips: (place, part of day)
# Day trips by name: (place, part of day). Moshi-area trips sit under Mount Kilimanjaro, the base the office runs from.
DAY={'tarangire national park':(TARANGIRE,1),'shira plateau':(KILI,1),'serval wildlife':(KILI,2),'mkomazi national park':(MKOMAZI,1),
     'materuni waterfall & coffee tour':(KILI,1),'marangu waterfalls day trip':(KILI,1),'mandara hut':(KILI,1),'maasai boma':(ARUSHA,2),
     'lake chala':(KILI,2),'chemka hot springs':(KILI,2),'arusha national park':(ARUSHA,1)}
plan={}
st,d=call('GET','/services?type=tour&per_page=100')
for s in d['data']:
    i=s['id']; t=s['title'].lower()
    if t in DAY:
        loc,slot=DAY[t]; plan[i]={'location_id':loc,'time_slot':slot,'is_package':False}; continue
    loc = ZNZ if 'zanzibar' in t and 'safari' not in t and 'kilimanjaro' not in t else (ARUSHA if 'meru' in t else (KILI if any(w in t for w in ['route','kilimanjaro trek','biking']) and 'safari' not in t else NORTH))
    plan[i]={'location_id':loc,'is_package':True}
for i in sorted(plan):
    st,full=call('GET',f'/services/tours/{i}')
    rec=full.get('data',full)
    json.dump(rec,open(f'{SNAP}/{i}.json','w'))
    dur=rec.get('duration')
    p=dict(plan[i])
    if p.get('is_package') and dur: p['package_nights']=max(0,int(float(dur))-1)
    if APPLY:
        st2,r=call('PUT',f'/services/tours/{i}',p)
        print(i,st2,p,'' if st2==200 else json.dumps(r)[:200])
    else:
        print(i,rec.get('title'),'dur',dur,'->',p)
