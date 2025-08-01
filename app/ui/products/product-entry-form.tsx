"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function ProductEntryForm() {
  const [hasVariants, setHasVariants] = useState(false)

  return (
    <form className="grid gap-6 lg:grid-cols-2">
      {/* Basic Information */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Basic Product Information</CardTitle>
          <CardDescription>Enter the core details for your product.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" placeholder="Wireless Ergonomic Mouse" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" placeholder="Tech Innovations" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Product Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the product, its features and benefits."
              rows={5}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="producturl">Product URL Slug</Label>
            <Input id="producturl" placeholder="wireless-ergonomic-mouse" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" placeholder="ERGO-MOUSE-001" required />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
          <CardDescription>Main and alternate images.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="imageurl">Main Image URL</Label>
            <Input id="imageurl" type="url" placeholder="https://example.com/main.jpg" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="imagealt">Main Image Alt</Label>
            <Input id="imagealt" placeholder="Ergonomic mouse on a desk" required />
          </div>

          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="grid gap-2">
              <Label htmlFor={`alt${i}imageurl`}>Alt Image {i} URL</Label>
              <Input id={`alt${i}imageurl`} type="url" placeholder={`https://example.com/alt-${i}.jpg`} />
              <Label htmlFor={`alt${i}imagealt`}>Alt Image {i} Alt</Label>
              <Input id={`alt${i}imagealt`} placeholder={`Alt text for image ${i}`} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pricing & Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="msrp">MSRP ($)</Label>
              <Input id="msrp" type="number" step="0.01" placeholder="99.99" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" step="0.01" placeholder="79.99" required />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="availability">Availability</Label>
            <Select defaultValue="in-stock">
              <SelectTrigger id="availability">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="featured" />
            <Label htmlFor="featured">Featured</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="active" defaultChecked />
            <Label htmlFor="active">Active</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="onsale" />
            <Label htmlFor="onsale">On Sale</Label>
          </div>
        </CardContent>
      </Card>

      {/* Variants */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="variant" checked={hasVariants} onCheckedChange={(v) => setHasVariants(Boolean(v))} />
            <Label htmlFor="variant">Has Variants</Label>
          </div>

          {hasVariants && (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`var${idx + 1}`}>Variant {idx + 1}</Label>
                    <Input id={`var${idx + 1}`} placeholder="Color: Black" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`varsku${idx + 1}`}>SKU {idx + 1}</Label>
                    <Input id={`varsku${idx + 1}`} placeholder="ERGO-BLK" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex justify-end">
        <Button type="submit">Save Product</Button>
      </div>
    </form>
  )
}
