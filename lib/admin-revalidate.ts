import { revalidatePath } from "next/cache";

/**
 * Catalog edits must show up on the storefront right away. ISR covers the
 * 30s window, this forces the affected routes to refresh immediately.
 */
export function revalidateStorefront(
  handles: { products?: string[]; collections?: string[]; articles?: string[] } = {},
) {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");

  for (const handle of handles.products ?? []) revalidatePath(`/products/${handle}`);
  for (const handle of handles.collections ?? []) revalidatePath(`/collections/${handle}`);
  for (const handle of handles.articles ?? []) {
    revalidatePath("/blogs/organization-blog");
    revalidatePath(`/blogs/organization-blog/${handle}`);
  }
}
