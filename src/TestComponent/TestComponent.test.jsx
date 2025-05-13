import React from 'react'

import { render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import TestComponent from './TestComponent'

describe('TestComponent', () => {
  test('renders', () => {
    const { getByText } = render(<TestComponent />)
    expect(getByText('Test Component')).toBeTruthy()
  })
})
