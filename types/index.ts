export type Student = {
  id: string;
  fullName: string;
  created_at: string;
  phone: string;
  status: boolean;
  birth_date: string;
};

export type Teacher = {
  id: string;
  fullName: string;
  created_at: string;
  phone: string;
  status: boolean;
  salary: string;
  speciality: string;
};

export type Course = {
  id: string;
  created_at: string;
  name: string;
  price: number;
  duration: string;
};

export type Group = {
  id: string;
  created_at: string;
  name: string;
  cours_id: string;
  teachers_id: string;
  teacher_id?: string;
  status: boolean;
};

export type GroupStudent = {
  id: string;
  created_at: string;
  group_id: string;
  student_id: string;
};

export type Payment = {
  id: string;
  created_at: string;
  amount: string;
  course_price: number;
  note: string;
  student_id: string;
  group_id: string;
  payment_menthod: "cash" | "card";
};

export type FinanceTransaction = {
  id: string;
  created_at: string;
  title: string;
  category: string;
  type: "income" | "expense";
  payment_method: string;
  amount: number;
};

export type Attendance = {
  id: string;
  created_at: string;
  group_id: string;
  student_id: string;
  status: "kelgan" | "kelmagan";
  attendance_date: string;
};
