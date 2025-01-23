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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, setHours, setMinutes } from "date-fns";
import {
  postReminders,
  Reminder,
  updateReminders,
} from "@/service/reminderService";

interface ReminderDialogProps {
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
  dataDetailReminder?: Reminder;
  buttonAction?: () => void;
}

export function ReminderDialog(props: ReminderDialogProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [allocationId, setAllocationId] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const [time, setTime] = useState({ hour: "00", minute: "00" });
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);

  const handleSelectDateTime = () => {
    if (date) {
      const combinedDateTime = setMinutes(
        setHours(date, parseInt(time.hour, 10)),
        parseInt(time.minute, 10)
      );
      setSelectedDateTime(combinedDateTime);
    }
  };

  const handleResetForm = () => {
    setTitle("");
    setAmount(0);
    setAllocationId("");
    setDate(null);
    setTime({ hour: "00", minute: "00" });
    setSelectedDateTime(null);
  };

  useEffect(() => {
    if (props.dataDetailReminder) {
      setTitle(props.dataDetailReminder.title);
      setAmount(props.dataDetailReminder.amount);
      setAllocationId(props.dataDetailReminder.allocationId);

      const parseDate = new Date(props.dataDetailReminder.dueDate);
      setDate(parseDate);

      setTime({
        hour: format(parseDate, "HH"),
        minute: format(parseDate, "mm"),
      });

      setSelectedDateTime(parseDate);
    }else{
      handleResetForm();
    }
  }, [props.dataDetailReminder]);

  const handlePostTransaction = async () => {
    try {
      const response = props.dataDetailReminder
        ? await updateReminders(
            props.dataDetailReminder._id,
            allocationId,
            title,
            amount,
            date || new Date()
          )
        : await postReminders(allocationId, title, amount, date || new Date());

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
              Title
            </Label>
            <Input
              id="name"
              className="col-span-3"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-[380px] justify-start text-left font-normal ${
                    !selectedDateTime && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon />
                  {selectedDateTime ? (
                    format(selectedDateTime, "PPP p") // Format "Jan 22, 2025 2:30 PM"
                  ) : (
                    <span>Pick a date and time</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 flex flex-col gap-4">
                <Calendar
                  mode="single"
                  selected={date!}
                  onSelect={(selectedDate) => setDate(selectedDate!)}
                  initialFocus
                />
                <div className="flex gap-2">
                  <select
                    className="border rounded px-2 py-1"
                    value={time.hour}
                    onChange={(e) => setTime({ ...time, hour: e.target.value })}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, "0")}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span>:</span>
                  <select
                    className="border rounded px-2 py-1"
                    value={time.minute}
                    onChange={(e) =>
                      setTime({ ...time, minute: e.target.value })
                    }
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, "0")}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
                <Button variant="default" onClick={handleSelectDateTime}>
                  Confirm
                </Button>
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
