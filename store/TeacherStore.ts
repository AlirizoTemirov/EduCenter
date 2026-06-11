import { create } from "zustand";

interface TeacherStore {
  fullName: string;
  phone: string;
  speciality: string;
  salary: string;

  search: string;

  isLoading: boolean;
  isEditMode: boolean;
  editingTeacherId: string | null;

  setFullName: (value: string) => void;
  setPhone: (value: string) => void;
  setSpeciality: (value: string) => void;
  setSalary: (value: string) => void;
  setSearch: (value: string) => void;
  setLoading: (value: boolean) => void;

  startEdit: (teacher: {
    id: string;
    fullName: string;
    phone: string;
    speciality: string;
    salary: string;
  }) => void;

  stopEdit: () => void;
  reset: () => void;
}

export const useTeacherStore = create<TeacherStore>((set) => ({
  fullName: "",
  phone: "",
  speciality: "",
  salary: "",

  search: "",

  isLoading: false,
  isEditMode: false,
  editingTeacherId: null,

  setFullName: (value) => set({ fullName: value }),

  setPhone: (value) => set({ phone: value }),

  setSpeciality: (value) => set({ speciality: value }),

  setSalary: (value) => set({ salary: value }),

  setSearch: (value) => set({ search: value }),

  setLoading: (value) => set({ isLoading: value }),

  startEdit: (teacher) =>
    set({
      isEditMode: true,
      editingTeacherId: teacher.id,

      fullName: teacher.fullName,
      phone: teacher.phone,
      speciality: teacher.speciality,
      salary: teacher.salary,
    }),

  stopEdit: () =>
    set({
      isEditMode: false,
      editingTeacherId: null,
    }),

  reset: () =>
    set({
      fullName: "",
      phone: "",
      speciality: "",
      salary: "",

      isLoading: false,
      isEditMode: false,
      editingTeacherId: null,

      search: "",
    }),
}));
