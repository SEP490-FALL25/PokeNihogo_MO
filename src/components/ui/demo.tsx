import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import BounceButton from "./BounceButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Skeleton,
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toast,
  ToastDescription,
  ToastTitle,
} from "./index";
import CustomSelect from "./Select";

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
              title="BẮT ĐẦU NGAY"
              onPress={() => console.log("Bounce button pressed!")}
            />
            <BounceButton
              title="DEMO BUTTON"
              onPress={() => console.log("Demo button pressed!")}
            />
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
      {/* <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Toggle</CardTitle>
          <CardDescription>Toggle button component</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Toggle pressed={toggleValue} onPressedChange={setToggleValue}>
                <Text>Toggle</Text>
              </Toggle>
              <Toggle pressed={!toggleValue} onPressedChange={() => setToggleValue(false)} variant="outline">
                <Text>Outline</Text>
              </Toggle>
            </View>
          </View>
        </CardContent>
      </Card> */}

      {/* Tooltip */}
      {/* <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Tooltip</CardTitle>
          <CardDescription>Tooltip component</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button>Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>
                This is a tooltip
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card> */}

      {/* Pagination */}
      {/* <Card style={{ marginBottom: 16 }}>
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
      </Card> */}

      {/* ToggleGroup */}
      {/* <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>ToggleGroup</CardTitle>
          <CardDescription>Toggle group component</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <ToggleGroup type="multiple" value={toggleGroupValue} onValueChange={setToggleGroupValue}>
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
      </Card> */}

      {/* Collapsible */}
      {/* <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Collapsible</CardTitle>
          <CardDescription>Collapsible component</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen}>
              <CollapsibleTrigger>
                <Text>Click to toggle</Text>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Text>This is the collapsible content that can be shown or hidden.</Text>
              </CollapsibleContent>
            </Collapsible>
          </View>
        </CardContent>
      </Card> */}

      {/* Sheet */}
      {/* <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Sheet</CardTitle>
          <CardDescription>Bottom sheet modal</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger>
                <Button>Open Sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet Title</SheetTitle>
                  <SheetDescription>This is a sheet description.</SheetDescription>
                </SheetHeader>
                <View style={{ paddingVertical: 16 }}>
                  <Text>Sheet content goes here...</Text>
                </View>
                <SheetFooter>
                  <SheetClose>
                    <Button variant="outline">Close</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </View>
        </CardContent>
      </Card> */}

      {/* Popover */}
      {/* <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Popover</CardTitle>
          <CardDescription>Popover component</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger>
                <Button>Open Popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <Text>This is a popover content.</Text>
              </PopoverContent>
            </Popover>
          </View>
        </CardContent>
      </Card> */}

      {/* ScrollArea */}
      {/* <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>ScrollArea</CardTitle>
          <CardDescription>Custom scroll area</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <ScrollArea style={{ height: 200, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 }}>
              <View style={{ padding: 16 }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <Text key={i} style={{ paddingVertical: 8 }}>
                    Scroll item {i + 1}
                  </Text>
                ))}
              </View>
            </ScrollArea>
          </View>
        </CardContent>
      </Card> */}

      {/* AlertDialog */}
      {/* <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>AlertDialog</CardTitle>
          <CardDescription>Alert dialog for confirmations</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
              <AlertDialogTrigger>
                <Button variant="destructive">Delete Item</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the item.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onPress={() => setAlertDialogOpen(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onPress={() => setAlertDialogOpen(false)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </View>
        </CardContent>
      </Card> */}

      {/* Breadcrumb */}
      {/* <Card style={{ marginBottom: 16 }}>
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
      </Card> */}

      {/* DropdownMenu */}
      {/* <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>DropdownMenu</CardTitle>
          <CardDescription>Dropdown menu component</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger>
                <Button variant="outline">Open Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onPress={() => {}}>Profile</DropdownMenuItem>
                <DropdownMenuItem onPress={() => {}}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onPress={() => {}}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>
        </CardContent>
      </Card> */}

      {/* AspectRatio */}
      {/* <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>AspectRatio</CardTitle>
          <CardDescription>Aspect ratio container</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={{ gap: 12 }}>
            <AspectRatio ratio={16 / 9} style={{ backgroundColor: '#f3f4f6', borderRadius: 8 }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>16:9 Aspect Ratio</Text>
              </View>
            </AspectRatio>
          </View>
        </CardContent>
      </Card> */}
    </ScrollView>
  );
};
