import { create } from "zustand";

interface PaymentStore {
  groupId: string;
  studentId: string;
  amount: string;
  method: string;
  note: string;

  isLoading: boolean;

  setGroupId: (value: string) => void;
  setStudentId: (value: string) => void;
  setAmount: (value: string) => void;
  setMethod: (value: string) => void;
  setNote: (value: string) => void;

  setLoading: (value: boolean) => void;

  reset: () => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  groupId: "",
  studentId: "",
  amount: "",
  method: "cash",
  note: "",

  isLoading: false,

  setGroupId: (value) =>
    set({
      groupId: value,
      studentId: "",
    }),

  setStudentId: (value) =>
    set({
      studentId: value,
    }),

  setAmount: (value) =>
    set({
      amount: value,
    }),

  setMethod: (value) =>
    set({
      method: value,
    }),

  setNote: (value) =>
    set({
      note: value,
    }),

  setLoading: (value) =>
    set({
      isLoading: value,
    }),

  reset: () =>
    set({
      groupId: "",
      studentId: "",
      amount: "",
      method: "cash",
      note: "",
      isLoading: false,
    }),
}));
