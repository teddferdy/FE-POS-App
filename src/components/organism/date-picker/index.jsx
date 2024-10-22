/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Calendar } from "../../ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const DatePicker = ({ onSelectDate }) => {
  const [date, setDate] = useState(null);

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    if (onSelectDate) {
      onSelectDate(selectedDate); // Propagate date selection to parent
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          captionLayout="dropdown-buttons"
          selected={date}
          onSelect={handleDateSelect}
          fromYear={1960}
          toYear={2030}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
