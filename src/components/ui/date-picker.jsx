/* eslint-disable react/prop-types */
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function DatePicker({
  date,
  setDate,
  placeholder = "Pilih tanggal",
  className,
  fromYear = 1945,
  toYear = 2999,
  captionLayout = "dropdown",
  ...rest
}) {
  const [month, setMonth] = React.useState(date || new Date());

  React.useEffect(() => {
    if (date) setMonth(date);
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !date && "text-muted-foreground",
            className
          )}>
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? format(date, "dd MMM yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 overflow-visible" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d);
            if (d) setMonth(d);
          }}
          month={month}
          onMonthChange={setMonth}
          initialFocus
          captionLayout={captionLayout}
          fromYear={fromYear}
          toYear={toYear}
          {...rest}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
