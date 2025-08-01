"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createProduct, ProductState } from "@/app/lib/actions"
import { useActionState } from "react"

export default function ProductEntryForm() {
  const [hasVariants, setHasVariants] = useState(false)
  const initialState: ProductState = { message: null, errors: {} }
  const [state, formAction] = useActionState(createProduct, initialState)

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-2">
      {/* Basic Information */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Basic Product Information</CardTitle>
          <CardDescription>
            Enter the core details for your product. Fields marked with
            <span className="text-red-500">*</span> are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input id="name" name="name" placeholder="Wireless Ergonomic Mouse" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="brand">
              Brand <span className="text-red-500">*</span>
            </Label>
            <Input id="brand" name="brand" placeholder="Tech Innovations" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">
              Product Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the product, its features and benefits."
              rows={5}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="producturl">
              Product URL Slug <span className="text-red-500">*</span>
            </Label>
            <Input id="producturl" name="producturl" placeholder="wireless-ergonomic-mouse" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sku">
              SKU <span className="text-red-500">*</span>
            </Label>
            <Input id="sku" name="sku" placeholder="ERGO-MOUSE-001" required />
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
            <Label htmlFor="imageurl">
              Main Image URL <span className="text-red-500">*</span>
            </Label>
            <Input id="imageurl" name="imageurl" type="url" placeholder="https://example.com/main.jpg" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="imagealt">
              Main Image Alt <span className="text-red-500">*</span>
            </Label>
            <Input id="imagealt" name="imagealt" placeholder="Ergonomic mouse on a desk" required />
          </div>

          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="grid gap-2">
              <Label htmlFor={`alt${i}imageurl`}>Alt Image {i} URL</Label>
              <Input id={`alt${i}imageurl`} name={`alt${i}imageurl`} type="url" placeholder={`https://example.com/alt-${i}.jpg`} />
              <Label htmlFor={`alt${i}imagealt`}>Alt Image {i} Alt</Label>
              <Input id={`alt${i}imagealt`} name={`alt${i}imagealt`} placeholder={`Alt text for image ${i}`} />
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
              <Label htmlFor="msrp">
                MSRP ($) <span className="text-red-500">*</span>
              </Label>
              <Input id="msrp" name="msrp" type="number" step="0.01" placeholder="99.99" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">
                Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input id="price" name="price" type="number" step="0.01" placeholder="79.99" required />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="availability">Availability</Label>
            <select
              id="availability"
              name="availability"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm"
              defaultValue="in-stock"
            >
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="featured" name="featured" />
            <Label htmlFor="featured">Featured</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="active" name="active" defaultChecked />
            <Label htmlFor="active">Active</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="onsale" name="onsale" />
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
            <Checkbox id="variant" name="variant" checked={hasVariants} onCheckedChange={(v) => setHasVariants(Boolean(v))} />
            <Label htmlFor="variant">Has Variants</Label>
          </div>

          {hasVariants && (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`var${idx + 1}`}>Variant {idx + 1}</Label>
                    <Input id={`var${idx + 1}`} name={`var${idx + 1}`} placeholder="Color: Black" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`varsku${idx + 1}`}>SKU {idx + 1}</Label>
                    <Input id={`varsku${idx + 1}`} name={`varsku${idx + 1}`} placeholder="ERGO-BLK" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex flex-col items-end gap-2">
        {state.message ? (
          <p className="text-sm text-red-500">{state.message}</p>
        ) : null}
        <Button type="submit">Save Product</Button>
      </div>
    </form>
  )
}
