import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('build_views', ROOT / 'scripts/build_views.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)

class BuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.public, cls.author = builder.build()

    def test_default_workspace_is_full_author_mode(self):
        self.assertEqual(self.public['audience'], 'author')
        self.assertEqual(self.public, self.author)
        for key in ['episodePlan','characters','chapterReviews','research','outlineReview']:
            self.assertIn(key, self.public)

    def test_author_plan_is_complete(self):
        self.assertEqual(len(self.author['parts']), 11)
        self.assertEqual(self.author['parts'][0]['label'], '1부')
        self.assertEqual(self.author['parts'][-2]['label'], '10부')
        self.assertEqual(self.author['parts'][-1]['label'], '에필로그')
        self.assertTrue(all(p['check'] and p['question'] for p in self.author['parts']))
        self.assertTrue(all(p['source'] for p in self.author['research']))

    def test_revision_replaces_old_character_origin(self):
        self.assertEqual(self.author['version'], '39화 집필안')
        self.assertIn('농민의 둘째 아들', self.public['characters'][0]['summary'])
        self.assertNotIn('견습공', self.public['characters'][0]['summary'])
        self.assertIn('허락 없이', self.author['research'][0]['note'])
        self.assertEqual(self.public['title'], '원문')

    def test_39_episode_plan_and_character_settings(self):
        episodes = self.author['episodePlan']
        self.assertEqual([e['number'] for e in episodes], list(range(1,40)))
        self.assertEqual([e['number'] for e in episodes if e['part']==1], list(range(1,7)))
        self.assertEqual(episodes[-1]['title'], '원문')
        self.assertEqual(episodes[11]['title'], '제목')
        self.assertTrue(all(p['settings'] for p in self.author['characters']))
        self.assertTrue(self.author['outlineReview']['issues'])

    def test_editorial_suggestions_are_separate(self):
        self.assertTrue(self.author['developmentReview'])
        self.assertIn('developmentReview', self.public)
        self.assertIn('research', self.public)
        self.assertTrue(all(item['decision'] for item in self.author['developmentReview']))

    def test_legacy_and_default_workspace_outputs_match(self):
        public = json.loads((ROOT/'site/data/project.json').read_text(encoding='utf-8'))
        author = json.loads((ROOT/'author-site/data/project.json').read_text(encoding='utf-8'))
        self.assertEqual(public, author)
        self.assertIn('parts', author)
        self.assertEqual(author['audience'], 'author')

    def test_plans_do_not_create_fake_manuscripts(self):
        self.assertEqual(len(self.public['manuscripts']), 11)
        self.assertEqual(self.author['episodePlan'][0]['status'], '등록 원고 있음')
        self.assertTrue(all(e['status']=='계획' for e in self.author['episodePlan'][11:]))

    def test_requested_chapter_two_edits_and_chapter_three(self):
        chapters = {c['id']:c for c in self.public['manuscripts']}
        self.assertIn('그걸 네 번째 질문으로 치지.', chapters['002-four']['text'])
        self.assertIn('면벌은 죄를 덜어준다.', chapters['002-four']['text'])
        self.assertIn('면벌은 벌을 덜어준다.', chapters['002-four']['text'])
        source = (ROOT/'manuscripts/current/003-chest.md').read_text(encoding='utf-8').strip()
        self.assertEqual(chapters['003-chest']['text'], '\n'.join(source.splitlines()[1:]).strip())
        source_four = (ROOT/'manuscripts/current/004-cow.md').read_text(encoding='utf-8').strip()
        self.assertEqual(chapters['004-cow']['text'], '\n'.join(source_four.splitlines()[1:]).strip())
        for manuscript in chapters.values():
            source = (ROOT/'manuscripts/current'/f"{manuscript['id']}.md").read_text(encoding='utf-8').strip()
            self.assertEqual(manuscript['text'], '\n'.join(source.splitlines()[1:]).strip())
        self.assertEqual({r['id'] for r in self.author['chapterReviews']}, set(chapters))

    def test_chapter_text_matches_source_and_review_has_evidence(self):
        source = (ROOT/'manuscripts/current/001-why.md').read_text(encoding='utf-8').strip()
        chapter = next(c for c in self.public['manuscripts'] if c['id'] == '001-why')
        self.assertEqual(chapter['text'], '\n'.join(source.splitlines()[1:]).strip())
        self.assertEqual(chapter['title'], '1화. 왜?')
        self.assertIn('신자의 삶 전체가 회개여야 한다.', chapter['text'])
        self.assertIn('**1.**', chapter['text'])
        self.assertNotIn('1. 교황도 틀릴 수 있다.', chapter['text'])
        self.assertEqual(len(self.public['manuscripts']), 11)
        self.assertIn('chapterReviews', self.public)
        self.assertIn('manuscriptFacts', self.public)
        self.assertIn('thesisLinks', self.public)
        review = self.author['chapterReviews'][0]
        self.assertEqual(review['id'], chapter['id'])
        self.assertTrue(all(item['evidence'] for item in review['categories']))
        chapters = {f'{i+1}화': ch['text'] for i,ch in enumerate(self.public['manuscripts'])}
        for item in self.author['manuscriptFacts']:
            self.assertIn(item['evidence'], chapters[item['chapter']])
        for motif in self.author['motifs']:
            for evidence in motif.get('verify', []):
                self.assertIn(evidence['quote'], chapters[evidence['chapter']])

if __name__ == '__main__':
    unittest.main()
