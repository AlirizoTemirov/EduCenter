import { create } from "zustand";
import { Student } from "@/types";

interface StudentStore {
  fullName: string;
  phone: string;
  birthDate: string;
  isLoading: boolean;
  isEditMode: boolean;
  editingStudentId: string | null;
  search: string;

  setFullName: (value: string) => void;
  setPhone: (value: string) => void;
  setBirthDate: (value: string) => void;
  setLoading: (value: boolean) => void;
  startEdit: (student: Student) => void;
  stopEdit: () => void;
  setSearch: (value: string) => void;

  reset: () => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  fullName: "",
  phone: "",
  birthDate: "",
  isLoading: false,
  isEditMode: false,
  editingStudentId: null,
  search: "",

  setSearch: (value) => set({ search: value }),
  setFullName: (value) => set({ fullName: value }),
  setPhone: (value) => set({ phone: value }),
  setBirthDate: (value) => set({ birthDate: value }),
  setLoading: (value) => set({ isLoading: value }),

  startEdit: (student) =>
    set({
      isEditMode: true,
      editingStudentId: student.id,
      fullName: student.fullName,
      phone: student.phone,
      birthDate: student.birth_date,
    }),

  stopEdit: () =>
    set({
      isEditMode: false,
      editingStudentId: null,
    }),

  reset: () =>
    set({
      fullName: "",
      phone: "",
      birthDate: "",
      isEditMode: false,
      editingStudentId: null,
      isLoading: false,
      search: "",
    }),
}));
