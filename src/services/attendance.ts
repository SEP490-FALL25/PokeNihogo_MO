import { axiosPrivate } from "@configs/axios";

export type AttendanceStatus = "PRESENT" | "ABSENT";

export interface IAttendanceRecord {
  id: number;
  date: string;
  status: AttendanceStatus;
  coin: number;
  bonusCoin: number;
  userId: number;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  dayOfWeek: string;
}

export interface IAttendanceSummary {
  user: {
    id: number;
    name: string;
    email: string;
  };
  attendances: IAttendanceRecord[];
  /**
   * Total number of check-in days in the current week only
   */
  count: number;
  /**
   * The streak of consecutive check-ins the user has achieved,
   * regardless of which week (could be this week or previous weeks)
   */
  totalStreak: number;
}

export interface IAttendanceCheckInResponse {
  data: IAttendanceRecord;
  message: string;
}

const attendanceService = {
  getAttendanceSummary: async (): Promise<IAttendanceSummary> => {
    const response = await axiosPrivate.get("/attendance/user");
    return response.data?.data as IAttendanceSummary;
  },
  checkIn: async (): Promise<IAttendanceCheckInResponse> => {
    const response = await axiosPrivate.post("/attendance");
    return response.data as IAttendanceCheckInResponse;
  },
};

export default attendanceService;

