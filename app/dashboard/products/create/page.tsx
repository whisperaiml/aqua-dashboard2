import { SidebarInset } from "@/components/ui/sidebar"
import ProductEntryForm from "@/components/product-entry-form"
import MobileProductNav from "@/components/mobile-product-nav"

export default function ProductCreatePage() {
  return (
    <SidebarInset>
      <MobileProductNav />
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-6">
        <h1 className="text-lg font-semibold md:text-2xl">Add New Product</h1>
        <ProductEntryForm />
      </div>
    </SidebarInset>
  )
}
