import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SelectGroup, SelectTrigger } from "@radix-ui/react-select";
import { useEffect, useState } from "react";
import { Allocation } from "../allocation/columns";
import {
  postTransactions,
  Transaction,
  updateTransactions,
} from "@/service/transactionService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TransactionDialogProps {
  modalTitle: string;
  buttonTitle: string;
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost";
  onSuccess?: () => void;
  dataAllocations: Allocation[];
  dataDetailTransaction?: Transaction;
  buttonAction?: () => void;
}

export function TransactionDialog(props: TransactionDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState("");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [allocationId, setAllocationId] = useState("");
  const [date, setDate] = useState<Date>();

  useEffect(() => {
    if (props.dataDetailTransaction) {
      setDescription(props.dataDetailTransaction.description);
      setAmount(props.dataDetailTransaction.amount);
      setType(props.dataDetailTransaction.type);
      setAllocationId(props.dataDetailTransaction.allocationId);
      setDate(props.dataDetailTransaction.date);
    }
  }, [props.dataDetailTransaction]);

  const handleResetForm = () => {
    setDescription("");
    setAmount(0);
    setType("");
    setAllocationId("");
    setDate(undefined);
  };

  const handlePostTransaction = async () => {
    try {
      const response = props.dataDetailTransaction
        ? await updateTransactions(
            props.dataDetailTransaction._id,
            allocationId,
            type,
            amount,
            description,
            date || new Date()
          )
        : await postTransactions(
            allocationId,
            type,
            amount,
            description,
            date || new Date()
          );

      if (response) {
        toast({
          title: response.status ? "Success" : "Error",
          description: response.message,
          variant: response.status ? "default" : "destructive",
        });

        if(!response.status) {
          setOpen(true);
        } else {
          handleResetForm();
          setOpen(false);
        }

        if (props.onSuccess) {
          props.onSuccess();
        }
      } else {
        setOpen(false);
        toast({
          title: "Error",
          description: "Failed to create/update transaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => props.buttonAction && props.buttonAction()}
          variant={props.variant}
        >
          {props.buttonTitle}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{props.modalTitle}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 items-start">
          <Label htmlFor="type" className="text-right">
            Allocation
          </Label>
          <Select value={allocationId} onValueChange={setAllocationId}>
            <SelectTrigger className="w-full border rounded-md py-2 text-left px-2">
              <SelectValue placeholder="Select a allocation" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Allocation</SelectLabel>
                {props.dataAllocations.map((allocation) => (
                  <SelectItem
                    key={allocation.id}
                    value={allocation.id}
                    className="capitalize"
                  >
                    {allocation.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 items-start">
            <Label htmlFor="name" className="text-right">
              Description
            </Label>
            <Input
              id="name"
              className="col-span-3"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 items-start">
            <Label htmlFor="budget" className="text-right">
              Amount
            </Label>
            <Input
              id="budget"
              className="col-span-3"
              type="number"
              placeholder="Rp. 0"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-2 items-start">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full border rounded-md py-2 text-left px-2">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Type</SelectLabel>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 items-start">
            <Label htmlFor="type" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[380px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handlePostTransaction}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
