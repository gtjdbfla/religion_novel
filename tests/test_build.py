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
        self.assertEqual(len(self.author['parts']), 10)
        self.assertEqual(self.author['parts'][-1]['label'], '에필로그')
        self.assertTrue(all(p['check'] and p['question'] for p in self.author['parts']))
        self.assertTrue(all(p['source'] for p in self.author['research']))

    def test_output_is_separate(self):
        public = json.loads((ROOT/'site/data/project.json').read_text(encoding='utf-8'))
        author = json.loads((ROOT/'author-site/data/project.json').read_text(encoding='utf-8'))
        self.assertNotIn('parts', public)
        self.assertIn('parts', author)
        self.assertEqual(author['audience'], 'author')

if __name__ == '__main__':
    unittest.main()
