"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../components/layouts/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import api, { ApiResponse } from "../../../lib/axios";
import { Plus, Trash2, Users, Loader2, Play, Share2 } from "lucide-react";
import { toast } from "../../../components/ui/toast";

type Group = {
  _id: string;
  name: string;
  members?: unknown[];
  activeSession?: unknown;
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === "object" && err !== null && "friendlyMessage" in err) {
    const friendlyMessage = (err as { friendlyMessage?: unknown }).friendlyMessage;
    if (typeof friendlyMessage === "string") return friendlyMessage;
  }

  return fallback;
};

export default function LeaderGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<Group[]>>("/groups/leader");
      setGroups(response.data.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load groups"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchGroups();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchGroups]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      setCreating(true);
      await api.post("/groups", { name: newGroupName });
      setNewGroupName("");
      await fetchGroups(); // Refresh list
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create group"));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group? All students will be unassigned.")) return;

    try {
      setDeletingId(id);
      await api.delete(`/groups/${id}`);
      setGroups((currentGroups) => currentGroups.filter((g) => g._id !== id));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete group"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Manage Groups</h1>
          <p className="text-slate-400 mt-1">Create teams and manage student rosters.</p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Group Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Create New Group</CardTitle>
                <CardDescription>Start a new practice roster.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <Input
                    label="Group Name"
                    placeholder="e.g. Advanced Typists Alpha"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full" isLoading={creating} disabled={!newGroupName.trim()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Group
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Groups List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Active Groups</CardTitle>
                <CardDescription>View members and manage your existing groups.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                  </div>
                ) : groups.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg">
                    <Users className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-300">No groups yet</h3>
                    <p className="text-sm text-slate-500 mt-1">Create your first group to start practicing.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-md border border-panel-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Group Name</TableHead>
                          <TableHead>Members</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groups.map((group) => (
                          <TableRow key={group._id}>
                            <TableCell className="font-medium text-white">{group.name}</TableCell>
                            <TableCell>{group.members?.length || 0} students</TableCell>
                            <TableCell>
                              {group.activeSession ? (
                                <Badge variant="success">Session Live</Badge>
                              ) : (
                                <Badge variant="secondary">Idle</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {!group.activeSession && (
                                <Button href={`/leader/sessions?groupId=${group._id}`} variant="outline" size="sm" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
                                  <Play className="h-4 w-4 mr-1" /> Start
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-brand/10 text-brand-light border-brand/20 hover:bg-brand-light/20"
                                onClick={async () => {
                                  const link = `${window.location.origin}/join/${group._id}`;
                                  await navigator.clipboard.writeText(link);
                                  toast("Team invite link copied successfully!");
                                }}
                              >
                                <Share2 className="h-4 w-4 mr-1" /> Link
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteGroup(group._id)}
                                isLoading={deletingId === group._id}
                                disabled={deletingId !== null}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
