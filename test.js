import assert from 'node:assert/strict'
import test from 'node:test'
import {npmHighImpact, npmTopDependents, npmTopDownloads} from './index.js'

test('npmHighImpact', function () {
  assert(Array.isArray(npmHighImpact), 'should be a list')
  assert(
    npmHighImpact.includes('supports-color'),
    'should include pop packages'
  )
})

test('npmTopDependents', function () {
  assert(Array.isArray(npmTopDependents), 'should be a list')
  assert(npmTopDependents.includes('typescript'), 'should include pop packages')
})

test('npmTopDownloads', function () {
  assert(Array.isArray(npmTopDownloads), 'should be a list')
  assert(
    npmTopDownloads.includes('supports-color'),
    'should include pop packages'
  )
})
