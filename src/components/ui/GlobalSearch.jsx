import React from "react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut
} from "./command";
import {
  LayoutDashboard,
  ShoppingCart,
  QrCode,
  Package,
  Users,
  List,
  BarChart3,
  Settings
} from "lucide-react";

const iconMap = {
  LayoutDashboard,
  ShoppingCart,
  QrCode,
  Package,
  Users,
  List,
  BarChart3,
  Settings
};

export const GlobalSearch = ({ isOpen, onOpenChange, searchItems, onSelect }) => {
  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Search... (Ctrl+K)" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {searchItems.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <CommandItem key={item.id} onSelect={() => onSelect(item)}>
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  <span>{item.label}</span>
                  <CommandShortcut>⌘K</CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
