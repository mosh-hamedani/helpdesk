import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import UserForm from "./UserForm";
import UsersTable from "./UsersTable";

interface EditingUser {
  id: string;
  name: string;
  email: string;
}

interface DeletingUser {
  id: string;
  name: string;
}

type DialogState = { mode: "create" } | { mode: "edit"; user: EditingUser } | null;

export default function UsersPage() {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [deletingUser, setDeletingUser] = useState<DeletingUser | null>(null);
  const queryClient = useQueryClient();

  const close = () => setDialog(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeletingUser(null);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>
      <UsersTable
        onEdit={(user) => setDialog({ mode: "edit", user })}
        onDelete={(user) => setDeletingUser(user)}
      />
      <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) close(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === "edit" ? "Edit User" : "Create User"}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            key={dialog?.mode === "edit" ? dialog.user.id : "create"}
            user={dialog?.mode === "edit" ? dialog.user : undefined}
            onSuccess={close}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={deletingUser !== null} onOpenChange={(open) => { if (!open) { setDeletingUser(null); deleteMutation.reset(); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingUser?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to delete user</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
