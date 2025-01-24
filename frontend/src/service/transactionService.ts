import BaseUrl from "@/utils/baseUrl";
import axiosInstance from "@/utils/validationRequest";
import axios from "axios";

export interface Transaction {
  _id: string;
  userId: string;
  allocationId: string;
  description: string;
  type: string;
  amount: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface TransactionResponse {
  status: boolean;
  data: Transaction[];
  page: number;
  totalPage: number;
  totalTransaction: number;
}

interface postTransaction {
  status: boolean;
  message: string;
}

interface detailTransaction {
  status: boolean;
  data: Transaction;
}

const getAllTransactions = async (
  month: number,
  search: string = "",
  perPage: number = 10,
  page: number = 1,
  type?: string,
  allocationId?: string
) => {
  try {
    const response = await axiosInstance.get(
      `${BaseUrl.transaction}?month=${month}&search=${search || ""}&perPage=${
        perPage || 10
      }&page=${page || 1}&type=${type}&allocationId=${allocationId}`
    );
    return response.data as TransactionResponse;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const postTransactions = async (
  allocationId: string,
  type: string,
  amount: number,
  description: string,
  date: Date
) => {
  try {
    const response = await axiosInstance.post(BaseUrl.transaction, {
      allocationId,
      type,
      amount,
      description,
      date,
    });
    return response.data as postTransaction;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const getDetailTransaction = async (id: string) => {
  try {
    const response = await axiosInstance.get(`${BaseUrl.transaction}/${id}`);
    return response.data as detailTransaction;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const updateTransactions = async (
  id: string,
  allocationId: string,
  type: string,
  amount: number,
  description: string,
  date: Date
) => {
  try {
    const response = await axiosInstance.put(`${BaseUrl.transaction}/${id}`, {
      allocationId,
      type,
      amount,
      description,
      date,
    });
    return response.data as postTransaction;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const deleteTransactions = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`${BaseUrl.transaction}/${id}`);
    return response.data as postTransaction;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const exportTransaction = async (month: number, type: string, allocationId: string) => {
  try {
    const response = await axiosInstance.get(`${BaseUrl.transaction}/export?month=${month}&type=${type}&allocationId=${allocationId}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_summary_${month}.pdf`);
    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

export {
  getAllTransactions,
  postTransactions,
  deleteTransactions,
  getDetailTransaction,
  updateTransactions,
  exportTransaction
};
