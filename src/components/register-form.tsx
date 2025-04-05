"use client";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useForm, type AnyFieldApi } from "@tanstack/react-form";
import { EMAIL_SCHEMA, PASSWORD_SCHEMA } from "~/lib/global-zod-schemas";
import { api } from "~/trpc/react";

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched &&
      field.state.value !== "" &&
      field.state.meta.errors.length ? (
        <ol
          className="list-inside list-disc text-red-400 italic"
          dangerouslySetInnerHTML={{
            __html: field.state.meta.errors.join(""),
          }}
        ></ol>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        email: value.email,
        password: value.password,
      });
    },
  });

  const mutation = api.login.signIn.useMutation({
    onSuccess: async (res) => {
      if (res instanceof Error) {
        alert(res.message);
        return;
      }
      sessionStorage.setItem("jwt", res.jwt);
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await form.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-6">
              <form.Field
                name="email"
                validators={{
                  onChange: (f) => {
                    const res = EMAIL_SCHEMA.safeParse(f.value);
                    return res.success
                      ? undefined
                      : (
                          JSON.parse(res.error.message) as {
                            message: string;
                          }[]
                        ).map(({ message }) => `<li>${message}</li>`);
                  },
                }}
              >
                {(field) => {
                  return (
                    <div className="grid gap-3">
                      <Label htmlFor={field.name}>Email</Label>
                      <Input
                        id={field.name}
                        type="email"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="max@mutermann.at"
                        required
                      />
                      <FieldInfo field={field} />
                    </div>
                  );
                }}
              </form.Field>

              <div className="grid gap-3">
                <form.Field
                  name="password"
                  validators={{
                    onChange: (f) => {
                      const res = PASSWORD_SCHEMA.safeParse(f.value);
                      return res.success
                        ? undefined
                        : (
                            JSON.parse(res.error.message) as {
                              message: string;
                            }[]
                          ).map(({ message }) => `<li>${message}</li>`);
                    },
                  }}
                >
                  {(field) => {
                    return (
                      <>
                        <Label htmlFor={field.name}>Password</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          required
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldInfo field={field} />
                      </>
                    );
                  }}
                </form.Field>
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
