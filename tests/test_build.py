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

    def test_public_has_no_story_spoilers(self):
        self.assertEqual(set(self.public), {'title','audience','premise','characters','manuscripts'})
        self.assertEqual(self.public['audience'], 'reader')
        serialized = json.dumps(self.public, ensure_ascii=False)
        for secret in ['선생님이 시작한 겁니까?', '정정하지 않는 침묵', '요한과 루터의 결별']:
            self.assertNotIn(secret, serialized)

    def test_author_plan_is_complete(self):
        self.assertEqual(len(self.author['parts']), 12)
        self.assertEqual(self.author['parts'][0]['label'], '프롤로그')
        self.assertEqual(self.author['parts'][-2]['label'], '10부')
        self.assertEqual(self.author['parts'][-1]['label'], '에필로그')
        self.assertTrue(all(p['check'] and p['question'] for p in self.author['parts']))
        self.assertTrue(all(p['source'] for p in self.author['research']))

    def test_revision_replaces_old_character_origin(self):
        self.assertEqual(self.author['version'], '4.0')
        self.assertIn('농민의 둘째 아들', self.public['characters'][0]['summary'])
        self.assertNotIn('견습공', self.public['characters'][0]['summary'])
        self.assertIn('허락 없이', self.author['research'][0]['note'])
        self.assertEqual(self.public['title'], '원문')

    def test_v4_resolutions_are_applied(self):
        parts = {item['label']: item for item in self.author['parts']}
        self.assertIn('고백한다', parts['7부']['event'])
        self.assertIn('일자리를 잃는다', parts['8부']['event'])
        self.assertIn('자네는?', parts['10부']['event'])
        self.assertIn('알고 있는 사실을 말해준다', parts['에필로그']['event'])
        self.assertTrue(self.author['resolvedReview'])
        self.assertTrue(any(item['kind'] == '연대 충돌' for item in self.author['research']))

    def test_editorial_suggestions_are_separate(self):
        self.assertTrue(self.author['developmentReview'])
        self.assertNotIn('developmentReview', self.public)
        self.assertNotIn('research', self.public)
        self.assertTrue(all(item['decision'] for item in self.author['developmentReview']))

    def test_output_is_separate(self):
        public = json.loads((ROOT/'site/data/project.json').read_text(encoding='utf-8'))
        author = json.loads((ROOT/'author-site/data/project.json').read_text(encoding='utf-8'))
        self.assertNotIn('parts', public)
        self.assertIn('parts', author)
        self.assertEqual(author['audience'], 'author')

if __name__ == '__main__':
    unittest.main()
