/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { getAllAllocations } from "@/service/allocationService";
import { Allocation } from "../allocation/columns";
import {
  deleteReminders,
  getAllReminders,
  getDetailReminders,
  Reminder,
} from "@/service/reminderService";
import { ReminderDialog } from "./reminder-dialog";

export default function Page() {
  const [totalPage, setTotalPage] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [perPage, setPerPage] = useState(10); // State untuk jumlah item per halaman
  const [data, setData] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [allocationId, setAllocationId] = useState("All");
  const [dataAllocation, setDataAllocation] = useState<Allocation[]>([]);
  const [detailReminder, setDetailReminder] = useState<Reminder>();

  const getDataAllocation = async () => {
    try {
      const response = await getAllAllocations(1, search, perPage, page);
      if (response) {
        setTotalPage(response.totalPage);
        setDataAllocation(response.data);
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

  const handleDetailReminder = async (id: string) => {
    try {
      const response = await getDetailReminders(id);
      if (response) {
        console.log(response);
        setDetailReminder(response.data);
      }
    } catch (error) {
      console.error("Error fetching allocations:", error);
    }
  };

  const getData = async () => {
    try {
      const response = await getAllReminders(
        search,
        perPage,
        page,
        allocationId
      );
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
    getDataAllocation();
  }, [search, perPage, page, allocationId]);

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteReminders(id);
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
        <h1 className="text-3xl font-bold">Reminder</h1>
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
                  value={allocationId}
                  onValueChange={(value) => setAllocationId(value)}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Select a allocation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Allocation</SelectLabel>
                      <SelectItem value="All">All</SelectItem>
                      {dataAllocation.map((allocation) => (
                        <SelectItem key={allocation.id} value={allocation.id}>
                          {allocation.name}
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
                  <ReminderDialog
                    variant="default"
                    buttonTitle="Add Reminder"
                    modalTitle="Add Reminder"
                    onSuccess={() => {
                      getData();
                    }}
                    dataAllocations={dataAllocation}
                  />
                  <Button variant="outline">Export</Button>
                </div>
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-center">
                      Allocation
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Title
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Due Date
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((data) => (
                    <TableRow key={data._id}>
                      <TableCell className="text-left">
                        {data.allocationName}
                      </TableCell>
                      <TableCell className="text-left">{data.title}</TableCell>
                      <TableCell className="text-end">
                        Rp.{data.amount.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(data.dueDate).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex flex-row gap-2 items-center justify-center">
                          <ReminderDialog
                            key={data._id}
                            variant="secondary"
                            buttonTitle="Update"
                            modalTitle="Update Reminder"
                            dataAllocations={dataAllocation}
                            dataDetailReminder={detailReminder}
                            onSuccess={() => {
                              getData();
                            }}
                            buttonAction={() => {
                              handleDetailReminder(data._id);
                            }}
                          />
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(data._id)}
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
