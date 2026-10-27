import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { SearchInput } from './search-input'

const DELAY = 50

/** Feeds every reported value straight back in, the way the URL does on a list page. */
function EchoingSearch() {
  const [value, setValue] = useState('')
  return <SearchInput aria-label="Search" value={value} onValueChange={setValue} delay={DELAY} />
}

describe('SearchInput', () => {
  it('reports the text once the user pauses typing', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: string) => void>()
    render(<SearchInput aria-label="Search" value="" onValueChange={onValueChange} delay={DELAY} />)

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'volvo')

    await vi.waitFor(() => expect(onValueChange).toHaveBeenCalledWith('volvo'))
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it('shows a value changed from outside, e.g. by a Reset button', () => {
    const onValueChange = vi.fn<(value: string) => void>()
    const { rerender } = render(
      <SearchInput aria-label="Search" value="volvo" onValueChange={onValueChange} delay={DELAY} />,
    )

    rerender(
      <SearchInput aria-label="Search" value="" onValueChange={onValueChange} delay={DELAY} />,
    )

    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('keeps what the user typed after the last reported value', async () => {
    const user = userEvent.setup()
    render(<EchoingSearch />)
    const input = screen.getByRole('searchbox', { name: 'Search' })

    await user.type(input, 'vol')
    await new Promise((resolve) => setTimeout(resolve, DELAY * 3))
    await user.type(input, 'vo')

    expect(input).toHaveValue('volvo')
  })
})
