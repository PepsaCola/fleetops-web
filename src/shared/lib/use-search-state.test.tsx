import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { renderWithProviders } from './test'
import { useSearchState } from './use-search-state'

const schema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  status: z.enum(['active', 'inactive']).optional().catch(undefined),
})

function SearchStateProbe() {
  const [search, setSearch] = useSearchState(schema)

  return (
    <>
      <output>{JSON.stringify(search)}</output>
      <button onClick={() => setSearch({ page: 3 })}>Page 3</button>
      <button onClick={() => setSearch({ page: 1, status: 'inactive' })}>Inactive</button>
    </>
  )
}

describe('useSearchState', () => {
  it('reads typed values from the URL', () => {
    renderWithProviders(<SearchStateProbe />, { url: '/?page=2&status=active' })

    expect(screen.getByRole('status')).toHaveTextContent('{"page":2,"status":"active"}')
  })

  it('falls back to the defaults for values it cannot read', () => {
    renderWithProviders(<SearchStateProbe />, { url: '/?page=-4&status=flying' })

    expect(screen.getByRole('status')).toHaveTextContent('{"page":1}')
  })

  it('writes changes to the URL and keeps other parameters', async () => {
    const user = userEvent.setup()
    const { router } = renderWithProviders(<SearchStateProbe />, { url: '/?ref=mail' })

    await user.click(screen.getByRole('button', { name: 'Page 3' }))

    expect(router.state.location.search).toBe('?ref=mail&page=3')
    expect(screen.getByRole('status')).toHaveTextContent('{"page":3}')
  })

  it('leaves values equal to their default out of the URL', async () => {
    const user = userEvent.setup()
    const { router } = renderWithProviders(<SearchStateProbe />, { url: '/?page=3' })

    await user.click(screen.getByRole('button', { name: 'Inactive' }))

    expect(router.state.location.search).toBe('?status=inactive')
  })
})
