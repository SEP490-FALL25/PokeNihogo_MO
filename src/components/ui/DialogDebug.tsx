import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./index";
import { SimpleDialog } from "./SimpleDialog";

export const DialogDebug = () => {
  const [open, setOpen] = React.useState(false);

  console.log("DialogDebug - open state:", open);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Dialog Debug Test</Text>

      <TouchableOpacity
        style={{
          backgroundColor: "#007AFF",
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
        }}
        onPress={() => {
          console.log("Button pressed, setting open to true");
          setOpen(true);
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Open Dialog (Manual)
        </Text>
      </TouchableOpacity>

      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          console.log("Dialog onOpenChange called with:", newOpen);
          setOpen(newOpen);
        }}
      >
        <DialogTrigger>
          <Button>Open Dialog (Trigger)</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Debug Dialog</DialogTitle>
            <DialogDescription>
              This is a debug dialog. Check console for logs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onPress={() => {
                console.log("Confirm pressed");
                setOpen(false);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Text style={{ marginTop: 20, fontSize: 14, color: "#666" }}>
        Current state: {open ? "OPEN" : "CLOSED"}
      </Text>

      {/* Simple Dialog Test */}
      <View
        style={{
          marginTop: 20,
          padding: 16,
          backgroundColor: "#f5f5f5",
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          Simple Dialog Test:
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#28a745",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
          }}
          onPress={() => {
            console.log("Simple dialog button pressed");
            setOpen(true);
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Open Simple Dialog
          </Text>
        </TouchableOpacity>
        <SimpleDialog open={open} onOpenChange={setOpen} />
      </View>
    </View>
  );
};
