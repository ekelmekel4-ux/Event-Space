import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

footer_component = """
  const AppFooter = () => (
    <div className="bg-transparent mt-8 pt-6 pb-8 px-6 text-center shrink-0 border-t border-slate-200/50">
      <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-0.5">EventSpace V3.0</p>
      <p className="text-[9px] font-medium text-slate-400">© 2026 Platform Manajemen Event & Retail. All rights reserved.</p>
    </div>
  );
"""

# Insert AppFooter definition
content = content.replace("export default function App() {\n", "export default function App() {\n" + footer_component)

# Remove the old footer
old_footer = """            {/* PERSISTENT APP FOOTER */}
            {user && !["splash", "login", "register", "onboarding"].includes(screen) && (
              <div className="bg-slate-50/80 border-t border-slate-200/50 pb-safe pt-3 px-6 pb-3 text-center shrink-0">
                <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-0.5">EventSpace V3.0</p>
                <p className="text-[9px] font-medium text-slate-400">© 2026 Platform Manajemen Event & Retail. All rights reserved.</p>
              </div>
            )}"""
content = content.replace(old_footer, "")

screens = [
    '"home"', '"event_detail"', '"book"', '"payment"', '"my_tickets"', '"invoice"',
    '"org_dashboard"', '"org_events"', '"org_bookings"', '"org_create_event"', '"org_slot"'
]

# We need to find the `overflow-y-auto` block in each screen and add `<AppFooter />` before its closing div.
for s in screens:
    # Find the screen block: `{screen === {s} && (`
    screen_pattern = r'\{screen === ' + s + r'.*?\(\s*<div[^>]*>.*?(<div[^>]*overflow-y-auto[^>]*>.*?)(?=</div[^>]*>\s*</div[^>]*>\s*\)\})'
    
    # Actually, a regex to parse nested divs is not possible.
    pass

# We will just write `<AppFooter />` at the end of each screen manually.
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
