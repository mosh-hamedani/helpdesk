import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "core/schemas/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface CreateUserFormProps {
  onSuccess: () => void;
}

export default function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const createUser = useMutation({
    mutationFn: async (payload: CreateUserInput) => {
      const { data } = await axios.post("/api/users", payload);
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      form.reset();
      createUser.reset();
      onSuccess();
    },
  });

  const serverError =
    createUser.error && axios.isAxiosError(createUser.error)
      ? createUser.error.response?.data?.error ?? "Failed to create user"
      : createUser.error
        ? "Failed to create user"
        : null;

  return (
    <form
      onSubmit={form.handleSubmit((data) => createUser.mutate(data))}
      className="space-y-4"
      autoComplete="off"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Full name"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          autoComplete="off"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={createUser.isPending}>
          {createUser.isPending ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}
