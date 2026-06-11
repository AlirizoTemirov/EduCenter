import { Group } from "@/types";
import { create } from "zustand";

interface GroupStore {
  name: string;
  coursId: string;
  teachersId: string;
  status: boolean;
  search: string;
  isLoading: boolean;
  isEditMode: boolean;
  editingGroupId: string | null;

  setName: (value: string) => void;
  setCoursId: (value: string) => void;
  setTeachersId: (value: string) => void;
  setStatus: (value: boolean) => void;
  setSearch: (value: string) => void;
  setLoading: (value: boolean) => void;
  startEdit: (group: Group) => void;
  stopEdit: () => void;
  reset: () => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
  name: "",
  coursId: "",
  teachersId: "",
  status: true,
  search: "",
  isLoading: false,
  isEditMode: false,
  editingGroupId: null,

  setName: (value) => set({ name: value }),
  setCoursId: (value) => set({ coursId: value }),
  setTeachersId: (value) => set({ teachersId: value }),
  setStatus: (value) => set({ status: value }),
  setSearch: (value) => set({ search: value }),
  setLoading: (value) => set({ isLoading: value }),

  startEdit: (group) =>
    set({
      isEditMode: true,
      editingGroupId: group.id,
      name: group.name,
      coursId: group.cours_id,
      teachersId: group.teachers_id || group.teacher_id || "",
      status: group.status,
    }),

  stopEdit: () =>
    set({
      isEditMode: false,
      editingGroupId: null,
    }),

  reset: () =>
    set({
      name: "",
      coursId: "",
      teachersId: "",
      status: true,
      search: "",
      isLoading: false,
      isEditMode: false,
      editingGroupId: null,
    }),
}));
