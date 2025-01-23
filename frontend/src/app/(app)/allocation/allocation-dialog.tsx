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
import {
  Allocation,
  postAllocation,
  updateAllocation,
} from "@/service/allocationService";
import { SelectGroup, SelectTrigger } from "@radix-ui/react-select";
import { useEffect, useState } from "react";

interface AllocationDialogProps {
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
  dataDetailAllocation?: Allocation;
  buttonAction?: () => void;
}

export function AllocationDialog(props: AllocationDialogProps) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState(0);
  const [type, setType] = useState("");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (props.dataDetailAllocation) {
      setName(props.dataDetailAllocation.name);
      setBudget(props.dataDetailAllocation.budget);
      setType(props.dataDetailAllocation.type);
    }
  }, [props.dataDetailAllocation]);

  const resetForm = () => {
    setName("");
    setBudget(0);
    setType("");
  };
  const handlePostAllocation = async () => {
    try {
      const response = props.dataDetailAllocation
        ? await updateAllocation(
            props.dataDetailAllocation.id,
            name,
            budget,
            type
          )
        : await postAllocation(name, budget, type);
      if (response) {
        setOpen(false);
        toast({
          title: response.status ? "Success" : "Error",
          description: response.message,
        });

        if (!response.status) {
          setOpen(true);
        } else {
          resetForm();
          setOpen(false);
        }

        if (props.onSuccess) {
          resetForm();
          props.onSuccess();
        }
      } else {
        setOpen(false);
        toast({
          title: "Error",
          description: "Failed to create allocation",
        });
      }
    } catch (error) {
      console.error("Error fetching allocations:", error);
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 items-start">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              className="col-span-3"
              placeholder="Allocation name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
          <div className="flex flex-col gap-2 items-start">
            <Label htmlFor="budget" className="text-right">
              Budget
            </Label>
            <Input
              id="budget"
              className="col-span-3"
              type="number"
              placeholder="Rp. 0"
              onChange={(e) => setBudget(parseInt(e.target.value))}
              value={budget}
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
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handlePostAllocation}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
