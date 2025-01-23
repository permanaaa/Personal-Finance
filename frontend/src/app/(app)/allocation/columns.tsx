"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Allocation = {
  id: string;
  name: string;
  budget: number;
  budgetUsage: number;
  budgetLeft: number;
  percentage: number;
  type: string;
};

export const columns: ColumnDef<Allocation>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left font-semibold">Name</div>,
  },
  {
    accessorKey: "budget",
    header: () => <div className="text-center font-semibold">Budget</div>,
    cell: ({ row }) => {
      return (
        <h1 className="text-sm font-medium text-end">
          Rp. {row.original.budget.toLocaleString("id-ID")}
        </h1>
      );
    },
  },
  {
    accessorKey: "budgetUsage",
    header: () => <div className="text-center font-semibold">Budget Usage</div>,
    cell: ({ row }) => {
      return (
        <h1 className="text-sm font-medium text-end">
          Rp. {row.original.budgetUsage.toLocaleString("id-ID")}
        </h1>
      );
    },
  },
  {
    accessorKey: "budgetLeft",
    header: () => <div className="text-center font-semibold">Budget Left</div>,
    cell: ({ row }) => {
      return (
        <h1 className="text-sm font-medium text-end">
          Rp. {row.original.budgetLeft.toLocaleString("id-ID")}
        </h1>
      );
    },
  },
  {
    accessorKey: "percentage",
    header: () => <div className="text-center font-semibold">Percentage</div>,
    cell: ({ row }) => {
      return (
        <h1 className="text-sm font-medium text-end">
          {row.original.percentage}%
        </h1>
      );
    },
  },
  {
    accessorKey: "action",
    header: () => <div className="text-center font-semibold">Action</div>,
    cell: () => {
      return (
        <div className="flex flex-row gap-2 items-center justify-center">
          <Button variant="secondary">Update</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      );
    },
  },
];
