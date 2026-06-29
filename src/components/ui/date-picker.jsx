/* eslint-disable react/prop-types */
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "./scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";
import { Button } from "./button";
import { DayPicker } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        caption_dropdowns: "flex justify-center gap-1",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames
      }}
      components={{
        // eslint-disable-next-line no-unused-vars
        Dropdown: ({ value, onChange, children, ...props }) => {
          const options = React.Children.toArray(children);
          const selected = options.find((child) => child.props.value === value);
          const handleChange = (value) => {
            const changeEvent = {
              target: { value }
            };
            onChange?.(changeEvent);
          };
          return (
            <Select
              value={value?.toString()}
              onValueChange={(value) => {
                handleChange(value);
              }}>
              <SelectTrigger className="pr-1.5 focus:ring-0">
                <SelectValue>{selected?.props?.children}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" className="z-[200]">
                <ScrollArea className="h-80">
                  {options.map((option, id) => (
                    <SelectItem
                      key={`${option.props.value}-${id}`}
                      value={option.props.value?.toString() ?? ""}>
                      {option.props.children}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          );
        },
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

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

export { Calendar, DatePicker };
