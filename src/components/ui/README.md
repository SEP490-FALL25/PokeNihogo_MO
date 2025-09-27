# UI Components for React Native

Bộ components UI được chuyển đổi từ React web sang React Native, tương thích với NativeWind và Expo.

## Cài đặt

Các dependencies cần thiết đã được cài đặt:
- `clsx` - Utility để merge class names
- `react-native` - Core React Native components
- `nativewind` - Tailwind CSS cho React Native

## Components có sẵn

### Button
Component button với nhiều variants và sizes.

```tsx
import { Button } from '@/components/ui'

<Button variant="default">Default Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="destructive">Destructive Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>

// Loading state
<Button loading>Loading...</Button>
```

### Card
Component card với header, content, footer.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    Card footer content
  </CardFooter>
</Card>
```

### Input
Component input với label và error state.

```tsx
import { Input } from '@/components/ui'

<Input label="Name" placeholder="Enter your name" />
<Input label="Email" placeholder="Enter your email" keyboardType="email-address" />
<Input label="Error State" placeholder="This has an error" error="This field is required" />
```

### Textarea
Component textarea với multiline support.

```tsx
import { Textarea } from '@/components/ui'

<Textarea label="Message" placeholder="Enter your message" rows={4} />
```

### Badge
Component badge cho status và labels.

```tsx
import { Badge } from '@/components/ui'

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Avatar
Component avatar với fallback text.

```tsx
import { Avatar } from '@/components/ui'

<Avatar size={40} fallback="John Doe" />
<Avatar src="https://example.com/avatar.jpg" fallback="John Doe" />
```

### Switch
Component toggle switch.

```tsx
import { Switch } from '@/components/ui'

<Switch value={isEnabled} onCheckedChange={setIsEnabled} />
```

### Alert
Component alert với title và description.

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui'

<Alert variant="default">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is an informational message.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>This is an error message.</AlertDescription>
</Alert>
```

### Progress
Component progress bar.

```tsx
import { Progress } from '@/components/ui'

<Progress value={60} max={100} />
```

### Skeleton
Component skeleton loading.

```tsx
import { Skeleton } from '@/components/ui'

<Skeleton width="100%" height={20} />
<Skeleton width="80%" height={16} />
```

### Separator
Component separator line.

```tsx
import { Separator } from '@/components/ui'

<Separator orientation="horizontal" />
<Separator orientation="vertical" />
```

### Label
Component label text.

```tsx
import { Label } from '@/components/ui'

<Label>Form Label</Label>
```

## Styling

Tất cả components đều sử dụng inline styles để đảm bảo tương thích với React Native. Màu sắc và spacing được thiết kế theo Tailwind CSS design system.

## Demo

Xem file `demo.tsx` để xem ví dụ sử dụng tất cả components.

### Form Components

#### Checkbox
Component checkbox với checked state.

```tsx
import { Checkbox } from '@/components/ui'

<Checkbox checked={isChecked} onCheckedChange={setIsChecked} />
```

#### RadioGroup
Component radio group với multiple options.

```tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui'

<RadioGroup value={value} onValueChange={setValue}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
    <RadioGroupItem value="option1" />
    <Label>Option 1</Label>
  </View>
</RadioGroup>
```

#### Slider
Component slider với range selection.

```tsx
import { Slider } from '@/components/ui'

<Slider 
  value={[50]} 
  onValueChange={setValue}
  min={0}
  max={100}
  step={1}
/>
```

### Layout Components

#### Tabs
Component tabs với tab navigation.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'

<Tabs value={value} onValueChange={setValue}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Accordion
Component accordion với collapsible sections.

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui'

<Accordion value={value} onValueChange={setValue}>
  <AccordionItem value="item1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content 1</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Data Display Components

#### Table
Component table cho hiển thị dữ liệu.

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Overlay Components

#### Dialog
Component modal dialog.

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui'

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Notification Components

#### Toast
Component toast notifications.

```tsx
import { Toast, ToastTitle, ToastDescription } from '@/components/ui'

<Toast variant="default">
  <ToastTitle>Success!</ToastTitle>
  <ToastDescription>Operation completed successfully.</ToastDescription>
</Toast>

<Toast variant="destructive">
  <ToastTitle>Error</ToastTitle>
  <ToastDescription>Something went wrong.</ToastDescription>
</Toast>
```

### Additional Components

#### Select
Component dropdown select với modal.

```tsx
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger placeholder="Choose an option">
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
    </SelectContent>
  </SelectTrigger>
</Select>
```

#### Tooltip
Component tooltip hiển thị thông tin khi hover.

```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui'

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
```

#### Toggle
Component toggle button với pressed state.

```tsx
import { Toggle } from '@/components/ui'

<Toggle pressed={pressed} onPressedChange={setPressed}>
  <Text>Toggle</Text>
</Toggle>

<Toggle pressed={pressed} onPressedChange={setPressed} variant="outline">
  <Text>Outline Toggle</Text>
</Toggle>
```

#### Pagination
Component phân trang với logic tích hợp.

```tsx
import { EnhancedPagination } from '@/components/ui'

<EnhancedPagination
  currentPage={currentPage}
  totalPages={10}
  totalItems={100}
  itemsPerPage={10}
  onPageChange={setCurrentPage}
  showItemCount={true}
/>
```

## Tóm tắt Components

### ✅ **Đã hoàn thành 24+ components:**

**Core Components (12):**
- Button, Card, Input, Textarea, Badge, Label, Separator, Skeleton, Progress, Avatar, Switch, Alert

**Form Components (4):**
- Checkbox, RadioGroup, Slider, Select

**Layout Components (3):**
- Tabs, Accordion, Dialog

**Data Display Components (2):**
- Table, Pagination

**Interactive Components (3):**
- Toggle, Tooltip, Toast

### 🎯 **Components còn có thể mở rộng:**
- Calendar/DatePicker
- Chart components
- Carousel
- Navigation components (Breadcrumb, NavigationMenu)
- Popover
- Sheet
- Context Menu
- Hover Card
- ScrollArea
- Form validation components

### 📊 **Thống kê:**
- **24 components** đã hoàn thành
- **100% TypeScript** support
- **Tất cả variants** và sizes được hỗ trợ
- **Animation** mượt mà với React Native Animated
- **Accessibility** ready
- **Performance** tối ưu với forwardRef
