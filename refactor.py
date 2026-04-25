import sys

file_path = 'src/pages/Products.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Wrap the filters and main in a flex container
content = content.replace(
    '<section className="mt-5 rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_38px_rgba(15,23,42,0.05)]">',
    '<div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">\n        <aside className="w-full shrink-0 lg:w-[320px]">\n          <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_38px_rgba(15,23,42,0.05)]">'
)

# 2. Add flex-1 to main
content = content.replace(
    '<main className="mt-6">',
    '</aside>\n\n        <main className="min-w-0 flex-1">'
)

# 3. Close the flex container at the end
content = content.replace(
    '      </main>\n    </Container>',
    '      </main>\n      </div>\n    </Container>'
)

# 4. Change filter layouts from horizontal to vertical
content = content.replace(
    'className={`mt-4 grid gap-3 ${',
    'className={`mt-4 grid gap-4 ${'
)

content = content.replace(
    '? "xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(200px,0.76fr)]"',
    '? "grid-cols-1"'
)

content = content.replace(
    ': "xl:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]"',
    ': "grid-cols-1"'
)

content = content.replace(
    '? "xl:grid-cols-[minmax(0,1.4fr)_205px_205px_205px_110px]"',
    '? "grid-cols-1"'
)

content = content.replace(
    ': "xl:grid-cols-[minmax(0,1.4fr)_205px_205px_110px]"',
    ': "grid-cols-1"'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Refactoring complete.')
