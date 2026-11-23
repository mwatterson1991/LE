#!/usr/bin/env python3
"""One-off manifest pass, Nov 23: neutral photo titles, true photo sizes, brand-board and guideline photos,
brand graphics, fonts and the Leo pack. Leaves GIF entries untouched. Safe to re-run."""
import json, os, re
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'data', 'manifest.json')
m = json.load(open(P))
A = m['assets']
TITLES = {
 'african-american-female-call-agent-microphone': 'Support agent with headset and tablet',
 'african-american-male-backpack-smiling': 'Student with backpack',
 'african-american-professional-woman-entrepreneur': 'Professional holding a tablet in an office',
 'analyzing-profit-margins-business': 'Presenting a chart to the team',
 'asian-college-student-laptop-online-course': 'Hands at a laptop with notes',
 'asian-woman-job-interview-diverse-office': 'Job interview, smiling',
 'black-student-online-learning-video-call': 'Student with headphones on a laptop',
 'business-people-conference-room': 'Team around a conference table',
 'businesswoman-outdoors-city-skyscrapers': 'Looking up at skyscrapers',
 'businesswoman-working-office': 'Smiling at a laptop in an office',
 'colleagues-discussion-modern-office-plants': 'Two colleagues talking in a meeting room',
 'college-friends-talking-hallway': 'Students talking in a hallway',
 'college-students-taking-test-classroom': 'Students taking a test, from above',
 'confident-businesswoman-entrepreneur-office': 'At a desk with a phone and laptop',
 'consultant-business-man-in-office-with-team': 'Standing in an office, team behind',
 'diverse-professionals-brainstorming-session': 'Team brainstorming at a table',
 'diverse-professionals-collaborating-modern-office': 'Meeting, seen from behind the speaker',
 'diverse-professionals-conference-meeting': 'Group standing at a conference',
 'draftsman-daydreaming-workplace': 'Looking up from a laptop, thinking',
 'entrepreneur-woman-modern-office': 'Smiling outside an office building',
 'female-student-college-campus-backpack-outdoor': 'Student on campus with backpack and books',
 'focused-asian-man-in-modern-spaceman-with-laptop-and-pencil': 'Writing notes beside a laptop',
 'graduation-hats-university-commencement': 'Graduation caps at commencement',
 'hands-writing-notebook-startup-planning': 'Hands writing in a notebook',
 'home-office-laptop-plants-paperwork': 'Empty desk with a laptop',
 'man-blazer-working-laptop-home': 'Working on a laptop on a sofa',
 'man-glasses-video-call-home': 'Waving on a video call',
 'man-tracking-finances-budget': 'Writing at a coffee table',
 'man-video-call-home-office': 'Waving on a video call at a desk',
 'mixed-ethnicity-woman-professional-workplace': 'Professional holding a tablet',
 'modern-school-building': 'Modern school building',
 'multiracial-graduates-college-garden': 'Graduates in caps and gowns outdoors',
 'person-taking-notes-video-call-home-desk': 'Taking notes on a video call, from above',
 'resume-on-table-office': 'Resumes on a desk',
 'smiling-black-male-designer-creative-office-startup': 'Smiling in a creative office',
 'smiling-male-graduate-student-campus-steps': 'Student on campus steps with notebooks',
 'student-backpack-books-outdoor': 'Student with backpack and books outdoors',
 'woman-blazer-writing-notes-cafe': 'Writing notes in a cafe',
 'woman-headphones-studying-laptop-desk': 'Studying with headphones at a desk',
 'woman-home-office-video-call-plants': 'Video call at a home desk',
 'woman-remote-work-sunny-home-office': 'Video call in a sunny home office',
 'woman-smiling-waving-video-call-laptop': 'Waving at a laptop',
 'woman-working-from-home-laptop': 'Laptop on a sofa, over the shoulder',
 'women-smiling-cafe-recruiter-meeting': 'Two people talking in a cafe',
 'young-business-team-startup-project': 'Two colleagues at a screen',
 'young-businesswoman-smartphone': 'Smiling at a phone at a table',
 'young-woman-working-from-home-on-laptop-studying': 'Working at a laptop by a window',
}
# never describe a person by race or ethnicity (or guess at gender) in titles or tags
BANNED = set('african american asian black white mixed ethnicity multiracial diverse latina latino hispanic caucasian male female man woman women men businesswoman'.split())
STOP = set('a an the at in on with of to and from by up'.split())
def words(s): return [w for w in re.findall(r'[a-z0-9]+', s.lower()) if w not in STOP and w not in BANNED]
def size(src):
    with Image.open(os.path.join(ROOT, src)) as im: return im.size
def photo(a):
    w, h = size(a['src']); a['w'], a['h'] = w, h; a['ratio'] = '%d/%d' % (w, h); return a

for a in A:
    if a['group'] == 'photo' and a['src'].startswith('assets/photos/'):
        stem = os.path.basename(a['src'])[:-4]
        a['title'] = TITLES[stem]
        tags = ['photo'] + words(a['title']) + words(stem)
        a['tags'] = list(dict.fromkeys(tags))
        photo(a)

have = {a['id'] for a in A}
def add(e, after_group):
    if e['id'] in have: 
        A[[a['id'] for a in A].index(e['id'])] = e; return
    idx = max(i for i, a in enumerate(A) if a['group'] == after_group) + 1
    A.insert(idx, e); have.add(e['id'])

NATURE = ['Clouds', 'Trees', 'Clay', 'Wheat', 'Water', 'Flowers']   # names from the chat interface guidelines
for n in NATURE:
    src = 'assets/brand/nature-%s.jpg' % n.lower()
    add(photo({'id': 'photo-nature-' + n.lower(), 'type': 'image', 'group': 'photo', 'title': n, 'src': src, 'thumb': src,
               'tags': ['photo', 'nature', 'motion', 'blur', 'grain', n.lower(), 'chat interface guidelines'], 'from': 'brand/chat-guidelines.html'}), 'photo')
BOARD = {1: 'Sky with clouds', 2: 'Climbing wide stairs in a yellow coat', 3: 'Looking up against a blue sky', 4: 'Mid-stride up city steps',
         5: 'Opening an envelope beside a laptop', 6: 'Crossing a city street', 7: 'Yellow walls and light', 8: 'Smiling, holding a phone, outdoors',
         9: 'Trees in motion', 10: 'Crowd on a crosswalk, in motion', 11: 'Portrait, smiling', 12: 'Portrait, smiling, checked shirt'}
for i, t in BOARD.items():
    src = 'assets/brand/board-%d.webp' % i
    add(photo({'id': 'photo-board-%d' % i, 'type': 'image', 'group': 'photo', 'title': t, 'src': src, 'thumb': src,
               'tags': list(dict.fromkeys(['photo', 'brand board', 'leland 2.0'] + words(t))), 'from': 'brand/board.html'}), 'photo')

for a in A:
    if a['group'] == 'graphic' and a['src'].startswith('assets/graphics/'):
        t = os.path.basename(a['src'])[:-4].replace('-', ' ').replace('coach ', 'expert ').replace(' main', '')
        a['title'] = t[0].upper() + t[1:]
        a['tags'] = list(dict.fromkeys(['graphic'] + words(t)))
GFX = [('gfx-lockup', 'Leland lockup', 'assets/brand/logo.svg', 0), ('gfx-lockup-white', 'Leland lockup, white', 'assets/brand/logo-white.svg', 1),
       ('gfx-mark', 'Leland mark', 'assets/brand/mark.svg', 0), ('gfx-mark-white', 'Leland mark, white', 'assets/brand/mark-white.svg', 1),
       ('gfx-expert-profile', 'Expert profile', 'assets/decks/frames/expert-profile.jpg', 0), ('gfx-intro-call', 'Intro call', 'assets/decks/frames/intro-call.jpg', 0),
       ('gfx-live-session', 'Live session', 'assets/decks/frames/live-session.jpg', 0), ('gfx-moments', 'Moments', 'assets/decks/frames/moments.jpg', 0)]
for id_, t, src, dark in GFX:
    e = {'id': id_, 'type': 'image', 'group': 'graphic', 'title': t, 'src': src, 'tags': list(dict.fromkeys(['graphic'] + words(t) + (['logo', 'brand'] if 'brand/' in src else ['product', 'ui'])))}
    if dark: e['dark'] = True
    add(e, 'graphic')

FONTS = [('SeasonMix-Medium', 'Season Mix Medium', 'Season Mix', 500, 0), ('Macan-Book', 'Macan Book', 'Macan', 400, 0), ('Macan-Medium', 'Macan Medium', 'Macan', 500, 0), ('Macan-SemiBold', 'Macan SemiBold', 'Macan', 600, 0),
         ('Macan-Book-Q', 'Macan Book, plain question mark', 'Macan', 400, 1), ('Macan-Medium-Q', 'Macan Medium, plain question mark', 'Macan', 500, 1), ('Macan-SemiBold-Q', 'Macan SemiBold, plain question mark', 'Macan', 600, 1)]
if not any(a['group'] == 'font' for a in A): A.append({'id': 'font-' + FONTS[0][0], 'type': 'font', 'group': 'font', 'title': '', 'src': ''}); have.add('font-' + FONTS[0][0])
for f, t, fam, wt, q in FONTS:
    e = {'id': 'font-' + f, 'type': 'font', 'group': 'font', 'title': t, 'src': 'fonts/%s.woff2' % f, 'family': fam, 'weight': wt, 'tags': ['font', 'type'] + words(t)}
    if q: e['plainQuestionMark'] = True
    add(e, 'font')
leo = {'id': 'pack-leo', 'type': 'pack', 'group': 'pack', 'title': 'Leo, the animated face', 'src': 'assets/leo/leo-pack.zip', 'preview': 'assets/leo/leo.html',
       'files': ['assets/leo/leo.html', 'assets/leo/leo.js', 'assets/leo/leo.svg'], 'tags': ['leo', 'face', 'animated', 'logo', 'pack']}
if 'pack-leo' in have: add(leo, 'pack')
else: A.append(leo)
json.dump(m, open(P, 'w'), indent=1)
import collections
print(collections.Counter(a['group'] for a in A))
