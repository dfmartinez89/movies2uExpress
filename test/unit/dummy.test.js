const assert = require('node:assert/strict')
const { describe, it, mock } = require('node:test')

describe('Assertions', () => {
  it('returns name', () => {
    const person = {
      name () {
        return 'Joe'
      }
    }
    // the real behavior
    assert.equal(person.name(), 'Joe')
    // mock the method "person.name"
    mock.method(person, 'name', () => 'Anna')
    assert.equal(person.name(), 'Anna')
    // confirm the method calls
    assert.equal(person.name.mock.calls.length, 1)
    // restore the original method
    person.name.mock.restore()
    assert.equal(person.name(), 'Joe')
  })
})
