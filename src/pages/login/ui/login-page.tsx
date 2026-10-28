import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TruckIcon } from 'lucide-react'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'

import { sessionQueries } from '@/entities/session'
import { getErrorMessage, login } from '@/shared/api'
import { APP_NAME } from '@/shared/config'
import { useDocumentTitle } from '@/shared/lib/use-document-title'
import { afterLoginPath } from '@/shared/routes'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

import { DEMO_ACCOUNTS } from '../config/demo-accounts'

const CredentialsSchema = z.object({
  email: z.email('Enter your email'),
  password: z.string().min(1, 'Enter your password'),
})

type Credentials = z.infer<typeof CredentialsSchema>

export function LoginPage() {
  useDocumentTitle('Sign in')
  const id = useId()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Credentials>({
    resolver: zodResolver(CredentialsSchema),
    defaultValues: { email: '', password: '' },
  })

  const signIn = useMutation({
    mutationFn: (credentials: Credentials) => login({ body: credentials }),
    onSuccess: async (user) => {
      // Nothing fetched for whoever was signed in before carries over
      queryClient.clear()
      queryClient.setQueryData(sessionQueries.me().queryKey, user)
      await navigate(afterLoginPath(params.get('next')), { replace: true })
    },
  })

  return (
    <main className="grid min-h-full place-items-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TruckIcon className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold">{APP_NAME}</h1>
            <p className="text-sm text-muted-foreground">Fleet operations</p>
          </div>
        </div>

        <section aria-labelledby={`${id}-demo`} className="space-y-3">
          <h2 id={`${id}-demo`} className="text-sm font-medium">
            Try the demo
          </h2>
          <div className="grid gap-2">
            {DEMO_ACCOUNTS.map((account, index) => (
              <Button
                key={account.email}
                variant={index === 0 ? 'default' : 'outline'}
                className="h-auto flex-col items-start gap-0.5 py-2 text-left"
                disabled={signIn.isPending}
                onClick={() => signIn.mutate({ email: account.email, password: account.password })}
              >
                <span>Sign in as {account.role}</span>
                <span className="text-xs font-normal whitespace-normal opacity-80">
                  {account.description}
                </span>
              </Button>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or with an email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form
          noValidate
          className="space-y-4"
          onSubmit={handleSubmit((values) => signIn.mutate(values))}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-email`} className="text-sm font-medium">
              Email
            </label>
            <Input
              id={`${id}-email`}
              type="email"
              autoComplete="username"
              aria-invalid={errors.email ? true : undefined}
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-password`} className="text-sm font-medium">
              Password
            </label>
            <Input
              id={`${id}-password`}
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? true : undefined}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {signIn.isError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {getErrorMessage(signIn.error)}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={signIn.isPending}>
            {signIn.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </main>
  )
}
