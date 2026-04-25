import sys

file_path = 'src/pages/Products.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports to include Search and X
content = content.replace(
    'import { ChevronRight } from "lucide-react";',
    'import { ChevronRight, Search, X } from "lucide-react";'
)

# 2. Add custom scrollbar CSS to index.css if not there
css_path = 'src/index.css'
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('''
@layer utilities {
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
  }
}
''')

# 3. Completely replace the aside content
import re

aside_start = '<aside className="w-full shrink-0 lg:w-[320px]">'
main_start = '<main className="min-w-0 flex-1">'

start_idx = content.find(aside_start)
end_idx = content.find(main_start)

if start_idx != -1 and end_idx != -1:
    new_aside = '''<aside className="w-full shrink-0 lg:w-[280px] xl:w-[320px]">
          <div className="flex flex-col gap-6">
            
            {hasActiveFilters && (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Filtres actifs</h3>
                  <button
                    onClick={() => setSp(new URLSearchParams())}
                    className="text-xs font-semibold text-[#0ea5e9] hover:underline"
                  >
                    Effacer tout
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category_id && (
                    <button onClick={() => updateSearchParam("category_id", "")} className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                      <span>{ui.categorySelected}</span>
                      <X size={12} className="text-slate-400 group-hover:text-rose-500" />
                    </button>
                  )}
                  {brand_id && (
                    <button onClick={() => updateSearchParam("brand_id", "")} className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                      <span>{ui.brandSelected}</span>
                      <X size={12} className="text-slate-400 group-hover:text-rose-500" />
                    </button>
                  )}
                  {color && (
                    <button onClick={() => updateSearchParam("color", "")} className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                      <span>{ui.colorSelected.replace("{color}", translateColor(color))}</span>
                      <X size={12} className="text-slate-400 group-hover:text-rose-500" />
                    </button>
                  )}
                  {q.trim() && (
                    <button onClick={() => updateSearchParam("q", "")} className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                      <span>Recherche: {q}</span>
                      <X size={12} className="text-slate-400 group-hover:text-rose-500" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-6">
              
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {ui.search}
                </label>
                <div className="relative">
                  <input
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
                    placeholder={ui.searchPlaceholder}
                    value={q}
                    onChange={(e) => updateSearchParam("q", e.target.value)}
                  />
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {ui.category}
                </label>
                <div className="flex max-h-[220px] flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
                  <button
                    onClick={() => updateSearchParam("category_id", "")}
                    className={`text-left text-sm py-1.5 transition-colors ${!category_id ? "font-bold text-[#0ea5e9]" : "font-medium text-slate-500 hover:text-[#0ea5e9]"}`}
                  >
                    {ui.allCategories}
                  </button>
                  {cats.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateSearchParam("category_id", String(c.id))}
                      className={`text-left text-sm py-1.5 transition-colors ${String(c.id) === category_id ? "font-bold text-[#0ea5e9]" : "font-medium text-slate-500 hover:text-[#0ea5e9]"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {ui.brand}
                </label>
                <div className="flex max-h-[220px] flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
                  <button
                    onClick={() => updateSearchParam("brand_id", "")}
                    className={`text-left text-sm py-1.5 transition-colors ${!brand_id ? "font-bold text-[#0ea5e9]" : "font-medium text-slate-500 hover:text-[#0ea5e9]"}`}
                  >
                    {ui.allBrands}
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => updateSearchParam("brand_id", String(b.id))}
                      className={`text-left text-sm py-1.5 transition-colors ${String(b.id) === brand_id ? "font-bold text-[#0ea5e9]" : "font-medium text-slate-500 hover:text-[#0ea5e9]"}`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {hasColorOptions && (
                <>
                  <hr className="border-slate-100" />
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        {ui.colorFamilies}
                      </label>
                      {color && (
                        <button
                          onClick={() => updateSearchParam("color", "")}
                          className="text-xs font-semibold text-[#0ea5e9] hover:underline"
                        >
                          {ui.allColors}
                        </button>
                      )}
                    </div>
                    <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {orderedColors.map((item) => (
                        <ColorShortcut
                          key={item.name}
                          color={item}
                          active={color === item.name}
                          onClick={() => updateSearchParam("color", color === item.name ? "" : item.name)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>\n\n        '''
    
    content = content[:start_idx] + new_aside + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Sidebar refactoring complete.')
