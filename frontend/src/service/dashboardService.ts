import BaseUrl from "@/utils/baseUrl";
import axiosInstance from "@/utils/validationRequest";
import axios from "axios";

interface ResponseData {
  status: boolean;
  data: Data;
}

interface Data {
  cardData: CardData[];
  monthlyOverview: MonthlyOverview[];
  recentTransactions: RecentTransactions[];
}

interface CardData {
  title: string;
  value: string;
  icon: React.ReactNode;
  percentage: string;
  type: string;
}

interface MonthlyOverview {
  month: string;
  income: number;
  expenses: number;
}

interface RecentTransactions {
  date: string;
  allocationName: string;
  amount: number;
  description: string;
}

interface ResponDataNotification {
  status: boolean;
  data: NotificationInterface[];
}

interface NotificationInterface {
  _id: string;
  reminderTitle: string;
  allocationName: string;
  status: string;
  createdAt: Date;
}

const getDashboardData = async () => {
  try {
    const response = await axiosInstance.get(BaseUrl.dashboard);
    return response.data as ResponseData;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const getNotifications = async () => {
  try {
    const response = await axiosInstance.get(BaseUrl.notification);
    return response.data as ResponDataNotification;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

export  { getDashboardData, getNotifications };
export type { ResponseData, Data, CardData, MonthlyOverview, RecentTransactions,NotificationInterface };
