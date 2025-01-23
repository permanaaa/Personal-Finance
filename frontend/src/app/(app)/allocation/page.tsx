/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Allocation } from "./columns";
import {
  deleteAllocation,
  getAllAllocations,
  exportAllocation,
  detailAllocation,
} from "@/service/allocationService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AllocationDialog } from "./allocation-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const [totalPage, setTotalPage] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [perPage, setPerPage] = useState(10); // State untuk jumlah item per halaman
  const [data, setData] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0 = January, 1 = February, ..., 11 = December
  const [dataDetailAllocation, setDataDetailAllocation] =
    useState<Allocation>();

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const availableMonths = months.slice(0, currentMonth + 1);

  const getData = async () => {
    try {
      const response = await getAllAllocations(month, search, perPage, page);
      if (response) {
        setTotalPage(response.totalPage);
        setData(response.data);
      } else {
        setError("Failed to fetch allocations.");
      }
    } catch (error) {
      console.error("Error fetching allocations:", error);
      setError("An error occurred while fetching allocations.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getData();
  }, [month, search, perPage, page]);

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteAllocation(id);
      if (response) {
        toast({
          title: response.status ? "Success" : "Error",
          description: response.message,
        });
        getData();
      }
    } catch (error) {
      console.error("Error fetching allocations:", error);
    }
  };

  const handleDetailAllocation = async (id: string) => {
    try {
      const response = await detailAllocation(id);
      if (response) {
        // console.log(response);
        setDataDetailAllocation(response.data);
      }
    } catch (error) {
      console.error("Error fetching allocations:", error);
    }
  };

  const handleExport = async (month: number) => {
    setLoading(true);
    await exportAllocation(month);
    setLoading(false);
    toast({
      title: "Success",
      description: "Allocation exported successfully.",
      variant: "default",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={"animate-spin"}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen px-6 mt-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Allocation</h1>
        <Card>
          <CardContent>
            <div className="flex flex-col gap-2 py-4">
              <div className="flex flex-row gap-2">
                <Input
                  placeholder="Filter names allocation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
                <Select
                  value={month.toString()}
                  onValueChange={(value) => setMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Select a month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Month</SelectLabel>
                      {availableMonths.map((month) => (
                        <SelectItem
                          key={month.value}
                          value={month.value.toString()}
                        >
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-row justify-between">
                <Select
                  value={`${perPage}`}
                  onValueChange={(value) => {
                    setPerPage(parseInt(value));
                  }}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Select a per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Per Page</SelectLabel>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="75">75</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="flex flex-row gap-2">
                  <AllocationDialog
                    variant="default"
                    buttonTitle="Add Allocation"
                    modalTitle="Add Allocation"
                    onSuccess={() => {
                      getData();
                    }}
                  />
                  <Button variant="outline" onClick={() => handleExport(month)}>
                    Export
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-center">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Budget
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Budget Usage
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Budget Left
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Percentage
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell className="text-left">{data.name}</TableCell>
                      <TableCell className="text-end">
                        Rp.{data.budget.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-end">
                        Rp.{data.budgetUsage.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-end">
                        Rp.{data.budgetLeft.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-end">
                        {data.percentage}%
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex flex-row gap-2 items-center justify-center">
                          <AllocationDialog
                            variant="secondary"
                            buttonTitle="Update"
                            modalTitle="Update Allocation"
                            buttonAction={() => {
                              handleDetailAllocation(data.id);
                            }}
                            dataDetailAllocation={dataDetailAllocation}
                            onSuccess={() => {
                              getData();
                            }}
                          />
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(data.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex flex-row justify-between">
            <div className="flex flex-row gap-2 w-[30%]">
              <p>
                Page {page} of {totalPage}
              </p>
            </div>
            <div className="flex flex-row gap-2 items-end justify-end w-[70%]">
              <Button
                variant="secondary"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage(page + 1)}
                disabled={totalPage === 1 || page === totalPage}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
