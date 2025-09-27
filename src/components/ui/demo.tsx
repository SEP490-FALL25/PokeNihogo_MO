import React from 'react'
import { ScrollView, View } from 'react-native'
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
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    EnhancedPagination,
    Input,
    Label,
    Progress,
    RadioGroup,
    RadioGroupItem,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
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
    Toggle,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from './index'

export const UIDemo = () => {
  const [switchValue, setSwitchValue] = React.useState(false)
  const [checkboxValue, setCheckboxValue] = React.useState(false)
  const [radioValue, setRadioValue] = React.useState('option1')
  const [sliderValue, setSliderValue] = React.useState([50])
  const [tabValue, setTabValue] = React.useState('tab1')
  const [accordionValue, setAccordionValue] = React.useState('item1')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectValue, setSelectValue] = React.useState('')
  const [toggleValue, setToggleValue] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
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
            <Input label="Email" placeholder="Enter your email" keyboardType="email-address" />
            <Input label="Error State" placeholder="This has an error" error="This field is required" />
            <Textarea label="Message" placeholder="Enter your message" rows={3} />
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
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
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
          <View style={{ flexDirection: 'row', gap: 12 }}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Checkbox checked={checkboxValue} onCheckedChange={setCheckboxValue} />
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <RadioGroupItem value="option1" />
              <Label>Option 1</Label>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <RadioGroupItem value="option2" />
              <Label>Option 2</Label>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
          <Tabs value={tabValue} onValueChange={setTabValue}>
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
          <Accordion value={accordionValue} onValueChange={setAccordionValue}>
            <AccordionItem value="item1">
              <AccordionTrigger>Section 1</AccordionTrigger>
              <AccordionContent>
                <Text>Content for section 1. This is collapsible content.</Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item2">
              <AccordionTrigger>Section 2</AccordionTrigger>
              <AccordionContent>
                <Text>Content for section 2. This is also collapsible content.</Text>
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

      {/* Dialog */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Dialog</CardTitle>
          <CardDescription>Modal dialogs</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  This is a dialog description. You can put any content here.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <ToastDescription>Operation completed successfully.</ToastDescription>
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
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger placeholder="Choose an option">
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
              </SelectTrigger>
            </Select>
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
      </Card>

      {/* Tooltip */}
      <Card style={{ marginBottom: 16 }}>
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
    </ScrollView>
  )
}
