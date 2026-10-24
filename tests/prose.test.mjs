import test from 'node:test';
import assert from 'node:assert/strict';
import {renderProse} from '../site/prose.mjs';

test('manuscript emphasis, scene break and quoted memo are rendered', () => {
  const html = renderProse('**Martin Luther.**\n\n*\n\n> 1. 교황도 틀릴 수 있다.');
  assert.match(html, /<strong>Martin Luther\.<\/strong>/);
  assert.match(html, /role="separator"/);
  assert.match(html, /<blockquote>1\. 교황도 틀릴 수 있다\.<\/blockquote>/);
});

test('manuscript markup cannot execute HTML', () => {
  const html = renderProse('**<script>alert(1)</script>**');
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;script&gt;/);
});
