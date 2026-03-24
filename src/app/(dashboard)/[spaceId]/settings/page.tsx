"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getSpace,
  updateSpace,
  getSpaceMembers,
  addSpaceMember,
  updateSpaceMember,
  removeSpaceMember,
  type Space,
  type SpaceMemberInfo,
} from "@/lib/actions/spaces";
import { getOrgMembers, type OrgMember } from "@/lib/actions/members";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import type { SpaceDefaultRole } from "@/lib/constants";

export default function SpaceSettingsPage() {
  const params = useParams<{ spaceId: string }>();
  const router = useRouter();
  const [space, setSpace] = useState<Space | null>(null);
  const [members, setMembers] = useState<SpaceMemberInfo[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [defaultRole, setDefaultRole] = useState<SpaceDefaultRole>("viewer");

  // Add member dialog
  const [showAddMember, setShowAddMember] = useState(false);
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState<"admin" | "editor" | "viewer">("editor");

  useEffect(() => {
    async function load() {
      const [s, m, om] = await Promise.all([
        getSpace(params.spaceId),
        getSpaceMembers(params.spaceId),
        getOrgMembers(),
      ]);
      setSpace(s);
      setMembers(m);
      setOrgMembers(om);
      if (s) {
        setName(s.name);
        setDescription(s.description || "");
        setIcon(s.icon || "");
        setDefaultRole(s.defaultRole);
      }
      setLoading(false);
    }
    load();
  }, [params.spaceId]);

  async function handleSave() {
    setSaving(true);
    const result = await updateSpace(params.spaceId, {
      name: name.trim(),
      description: description.trim() || null,
      icon: icon.trim() || null,
      defaultRole,
    });

    if (result.success) {
      toast.success("Space settings saved");
    } else {
      toast.error(result.error || "Failed to save");
    }
    setSaving(false);
  }

  async function handleAddMember() {
    if (!addUserId) return;
    const result = await addSpaceMember(params.spaceId, addUserId, addRole);
    if (result.success) {
      toast.success("Member added");
      setShowAddMember(false);
      const m = await getSpaceMembers(params.spaceId);
      setMembers(m);
    } else {
      toast.error(result.error || "Failed to add member");
    }
  }

  async function handleUpdateRole(userId: string, role: "admin" | "editor" | "viewer") {
    const result = await updateSpaceMember(params.spaceId, userId, role);
    if (result.success) {
      toast.success("Role updated");
      const m = await getSpaceMembers(params.spaceId);
      setMembers(m);
    } else {
      toast.error(result.error || "Failed to update role");
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm("Remove this member from the space?")) return;
    const result = await removeSpaceMember(params.spaceId, userId);
    if (result.success) {
      toast.success("Member removed");
      const m = await getSpaceMembers(params.spaceId);
      setMembers(m);
    } else {
      toast.error(result.error || "Failed to remove member");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Space not found</p>
      </div>
    );
  }

  // Filter org members not already space members
  const availableOrgMembers = orgMembers.filter(
    (om) => !members.some((m) => m.userId === om.userId)
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/${params.spaceId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Space settings</h1>
      </div>

      {/* General settings */}
      <div className="space-y-4 rounded-lg border p-4">
        <h2 className="text-lg font-semibold">General</h2>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <div className="flex gap-2">
              <Input
                className="w-16 text-center text-lg"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
                placeholder="📁"
              />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this space for?"
            />
          </div>
          <div className="grid gap-2">
            <Label>Default permission for org members</Label>
            <Select
              value={defaultRole}
              onValueChange={(v) => setDefaultRole(v as SpaceDefaultRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="none">None (invite only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Space members */}
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Members</h2>
          <Button size="sm" onClick={() => setShowAddMember(true)}>
            <Plus className="h-4 w-4" />
            Add member
          </Button>
        </div>

        {members.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Space role</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">
                          {(m.fullName || m.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{m.fullName || m.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={m.role}
                      onValueChange={(v) =>
                        handleUpdateRole(m.userId, v as "admin" | "editor" | "viewer")
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(m.userId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            No specific space members. Org members use the default role above.
          </p>
        )}
      </div>

      {/* Add member dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add space member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Organization member</Label>
              <Select value={addUserId} onValueChange={(v) => setAddUserId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {availableOrgMembers.map((om) => (
                    <SelectItem key={om.userId} value={om.userId}>
                      {om.fullName || om.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Space role</Label>
              <Select
                value={addRole}
                onValueChange={(v) => setAddRole(v as typeof addRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!addUserId}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
