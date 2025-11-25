import { describe, it, expect, beforeEach } from 'vitest'
import { getQueryClient, queryKeys } from '@/lib/queryClient'
import { QueryClient } from '@tanstack/react-query'

describe('queryClient', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = getQueryClient()
  })

  it('should return a QueryClient instance', () => {
    expect(queryClient).toBeInstanceOf(QueryClient)
  })

  it('should have default staleTime configured', () => {
    const defaultOptions = queryClient.getDefaultOptions()
    expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 5) // 5 minutes
  })

  it('should have default gcTime configured', () => {
    const defaultOptions = queryClient.getDefaultOptions()
    expect(defaultOptions.queries?.gcTime).toBe(1000 * 60 * 10) // 10 minutes
  })

  it('should have retry configured', () => {
    const defaultOptions = queryClient.getDefaultOptions()
    expect(defaultOptions.queries?.retry).toBe(3)
  })

  it('should have refetchOnWindowFocus disabled', () => {
    const defaultOptions = queryClient.getDefaultOptions()
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false)
  })

  it('should have mutations retry disabled', () => {
    const defaultOptions = queryClient.getDefaultOptions()
    expect(defaultOptions.mutations?.retry).toBe(0)
  })
})

describe('queryKeys', () => {
  it('should have auth query keys', () => {
    expect(queryKeys.auth.user).toEqual(['auth', 'user'])
  })

  it('should have accounts query keys', () => {
    expect(queryKeys.accounts.all).toEqual(['accounts'])
    expect(queryKeys.accounts.lists()).toEqual(['accounts', 'list'])
    expect(queryKeys.accounts.detail('123')).toEqual(['accounts', 'detail', '123'])
  })

  it('should have transactions query keys', () => {
    expect(queryKeys.transactions.all).toEqual(['transactions'])
    expect(queryKeys.transactions.lists()).toEqual(['transactions', 'list'])
    expect(queryKeys.transactions.detail('456')).toEqual(['transactions', 'detail', '456'])
  })

  it('should have budgets query keys', () => {
    expect(queryKeys.budgets.all).toEqual(['budgets'])
    expect(queryKeys.budgets.lists()).toEqual(['budgets', 'list'])
  })

  it('should have goals query keys', () => {
    expect(queryKeys.goals.all).toEqual(['goals'])
    expect(queryKeys.goals.lists()).toEqual(['goals', 'list'])
  })

  it('should have bills query keys', () => {
    expect(queryKeys.bills.all).toEqual(['bills'])
    expect(queryKeys.bills.upcoming()).toEqual(['bills', 'upcoming'])
  })

  it('should have categories query keys', () => {
    expect(queryKeys.categories.all).toEqual(['categories'])
    expect(queryKeys.categories.lists()).toEqual(['categories', 'list'])
  })

  it('should have analytics query keys', () => {
    expect(queryKeys.analytics.all).toEqual(['analytics'])
  })

  it('should have reports query keys', () => {
    expect(queryKeys.reports.all).toEqual(['reports'])
  })

  it('should have notifications query keys', () => {
    expect(queryKeys.notifications.all).toEqual(['notifications'])
    expect(queryKeys.notifications.unreadCount()).toEqual(['notifications', 'unread-count'])
  })
})
