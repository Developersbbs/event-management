"use client"

import { useActionState } from "react"
import { GalleryVerticalEnd, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { login } from "@/app/login/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"

const initialState = {
  success: false,
  error: ""
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, action, isPending] = useActionState(login, initialState)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form action={action}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md text-primary">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Pongal Vizha.</span>
            </div>
            <h1 className="text-xl font-bold">Admin Login</h1>
          </div>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              name="password"
              placeholder="Enter password"
              required
            />
          </Field>

          {state?.error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <Field>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Login"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
