import type { Category } from "@prisma/client";

export function ProductFilters({
  categories,
  brands,
  defaults = {}
}: {
  categories: Category[];
  brands: string[];
  defaults?: Record<string, string | undefined>;
}) {
  return (
    <aside className="card h-fit p-5">
      <h2 className="text-lg font-black">Filters</h2>
      <form className="mt-4 grid gap-4" action="/products">
        <label className="grid gap-1 text-sm font-semibold">
          Search
          <input className="input" name="q" defaultValue={defaults.q} placeholder="Keywords" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Category
          <select className="input" name="category" defaultValue={defaults.category ?? ""}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Brand
          <select className="input" name="brand" defaultValue={defaults.brand ?? ""}>
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm font-semibold">
            Min
            <input className="input" name="minPrice" type="number" min="0" defaultValue={defaults.minPrice} />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Max
            <input className="input" name="maxPrice" type="number" min="0" defaultValue={defaults.maxPrice} />
          </label>
        </div>
        <label className="grid gap-1 text-sm font-semibold">
          Rating
          <select className="input" name="rating" defaultValue={defaults.rating ?? ""}>
            <option value="">Any rating</option>
            <option value="4">4 stars & up</option>
            <option value="3">3 stars & up</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Sort
          <select className="input" name="sort" defaultValue={defaults.sort ?? "popular"}>
            <option value="popular">Popularity</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
        <button className="btn-primary" type="submit">
          Apply filters
        </button>
      </form>
    </aside>
  );
}
