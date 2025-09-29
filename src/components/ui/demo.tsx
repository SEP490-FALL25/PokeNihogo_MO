import { Collapsible } from "@components/Collapsible";
import { Label } from "@react-navigation/elements";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./Accordion";
import { Alert, AlertDescription, AlertTitle } from "./Alert";
import { AspectRatio } from "./AspectRatio";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import BounceButton from "./BounceButton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./Breadcrumb";
import { Button } from "./Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./Card";
import { Checkbox } from "./Checkbox";
import { Input } from "./Input";
import { EnhancedPagination } from "./Pagination";
import { Progress } from "./Progress";
import { RadioGroup, RadioGroupItem } from "./RadioGroup";
import CustomSelect from "./Select";
import { Separator } from "./Separator";
import { Skeleton } from "./Skeleton";
import { Slider } from "./Slider";
import { Switch } from "./Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
import { Textarea } from "./Textarea";
import { Toast, ToastDescription, ToastTitle } from "./Toast";
import { Toggle } from "./Toggle";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";

export const UIDemo = () => {
  const [switchValue, setSwitchValue] = React.useState(false);
  const [checkboxValue, setCheckboxValue] = React.useState(false);
  const [radioValue, setRadioValue] = React.useState("option1");
  const [sliderValue, setSliderValue] = React.useState([50]);
  const [tabValue, setTabValue] = React.useState("tab1");
  const [accordionValue, setAccordionValue] = React.useState("item1");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectValue, setSelectValue] = React.useState("");
  const [toggleValue, setToggleValue] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [toggleGroupValue, setToggleGroupValue] = React.useState(["bold"]);
  const [collapsibleOpen, setCollapsibleOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const selectOptions = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Orange", value: "orange" },
    { label: "Grape", value: "grape" },
    { label: "Mango", value: "mango" },
  ];
  const [selectedFruit, setSelectedFruit] = useState<string>("");

  const handleSelectChange = (option: { label: string; value: string }) => {
    setSelectedFruit(option.value);
    console.log("Selected", `You chose: ${option.label}`);
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {/* BounceButton Examples */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Bounce Buttons (with Haptic)</CardTitle>
          <CardDescription>
            Buttons with bounce animation effects and haptic feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 16, alignItems: "center" }}>
            <BounceButton
              withHaptics
              onPress={() => console.log("Bounce button pressed!")}
            >
              BẮT ĐẦU NGAY
            </BounceButton>
            <BounceButton
              withHaptics
              onPress={() => console.log("Demo button pressed!")}
            >
              DEMO BUTTON
            </BounceButton>
            <BounceButton
              withHaptics
              loading
              onPress={() => console.log("Demo button pressed!")}
            >
              Loading button
            </BounceButton>
            <BounceButton
              withHaptics
              disabled
              onPress={() => console.log("Demo button pressed!")}
            >
              Disabled button
            </BounceButton>
          </View>
        </CardContent>
      </Card>

      {/* Button Examples */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button variants and sizes</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <Button variant="default">Default Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="link">Link Button</Button>
            <Button size="sm">Small Button</Button>
            <Button size="lg">Large Button</Button>
            <Button loading>Loading Button</Button>
            <Button disabled>Loading Button</Button>
          </View>
        </CardContent>
      </Card>

      {/* Input Examples */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
          <CardDescription>Form input components</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <Input label="Name" placeholder="Enter your name" />
            <Input
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
            />
            <Input
              label="Error State"
              placeholder="This has an error"
              error="This field is required"
            />
            <Textarea
              label="Message"
              placeholder="Enter your message"
              rows={3}
            />
          </View>
        </CardContent>
      </Card>

      {/* Badge Examples */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status and label indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </View>
        </CardContent>
      </Card>

      {/* Progress and Skeleton */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Progress & Skeleton</CardTitle>
          <CardDescription>Loading indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <Progress value={60} />
            <Progress value={30} />
            <Skeleton width="100%" height={20} />
            <Skeleton width="80%" height={16} />
          </View>
        </CardContent>
      </Card>

      {/* Avatar */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>User profile pictures</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Avatar size={40} fallback="John Doe" />
            <Avatar size={50} fallback="Jane Smith" />
            <Avatar size={60} fallback="Bob Wilson" />
          </View>
        </CardContent>
      </Card>

      {/* Switch */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Switch</CardTitle>
          <CardDescription>Toggle switches</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Switch value={switchValue} onCheckedChange={setSwitchValue} />
            <Label>Enable notifications</Label>
          </View>
        </CardContent>
      </Card>

      {/* Alert */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Alert messages</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <Alert variant="default">
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This is an informational alert message.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                This is an error alert message.
              </AlertDescription>
            </Alert>
          </View>
        </CardContent>
      </Card>

      {/* Separator */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Separator</CardTitle>
          <CardDescription>Visual dividers</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <View>
              <Label>Section 1</Label>
              <Separator />
              <Label>Section 2</Label>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Checkbox */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Checkbox</CardTitle>
          <CardDescription>Checkbox inputs</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Checkbox
                checked={checkboxValue}
                onCheckedChange={setCheckboxValue}
              />
              <Label>Accept terms and conditions</Label>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* RadioGroup */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>RadioGroup</CardTitle>
          <CardDescription>Radio button groups</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ marginBottom: 8 }}>
            <Text>Current value: {radioValue}</Text>
          </View>
          <RadioGroup value={radioValue} onValueChange={setRadioValue}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <RadioGroupItem value="option1" />
              <Label>Option 1</Label>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <RadioGroupItem value="option2" />
              <Label>Option 2</Label>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <RadioGroupItem value="option3" />
              <Label>Option 3</Label>
            </View>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Slider */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Slider</CardTitle>
          <CardDescription>Range slider controls</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              min={0}
              max={100}
              step={1}
            />
            <Text>Value: {sliderValue[0]}</Text>
          </View>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
          <CardDescription>Tab navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs>
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <Text>Content for Tab 1</Text>
            </TabsContent>
            <TabsContent value="tab2">
              <Text>Content for Tab 2</Text>
            </TabsContent>
            <TabsContent value="tab3">
              <Text>Content for Tab 3</Text>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Accordion */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Accordion</CardTitle>
          <CardDescription>Collapsible content sections</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion
            value={accordionValue}
            onValueChange={(value) =>
              setAccordionValue(
                typeof value === "string" ? value : value[0] || "item1"
              )
            }
          >
            <AccordionItem value="item1">
              <AccordionTrigger>Section 1</AccordionTrigger>
              <AccordionContent>
                <Text>Content for section 1. This is collapsible content.</Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item2">
              <AccordionTrigger>Section 2</AccordionTrigger>
              <AccordionContent>
                <Text>
                  Content for section 2. This is also collapsible content.
                </Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Table */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Table</CardTitle>
          <CardDescription>Data tables</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>john@example.com</TableCell>
                <TableCell>Admin</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jane Smith</TableCell>
                <TableCell>jane@example.com</TableCell>
                <TableCell>User</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Toast */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Toast</CardTitle>
          <CardDescription>Toast notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <Toast variant="default">
              <ToastTitle>Success!</ToastTitle>
              <ToastDescription>
                Operation completed successfully.
              </ToastDescription>
            </Toast>
            <Toast variant="destructive">
              <ToastTitle>Error</ToastTitle>
              <ToastDescription>Something went wrong.</ToastDescription>
            </Toast>
          </View>
        </CardContent>
      </Card>

      {/* Select */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Select</CardTitle>
          <CardDescription>Dropdown select component</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <CustomSelect
              options={selectOptions}
              placeholder="Choose a fruit"
              onSelect={handleSelectChange}
              selectedValue={selectedFruit}
            />
          </View>
        </CardContent>
      </Card>

      {/* Toggle */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Toggle</CardTitle>
          <CardDescription>Toggle button component</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Toggle pressed={toggleValue} onPressedChange={setToggleValue}>
                <Text>Toggle</Text>
              </Toggle>
              <Toggle
                pressed={!toggleValue}
                onPressedChange={() => setToggleValue(false)}
                variant="outline"
              >
                <Text>Outline</Text>
              </Toggle>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Pagination</CardTitle>
          <CardDescription>Pagination component</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <EnhancedPagination
              currentPage={currentPage}
              totalPages={10}
              totalItems={100}
              itemsPerPage={10}
              onPageChange={setCurrentPage}
              showItemCount={true}
            />
          </View>
        </CardContent>
      </Card>

      {/* ToggleGroup */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>ToggleGroup</CardTitle>
          <CardDescription>Toggle group component</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <ToggleGroup
              type="multiple"
              value={toggleGroupValue}
              onValueChange={(value) =>
                setToggleGroupValue(Array.isArray(value) ? value : [value])
              }
            >
              <ToggleGroupItem value="bold">
                <Text>Bold</Text>
              </ToggleGroupItem>
              <ToggleGroupItem value="italic">
                <Text>Italic</Text>
              </ToggleGroupItem>
              <ToggleGroupItem value="underline">
                <Text>Underline</Text>
              </ToggleGroupItem>
            </ToggleGroup>
          </View>
        </CardContent>
      </Card>

      {/* Collapsible */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Collapsible</CardTitle>
          <CardDescription>Collapsible component</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <Collapsible title="Click to toggle">
              <Text>
                This is the collapsible content that can be shown or hidden.
              </Text>
            </Collapsible>
          </View>
        </CardContent>
      </Card>

      {/* Breadcrumb */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Breadcrumb</CardTitle>
          <CardDescription>Navigation breadcrumb</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onPress={() => {}}>Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink onPress={() => {}}>Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </View>
        </CardContent>
      </Card>

      {/* AspectRatio */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>AspectRatio</CardTitle>
          <CardDescription>Aspect ratio container</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <AspectRatio
              ratio={16 / 9}
              style={{ backgroundColor: "#f3f4f6", borderRadius: 8 }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>16:9 Aspect Ratio</Text>
              </View>
            </AspectRatio>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
};
