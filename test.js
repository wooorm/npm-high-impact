import assert from 'node:assert/strict'
import test from 'node:test'
import {npmHighImpact, npmTopDependents, npmTopDownloads} from 'npm-high-impact'

test('npmHighImpact', function () {
  assert.ok(Array.isArray(npmHighImpact), 'should be a list')
  assert.ok(
    npmHighImpact.includes('supports-color'),
    'should include pop packages'
  )
})

test('npmTopDependents', function () {
  assert.ok(Array.isArray(npmTopDependents), 'should be a list')
  assert.ok(
    npmTopDependents.includes('typescript'),
    'should include pop packages'
  )
})

test('npmTopDownloads', function () {
  assert.ok(Array.isArray(npmTopDownloads), 'should be a list')
  assert.ok(
    npmTopDownloads.includes('supports-color'),
    'should include pop packages'
  )
})
