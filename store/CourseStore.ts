import { Course } from "@/types";
import { create } from "zustand";

interface CourseStore {
  name: string;
  price: string;
  duration: string;
  search: string;
  isLoading: boolean;
  isEditMode: boolean;
  editingCourseId: string | null;

  setName: (value: string) => void;
  setPrice: (value: string) => void;
  setDuration: (value: string) => void;
  setSearch: (value: string) => void;
  setLoading: (value: boolean) => void;
  startEdit: (course: Course) => void;
  stopEdit: () => void;
  reset: () => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  name: "",
  price: "",
  duration: "",
  search: "",
  isLoading: false,
  isEditMode: false,
  editingCourseId: null,

  setName: (value) => set({ name: value }),
  setPrice: (value) => set({ price: value }),
  setDuration: (value) => set({ duration: value }),
  setSearch: (value) => set({ search: value }),
  setLoading: (value) => set({ isLoading: value }),

  startEdit: (course) =>
    set({
      isEditMode: true,
      editingCourseId: course.id,
      name: course.name,
      price: String(course.price),
      duration: course.duration,
    }),

  stopEdit: () =>
    set({
      isEditMode: false,
      editingCourseId: null,
    }),

  reset: () =>
    set({
      name: "",
      price: "",
      duration: "",
      search: "",
      isLoading: false,
      isEditMode: false,
      editingCourseId: null,
    }),
}));
