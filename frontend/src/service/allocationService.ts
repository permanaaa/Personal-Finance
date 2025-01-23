import BaseUrl from "@/utils/baseUrl";
import axiosInstance from "@/utils/validationRequest";
import axios from "axios";

export interface Allocation {
  id: string;
  name: string;
  budget: number;
  budgetUsage: number;
  budgetLeft: number;
  percentage: number;
  type: string;
}

interface AllocationResponse {
  status: boolean;
  data: Allocation[];
  page: number;
  totalPage: number;
  totalAllocation: number;
}

interface AllocationDetailResponse {
  status: boolean;
  data: Allocation;
}

interface postAllocation {
  status: boolean;
  message: string;
}

const getAllAllocations = async (
  month: number,
  search: string = "", // Default value is an empty string if search is not provided
  perPage: number = 10, // Default value is 10 if perPage is not provided
  page: number = 1 // Default value is 1 if page is not provided
) => {
  try {
    const response = await axiosInstance.get(
      `${BaseUrl.allocation}?month=${month}&search=${search || ""}&perPage=${
        perPage || 10
      }&page=${page || 1}`
    );
    return response.data as AllocationResponse;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const postAllocation = async (name: string, budget: number, type: string) => {
  try {
    const response = await axiosInstance.post(BaseUrl.allocation, {
      name,
      budget,
      type,
    });
    return response.data as postAllocation;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const detailAllocation = async (id: string) => {
  try {
    const response = await axiosInstance.get(`${BaseUrl.allocation}/${id}`);
    return response.data as AllocationDetailResponse;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const updateAllocation = async (id: string, name: string, budget: number, type: string) => {
  try {
    const response = await axiosInstance.put(`${BaseUrl.allocation}/${id}`, {
      name,
      budget,
      type,
    });
    return response.data as postAllocation;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const deleteAllocation = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`${BaseUrl.allocation}/${id}`);
    return response.data as postAllocation;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    } else {
      console.error("Unexpected error:", error);
      return null;
    }
  }
};

const exportAllocation = async (month: number) => {
  try {
    const response = await axiosInstance.get(`${BaseUrl.allocation}/export?month=${month}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `allocation_summary_${month}.pdf`); // Set the filename
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


export { getAllAllocations, postAllocation, deleteAllocation, exportAllocation, detailAllocation, updateAllocation };
