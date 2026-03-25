"use client";

import { useEffect, useState } from "react";
import {
  getOrgMembers,
  getPendingInvitations,
  inviteMember,
  updateMemberRole,
  removeMember,
  transferOwnership,
  revokeInvitation,
  type OrgMember,
  type PendingInvitation,
} from "@/lib/actions/members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserPlus, MoreHorizontal, Shield, Trash2, ArrowRightLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MembersPage() {
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer" | "admin">("editor");
  const [inviting, setInviting] = useState(false);

  async function loadData() {
    const [m, i] = await Promise.all([getOrgMembers(), getPendingInvitations()]);
    setMembers(m);
    setInvitations(i);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);

    const result = await inviteMember(inviteEmail, inviteRole);
    if (result.success) {
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      loadData();
    } else {
      toast.error(result.error || "Failed to send invitation");
    }

    setInviting(false);
  }

  async function handleUpdateRole(userId: string, newRole: "admin" | "editor" | "viewer") {
    const result = await updateMemberRole(userId, newRole);
    if (result.success) {
      toast.success("Role updated");
      loadData();
    } else {
      toast.error(result.error || "Failed to update role");
    }
  }

  async function handleRemove(userId: string, name: string) {
    if (!confirm(`Remove ${name} from this organization?`)) return;

    const result = await removeMember(userId);
    if (result.success) {
      toast.success("Member removed");
      loadData();
    } else {
      toast.error(result.error || "Failed to remove member");
    }
  }

  async function handleTransferOwnership(userId: string, name: string) {
    if (!confirm(`Transfer ownership to ${name}? You will become an admin.`)) return;

    const result = await transferOwnership(userId);
    if (result.success) {
      toast.success("Ownership transferred");
      loadData();
    } else {
      toast.error(result.error || "Failed to transfer ownership");
    }
  }

  async function handleRevokeInvitation(invitationId: string) {
    const result = await revokeInvitation(invitationId);
    if (result.success) {
      toast.success("Invitation revoked");
      loadData();
    } else {
      toast.error(result.error || "Failed to revoke invitation");
    }
  }

  const roleBadgeClass = (role: string) => {
    switch (role) {
      case "owner": return "badge-owner";
      case "admin": return "badge-admin";
      case "editor": return "badge-editor";
      default: return "badge-viewer";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage who has access to this organization
          </p>
        </div>

        <Dialog>
          <DialogTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80">
            <UserPlus className="h-4 w-4" />
            Invite member
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a new member</DialogTitle>
              <DialogDescription>
                Send an invitation by email. They&apos;ll receive a link to join.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="invite-email">Email address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer — can read documents</SelectItem>
                    <SelectItem value="editor">Editor — can create and edit</SelectItem>
                    <SelectItem value="admin">Admin — can manage members and settings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted">
                  Cancel
                </DialogClose>
                <Button type="submit" disabled={inviting}>
                  {inviting ? "Sending..." : "Send invitation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-sidebar text-xs font-semibold text-sidebar-foreground">
                      {(member.fullName || member.email)
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {member.fullName || member.email}
                      </p>
                      {member.fullName && (
                        <p className="font-mono text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${roleBadgeClass(member.role)}`}>
                    {member.role}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateRole(
                              member.userId,
                              member.role === "admin" ? "editor" : "admin"
                            )
                          }
                        >
                          <Shield className="h-4 w-4" />
                          {member.role === "admin"
                            ? "Demote to editor"
                            : "Promote to admin"}
                        </DropdownMenuItem>
                        {member.role === "admin" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleTransferOwnership(
                                member.userId,
                                member.fullName || member.email
                              )
                            }
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                            Transfer ownership
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            handleRemove(
                              member.userId,
                              member.fullName || member.email
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Pending invitations</h2>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-sm">{inv.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{inv.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRevokeInvitation(inv.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
