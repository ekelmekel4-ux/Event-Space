import sys

def main():
    with open('src/App.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find where <AppFooter /> was added manually
    # Let's just remove it if it was added.
    content = content.replace('<AppFooter />\n', '')
    content = content.replace('<AppFooter />', '')

    screens_with_footer = [
        'home', 'event_detail', 'book', 'payment', 'my_tickets', 'invoice',
        'org_dashboard', 'org_events', 'org_bookings', 'org_create_event', 'org_slot'
    ]

    out = ''
    i = 0
    while i < len(content):
        # find the next screen block
        # we look for '            {screen === "'
        match = content.find('            {screen === "', i)
        if match == -1:
            out += content[i:]
            break
            
        out += content[i:match]
        i = match
        
        # read the screen name
        quote_start = content.find('"', i)
        quote_end = content.find('"', quote_start + 1)
        screen_name = content[quote_start+1:quote_end]
        
        # find the start of the next screen block to limit our search
        next_screen = content.find('            {screen === "', quote_end)
        if next_screen == -1:
            next_screen = len(content)
            
        screen_content = content[i:next_screen]
        
        if screen_name in screens_with_footer:
            # find the first overflow-y-auto div
            ov_idx = screen_content.find('overflow-y-auto')
            if ov_idx != -1:
                # Find the start of this div tag
                div_start = screen_content.rfind('<div', 0, ov_idx)
                
                # We need to find the matching closing </div> for this div_start
                # Simple bracket matching
                depth = 0
                j = div_start
                while j < len(screen_content):
                    if screen_content.startswith('<div', j):
                        depth += 1
                        j += 4
                    elif screen_content.startswith('</div', j):
                        depth -= 1
                        if depth == 0:
                            # Found the closing div!
                            # Insert AppFooter right before it
                            screen_content = screen_content[:j] + '  <AppFooter />\n                ' + screen_content[j:]
                            break
                        j += 5
                    else:
                        j += 1
        
        out += screen_content
        i = next_screen

    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(out)

main()
