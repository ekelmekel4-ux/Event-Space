with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def find_screen(name):
    start = -1
    for i, line in enumerate(lines):
        if '{screen === "' + name + '"' in line:
            start = i
            break
    if start == -1: return -1, -1
    
    end = len(lines)
    for i in range(start + 1, len(lines)):
        if '{screen === "' in lines[i] or '{screen === ' in lines[i] or '{user &&' in lines[i]:
            if 'screen ===' in lines[i] or 'PERSISTENT APP FOOTER' in lines[i-1]:
                end = i - 1
                break
    return start + 1, end

print('event_detail:', find_screen('event_detail'))
print('booking_form:', find_screen('booking_form'))
print('org_bookings:', find_screen('org_bookings'))
