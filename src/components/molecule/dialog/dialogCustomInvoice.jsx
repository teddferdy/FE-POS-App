import React from "react";

// import { Info } from "lucide-react";

// Components
// import { Card, CardContent } from "../../ui/card";
// import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../ui/drawer";
import { Button } from "../../ui/button";
// import { Separator } from "../../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../ui/dialog";
// import { Input } from "../../ui/input";
// import { Form, FormField, FormItem, FormLabel } from "../../ui/form";
// import { Switch } from "../../ui/switch";

// const arr = Array(40).fill(null);
const DialogCustomInvoice = () => {
  // State Show Member Using Switch
  //   const [hasMember, setHasMember] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="px-3 py-2 bg-[#D9D9D9] text-base font-bold text-white rounded-full">
          Custom Nota
        </Button>
      </DialogTrigger>
      <DialogContent className="w-4/5 sm:max-w-[100%] h-screen">
        <DialogHeader>
          <DialogTitle>Custom Nota</DialogTitle>
        </DialogHeader>
        <main className="grid grid-cols-2 gap-4 py-4">
          {/* Input */}
          <section></section>

          {/* Template Invoice */}
          <section></section>
        </main>

        <DialogFooter>
          <Button type="submit">Checkout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCustomInvoice;
