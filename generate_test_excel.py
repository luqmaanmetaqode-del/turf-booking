import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# ── Colors ──
GREEN_DARK  = "084734"
GREEN_LIGHT = "CEF17B"
GREEN_MID   = "D1FAE5"
ORANGE      = "FEF3C7"
RED_LIGHT   = "FEE2E2"
BLUE_LIGHT  = "DBEAFE"
GRAY        = "F3F4F6"
WHITE       = "FFFFFF"
YELLOW      = "FFF9C4"

def make_fill(hex_color):
    return PatternFill("solid", fgColor=hex_color)

def make_border():
    side = Side(style="thin", color="CCCCCC")
    return Border(left=side, right=side, top=side, bottom=side)

def header_row(ws, cols, row=1, bg=GREEN_DARK, fg=GREEN_LIGHT, size=11):
    for col_idx, col_name in enumerate(cols, 1):
        cell = ws.cell(row=row, column=col_idx, value=col_name)
        cell.fill = make_fill(bg)
        cell.font = Font(bold=True, color=fg, size=size)
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = make_border()

def data_row(ws, row_idx, values, bg=WHITE):
    for col_idx, val in enumerate(values, 1):
        cell = ws.cell(row=row_idx, column=col_idx, value=val)
        cell.fill = make_fill(bg)
        cell.font = Font(size=10)
        cell.alignment = Alignment(vertical="center", wrap_text=True)
        cell.border = make_border()

def section_header(ws, row_idx, text, num_cols, bg=GREEN_DARK, fg=GREEN_LIGHT):
    ws.merge_cells(start_row=row_idx, start_column=1, end_row=row_idx, end_column=num_cols)
    cell = ws.cell(row=row_idx, column=1, value=text)
    cell.fill = make_fill(bg)
    cell.font = Font(bold=True, color=fg, size=12)
    cell.alignment = Alignment(horizontal="left", vertical="center")
    cell.border = make_border()
    ws.row_dimensions[row_idx].height = 22

def set_col_widths(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

# ══════════════════════════════════════════════
#  BASIC TEST CASES DATA
# ══════════════════════════════════════════════
BASIC_MODULES = [
    ("MODULE 1 — User Registration", GREEN_DARK, [
        ("R01","Register with valid details","Go to /login → Create Account → Enter first name, phone, password → Submit","Account created, redirected to home page","",""),
        ("R02","Register with existing phone","Try registering with already registered phone","Error: phone already registered","",""),
        ("R03","Register with short password","Enter password less than 6 characters","Validation error shown","",""),
        ("R04","Register without first name","Leave first name empty → Submit","Validation error shown","",""),
        ("R05","Register with invalid phone","Enter 9-digit phone number","Validation error shown","",""),
        ("R06","Register with email (optional)","Fill email field along with other details","Account created successfully","",""),
        ("R07","Register with special characters","Enter name with symbols like @#$","Should sanitize or show error","",""),
        ("R08","Register with spaces only in name","Enter only spaces in first name","Validation error shown","",""),
        ("R09","Register with very long name","Enter 100+ character name","Should handle gracefully","",""),
        ("R10","Register and verify session","Register → Check if auto-logged in","User is logged in after registration","",""),
    ]),
    ("MODULE 2 — User Login", "1A56DB", [
        ("L01","Login with valid credentials","Enter registered phone + password → Login","Logged in, home page loads","",""),
        ("L02","Login with wrong password","Enter correct phone, wrong password","Error: invalid credentials","",""),
        ("L03","Login with unregistered phone","Enter random phone number","Error message shown","",""),
        ("L04","Login with empty fields","Click login without filling fields","Validation errors shown","",""),
        ("L05","Partner login at /partner/login","Enter partner phone + password","Redirected to partner dashboard","",""),
        ("L06","Admin login at /admin/login","Enter admin phone + password","Redirected to admin dashboard","",""),
        ("L07","User tries partner login","Login with user account at /partner/login","Error: not a partner account","",""),
        ("L08","Session persistence","Login → Close browser → Reopen site","User remains logged in","",""),
        ("L09","Logout functionality","Login → Click logout","Logged out, redirected to home","",""),
        ("L10","Login with +91 prefix","Enter +91XXXXXXXXXX in phone field","Should handle or strip prefix","",""),
    ]),
    ("MODULE 3 — Home Page & Navigation", "7C3AED", [
        ("H01","Home page loads","Open https://turfx.metaqode.co.in","Home page loads with venues listed","",""),
        ("H02","Logo click navigates home","Click TurfX logo from any page","Redirected to home page","",""),
        ("H03","Navbar links work","Click Explore, My Bookings, Login","Each page loads correctly","",""),
        ("H04","My Bookings when logged in","Click My Bookings when logged in","My Bookings page loads","",""),
        ("H05","My Bookings without login","Click My Bookings when not logged in","Redirected to login","",""),
        ("H06","Footer links work","Click footer links","Links navigate correctly","",""),
        ("H07","Page title correct","Check browser tab title","Shows TurfX or relevant title","",""),
        ("H08","Favicon visible","Check browser tab","TurfX favicon shown","",""),
        ("H09","Responsive navbar","Open on mobile width","Hamburger menu or responsive layout","",""),
        ("H10","List Your Venue button","Click List Your Venue in navbar","Redirected to /partner/login","",""),
    ]),
    ("MODULE 4 — Explore & Venue Search", "B45309", [
        ("E01","Explore page loads","Go to /explore","Venue cards listed","",""),
        ("E02","Search by city","Type city name in search bar","Filtered venues shown","",""),
        ("E03","Filter by sport","Select sport from filter dropdown","Only matching venues shown","",""),
        ("E04","Clear filters","Apply filter → Clear","All venues shown again","",""),
        ("E05","View venue detail","Click on any venue card","Venue detail page opens","",""),
        ("E06","Venue photos visible","On venue detail page","Photos/images load correctly","",""),
        ("E07","Venue amenities shown","On venue detail page","Amenities listed correctly","",""),
        ("E08","Venue rating shown","On venue detail page","Star rating and review count visible","",""),
        ("E09","Venue price shown","On venue detail page","Price per hour displayed","",""),
        ("E10","Venue location shown","On venue detail page","Location/address visible","",""),
        ("E11","No results state","Search for non-existent city","No venues found message shown","",""),
        ("E12","Navigate back from venue","Click browser back from venue detail","Returns to explore page","",""),
    ]),
    ("MODULE 5 — Slot Selection", "065F46", [
        ("S01","View available slots","On venue page, select today's date","Time slots shown (6 AM – 11 PM)","",""),
        ("S02","Booked slots greyed out","View slots for date with existing bookings","Already booked slots are disabled","",""),
        ("S03","Select single slot","Click one available time slot","Slot highlighted, price shown","",""),
        ("S04","Select multiple slots","Click 2-3 slots","Total price updates correctly","",""),
        ("S05","Deselect slot","Click selected slot again","Slot deselected, price updates","",""),
        ("S06","Select all available slots","Click all available slots","All selected, total price correct","",""),
        ("S07","Change date","Select different date","Slots refresh for new date","",""),
        ("S08","Past date slots","Select past date","Past dates disabled or no slots","",""),
        ("S09","Far future date","Select date 3 months ahead","Slots shown as available","",""),
        ("S10","Slot count in summary","Select 3 slots","Summary shows 3 slots selected","",""),
    ]),
    ("MODULE 6 — Booking & Payment", "991B1B", [
        ("B01","Pay button disabled","No slot selected","Button shows Select Slots, disabled","",""),
        ("B02","Price breakdown correct","Select 2 slots at ₹800/hr","Court ₹1600 + Fee ₹25 + GST ₹5 = ₹1630","",""),
        ("B03","Book without login","Try to book without logging in","Redirected to login page","",""),
        ("B04","Razorpay popup opens","Select slot → Click Pay","Razorpay payment popup opens","",""),
        ("B05","Pay via UPI success","Enter UPI: success@razorpay → Pay","Payment succeeds, booking confirmed","",""),
        ("B06","Pay via UPI failure","Enter UPI: failure@razorpay → Pay","Payment fails, booking NOT created","",""),
        ("B07","Pay via test card","Enter card details → OTP: 1234","Payment succeeds, booking confirmed","",""),
        ("B08","Booking confirmed screen","After successful payment","Booking Confirmed screen shown","",""),
        ("B09","Booking in My Bookings","After payment, go to My Bookings","New booking appears as Confirmed","",""),
        ("B10","Slot blocked after booking","Try booking same slot again","Slot shows as Booked / unavailable","",""),
        ("B11","Close Razorpay without paying","Open popup → Click X","Popup closes, no booking created","",""),
        ("B12","Booking ID generated","After booking","Unique booking ID shown (#TFX-XXXX)","",""),
        ("B13","Booking date correct","After booking","Correct date shown in confirmation","",""),
        ("B14","Booking time correct","After booking","Correct time slots shown","",""),
        ("B15","Total amount correct","After booking","Amount matches price breakdown","",""),
    ]),
    ("MODULE 7 — My Bookings", "1D4ED8", [
        ("MB01","View my bookings","Login → Go to My Bookings","All user bookings listed","",""),
        ("MB02","Booking details visible","View a booking","Shows venue, date, time, amount, status","",""),
        ("MB03","Upcoming bookings shown","Have a future booking","Appears in upcoming section","",""),
        ("MB04","Completed bookings shown","Have a past booking","Appears in completed section","",""),
        ("MB05","Cancelled bookings shown","Cancel a booking","Appears in cancelled section","",""),
        ("MB06","Cancel booking 24h+ before","Cancel future booking","100% refund, status = Cancelled","",""),
        ("MB07","Cancel booking 6-24h before","Cancel booking 6-24h before","50% refund, status = Cancelled","",""),
        ("MB08","Cancel booking less than 6h","Cancel booking < 6h before","No refund, status = Cancelled","",""),
        ("MB09","Slot freed after cancel","Check slot after cancellation","Slot available again","",""),
        ("MB10","Cannot cancel past booking","Try cancelling past booking","Error: cannot cancel past bookings","",""),
    ]),
    ("MODULE 8 — Partner Dashboard", "5B21B6", [
        ("PD01","Partner login","Go to /partner/login","Login with partner credentials","",""),
        ("PD02","Dashboard loads","After login","Dashboard with stats visible","",""),
        ("PD03","Total bookings stat","Dashboard","Shows correct total booking count","",""),
        ("PD04","Total earnings stat","Dashboard","Shows correct earnings amount","",""),
        ("PD05","Upcoming bookings widget","Dashboard","Shows upcoming bookings list","",""),
        ("PD06","Pending approvals widget","Dashboard","Shows pending approval count","",""),
        ("PD07","My venues widget","Dashboard","Shows partner's venues","",""),
        ("PD08","Recent activity","Dashboard","Shows recent booking activity","",""),
        ("PD09","Earnings chart","Dashboard","Bar chart with weekly data","",""),
        ("PD10","Logout from partner","Click Logout","Logged out, redirected to home","",""),
    ]),
    ("MODULE 9 — Partner Venues", "065F46", [
        ("V01","View venues list","Click Venues tab","All partner venues shown as cards","",""),
        ("V02","Venue stats shown","On venue card","Bookings, earned, per hour shown","",""),
        ("V03","Active status shown","On venue card","Active/Inactive badge visible","",""),
        ("V04","Add new venue","Click Add New Venue → Fill form","Venue created successfully","",""),
        ("V05","Add venue without name","Submit venue form without name","Validation error shown","",""),
        ("V06","Add venue without price","Submit without price per hour","Validation error shown","",""),
        ("V07","Edit venue","Click Edit on venue → Change name → Save","Changes saved correctly","",""),
        ("V08","Manage venue","Click Manage","Navigates to bookings for that venue","",""),
        ("V09","Slots button","Click Slots on venue card","Navigates to slots management","",""),
        ("V10","Search venues","Type in search box","Matching venues filtered","",""),
    ]),
    ("MODULE 10 — Partner Bookings", "B45309", [
        ("PB01","View all bookings","Click Bookings tab","All bookings in table","",""),
        ("PB02","All Bookings tab","Click All Bookings","All bookings shown","",""),
        ("PB03","Upcoming tab","Click Upcoming","Only upcoming bookings shown","",""),
        ("PB04","Today tab","Click Today","Only today's bookings shown","",""),
        ("PB05","Completed tab","Click Completed","Only completed bookings shown","",""),
        ("PB06","Cancelled tab","Click Cancelled","Only cancelled bookings shown","",""),
        ("PB07","Search by customer","Type customer name","Matching bookings shown","",""),
        ("PB08","Filter by venue","Select venue from dropdown","Bookings for that venue shown","",""),
        ("PB09","Filter by sport","Select sport","Matching bookings shown","",""),
        ("PB10","Export CSV","Click Export CSV","CSV file downloads with booking data","",""),
        ("PB11","Booking calendar","Right panel","Calendar shows booked dates","",""),
        ("PB12","Upcoming summary","Right panel","Shows total bookings, revenue, hours","",""),
    ]),
    ("MODULE 11 — Admin Dashboard", "991B1B", [
        ("AD01","Admin login","Go to /admin/login","Login with admin credentials","",""),
        ("AD02","Dashboard loads","After login","Admin dashboard with platform stats","",""),
        ("AD03","Total users count","Dashboard","Correct user count shown","",""),
        ("AD04","Total bookings count","Dashboard","Correct booking count shown","",""),
        ("AD05","Total revenue","Dashboard","Correct revenue shown","",""),
        ("AD06","View all users","Users section","All registered users listed","",""),
        ("AD07","Search users","Type name/phone in search","Matching users shown","",""),
        ("AD08","View all bookings","Bookings section","All platform bookings visible","",""),
        ("AD09","View all venues","Venues section","All partner venues listed","",""),
        ("AD10","View admin wallet","Wallet section","Admin wallet balance and transactions","",""),
        ("AD11","Platform fee retained","Wallet section","Shows platform fee + GST retained","",""),
        ("AD12","Partner payouts","Wallet section","Shows amount paid out to partners","",""),
        ("AD13","View KYC requests","KYC section","Partner KYC documents listed","",""),
        ("AD14","View support tickets","Support section","All user support tickets listed","",""),
        ("AD15","Admin logout","Click logout","Logged out, redirected to home","",""),
    ]),
    ("MODULE 12 — Edge Cases & Security", "374151", [
        ("EC01","Double booking same slot","Two users try same slot simultaneously","Only one booking succeeds","",""),
        ("EC02","Access partner dashboard without login","Go to /partner/dashboard directly","Redirected to partner login","",""),
        ("EC03","Access admin dashboard without login","Go to /admin/dashboard directly","Redirected to admin login","",""),
        ("EC04","User access partner dashboard","Login as user, go to /partner/dashboard","Redirected to partner login","",""),
        ("EC05","Page refresh on checkout","Refresh checkout page mid-booking","Page reloads correctly","",""),
        ("EC06","Invalid booking ID in URL","Go to /checkout/invalid-id","Graceful error shown","",""),
        ("EC07","Mobile responsiveness","Open site on mobile browser","Layout adapts correctly","",""),
        ("EC08","Slow network simulation","Use DevTools → Slow 3G","Loading states shown, no crashes","",""),
        ("EC09","NoSQL injection in search","Type {$gt:''} in search box","No data leak, handled safely","",""),
        ("EC10","XSS in name field","Enter <script>alert(1)</script> as name","Script not executed, sanitized","",""),
    ]),
]

# ══════════════════════════════════════════════
#  BUILD BASIC TEST EXCEL
# ══════════════════════════════════════════════
def build_basic_excel():
    wb = openpyxl.Workbook()

    # ── Cover Sheet ──
    ws_cover = wb.active
    ws_cover.title = "Cover"
    ws_cover.sheet_view.showGridLines = False
    ws_cover.column_dimensions["A"].width = 60

    ws_cover["A1"] = "TurfX"
    ws_cover["A1"].font = Font(bold=True, size=28, color=GREEN_DARK)
    ws_cover["A2"] = "Manual Testing Guide — Basic Level"
    ws_cover["A2"].font = Font(bold=True, size=18, color="374151")
    ws_cover["A3"] = "Site: https://turfx.metaqode.co.in"
    ws_cover["A3"].font = Font(size=12, color="6B7280")
    ws_cover["A4"] = "Total Test Cases: 140"
    ws_cover["A4"].font = Font(size=12, color="6B7280")
    ws_cover["A5"] = "Date: May 2026"
    ws_cover["A5"].font = Font(size=12, color="6B7280")
    ws_cover["A6"] = "Prepared by: Metaqode Technologies Pvt. Ltd."
    ws_cover["A6"].font = Font(size=12, color="6B7280")

    ws_cover["A8"] = "Test Credentials"
    ws_cover["A8"].font = Font(bold=True, size=14, color=GREEN_DARK)
    creds = [
        ("Role", "Phone", "Password"),
        ("Admin", "(your admin phone)", "(your admin password)"),
        ("Partner", "(your partner phone)", "(your partner password)"),
        ("New User", "Register fresh", "any 6+ char password"),
    ]
    for i, row in enumerate(creds, 9):
        for j, val in enumerate(row, 1):
            c = ws_cover.cell(row=i, column=j, value=val)
            c.border = make_border()
            if i == 9:
                c.fill = make_fill(GREEN_DARK)
                c.font = Font(bold=True, color=GREEN_LIGHT)
            else:
                c.fill = make_fill(GREEN_MID)
                c.font = Font(size=10)

    ws_cover["A14"] = "Razorpay Test Payment"
    ws_cover["A14"].font = Font(bold=True, size=14, color=GREEN_DARK)
    pay = [
        ("Method", "Details"),
        ("UPI Success", "success@razorpay"),
        ("UPI Failure", "failure@razorpay"),
        ("Test Card", "4718 6092 0990 0986 / Expiry: 12/26 / CVV: 123 / OTP: 1234"),
    ]
    for i, row in enumerate(pay, 15):
        for j, val in enumerate(row, 1):
            c = ws_cover.cell(row=i, column=j, value=val)
            c.border = make_border()
            if i == 15:
                c.fill = make_fill(GREEN_DARK)
                c.font = Font(bold=True, color=GREEN_LIGHT)
            else:
                c.fill = make_fill(ORANGE)
                c.font = Font(size=10)

    # ── All Test Cases Sheet ──
    ws = wb.create_sheet("All Test Cases")
    ws.sheet_view.showGridLines = False
    cols = ["Test ID", "Test Case", "Steps", "Expected Result", "Status", "Notes"]
    set_col_widths(ws, [10, 35, 55, 45, 12, 25])
    ws.row_dimensions[1].height = 30

    row_idx = 1
    STATUS_COLORS = {"Pass": "D1FAE5", "Fail": "FEE2E2", "Blocked": "FEF3C7", "": WHITE}

    for module_name, color, cases in BASIC_MODULES:
        section_header(ws, row_idx, f"  {module_name}", len(cols), bg=color, fg=WHITE)
        row_idx += 1
        header_row(ws, cols, row=row_idx, bg="F3F4F6", fg="374151", size=10)
        row_idx += 1
        for i, case in enumerate(cases):
            bg = GREEN_MID if i % 2 == 0 else WHITE
            data_row(ws, row_idx, list(case), bg=bg)
            ws.row_dimensions[row_idx].height = 40
            row_idx += 1
        row_idx += 1  # blank row between modules

    # ── Summary Sheet ──
    ws_sum = wb.create_sheet("Summary")
    ws_sum.sheet_view.showGridLines = False
    set_col_widths(ws_sum, [35, 10, 10, 10, 12, 20])
    header_row(ws_sum, ["Module", "Total", "Pass", "Fail", "Blocked", "Notes"], row=1)
    summary_data = [(m[0].replace("MODULE ", "").split(" — ")[1], len(m[2])) for m in BASIC_MODULES]
    total = 0
    for i, (name, count) in enumerate(summary_data, 2):
        bg = GREEN_MID if i % 2 == 0 else WHITE
        data_row(ws_sum, i, [name, count, "", "", "", ""], bg=bg)
        total += count
    last = len(summary_data) + 2
    ws_sum.cell(row=last, column=1, value="TOTAL").font = Font(bold=True, size=11)
    ws_sum.cell(row=last, column=2, value=total).font = Font(bold=True, size=11)
    ws_sum.cell(row=last, column=1).fill = make_fill(GREEN_DARK)
    ws_sum.cell(row=last, column=1).font = Font(bold=True, color=GREEN_LIGHT)
    ws_sum.cell(row=last, column=2).fill = make_fill(GREEN_DARK)
    ws_sum.cell(row=last, column=2).font = Font(bold=True, color=GREEN_LIGHT)

    wb.save("TurfX_Basic_Testing_Guide.xlsx")
    print("✅ TurfX_Basic_Testing_Guide.xlsx created")

build_basic_excel()

# ══════════════════════════════════════════════
#  ADVANCED TEST CASES DATA
# ══════════════════════════════════════════════
ADVANCED_MODULES = [
    ("SECTION A — Auth & Session Security", "991B1B", [
        ("A101","Expired token access","Manually set system clock forward 24h → Use old token to call API","401 Unauthorized returned","Critical",""),
        ("A102","Tampered JWT payload","Decode JWT → Change role to admin → Re-encode → Call admin API","401 Unauthorized, token rejected","Critical",""),
        ("A103","JWT with invalid signature","Modify last 3 chars of token → Call protected API","401 Unauthorized","Critical",""),
        ("A104","Missing Bearer prefix","Call API with token but without Bearer prefix","401 Unauthorized","High",""),
        ("A105","Token reuse after logout","Login → Copy token → Logout → Use copied token","Token should be invalid","High",""),
        ("A106","Token from different user","Use User A's token to access User B's bookings","403 Forbidden","Critical",""),
        ("A107","Admin token on user endpoint","Use admin token on /api/bookings/mine","Returns admin's own bookings only","Medium",""),
        ("A108","Null token","Send Authorization: Bearer null","401 Unauthorized","High",""),
        ("A109","Empty token","Send Authorization: Bearer (empty)","401 Unauthorized","High",""),
        ("A110","Token in query param","Call /api/bookings/mine?token=XXXX","Should not work, header only","Medium",""),
        ("A201","Login brute force","Send 50 login requests with wrong passwords in 1 minute","Rate limit triggered","Critical",""),
        ("A202","Registration flood","Send 20 registration requests in 30 seconds","Rate limit triggered","High",""),
        ("A203","Booking flood","Send 10 booking requests in 10 seconds","Rate limit triggered","High",""),
        ("A204","API endpoint flood","Send 200 GET requests to /api/turfs in 1 minute","Rate limit or throttle applied","Medium",""),
        ("A205","Rate limit reset","Hit rate limit → Wait 1 minute → Try again","Access restored after cooldown","Medium",""),
        ("A301","Password in plain text in DB","Register → Check MongoDB for password field","Password should be hashed (bcrypt)","Critical",""),
        ("A302","Password in API response","Login → Check response body","Password field NOT in response","Critical",""),
        ("A303","Password in logs","Register → Check PM2 logs","Password NOT logged in plain text","Critical",""),
        ("A304","Minimum password enforcement","Register with 5-char password","Rejected with validation error","High",""),
        ("A305","Password with only spaces","Register with spaces as password","Rejected with validation error","High",""),
    ]),
    ("SECTION B — Authorization & Access Control", "1A56DB", [
        ("B101","User cancels another user's booking","User A gets User B's booking ID → Calls cancel API","403 Forbidden","Critical",""),
        ("B102","User views another user's bookings","Call /api/bookings/mine with wrong user context","Only own bookings returned","Critical",""),
        ("B103","Partner edits another partner's venue","Partner A edits Partner B's turf ID","403 Forbidden","Critical",""),
        ("B104","Partner cancels another partner's booking","Partner A cancels booking for Partner B's turf","403 Forbidden","Critical",""),
        ("B105","User accesses partner-only endpoints","User calls /api/owner/dashboard","403 Forbidden","Critical",""),
        ("B201","User calls admin endpoint","User calls /api/admin/users","403 Forbidden","Critical",""),
        ("B202","Partner calls admin endpoint","Partner calls /api/admin/wallet","403 Forbidden","Critical",""),
        ("B203","Role injection in registration","Register with body {role: admin}","Role should default to user","Critical",""),
        ("B204","Role injection in profile update","PUT /api/auth/profile with {role: admin}","Role not updated","Critical",""),
        ("B205","IDOR on booking ID","Enumerate booking IDs sequentially","Cannot access other users' bookings","Critical",""),
    ]),
    ("SECTION C — Payment Security & Business Logic", "B45309", [
        ("C101","Price manipulation in request","Intercept booking → Change total_price to ₹1","Server validates price against turf price","Critical",""),
        ("C102","Negative price booking","Send total_price: -100 in booking request","Rejected with validation error","Critical",""),
        ("C103","Zero price booking","Send total_price: 0 in booking request","Rejected with validation error","Critical",""),
        ("C104","Razorpay signature bypass","Call /api/bookings/direct with fake payment_id without signature","Booking should NOT be created","Critical",""),
        ("C105","Replay attack on payment","Use same razorpay_payment_id for two bookings","Second booking rejected","Critical",""),
        ("C106","Tampered order amount","Create order for ₹100 → Pay ₹100 → Booking is for ₹1230","Server validates amount matches","Critical",""),
        ("C107","Refund amount manipulation","Cancel booking → Intercept refund → Change amount","Server calculates refund, not client","Critical",""),
        ("C108","Double refund","Cancel booking → Call cancel API twice","Second cancel rejected","High",""),
        ("C109","Refund on non-paid booking","Try to refund a booking with payment_status: unpaid","No refund processed","High",""),
        ("C110","Platform fee bypass","Send booking without platform fee in total","Server adds platform fee server-side","High",""),
        ("C201","Withdraw more than balance","Request withdrawal of ₹10,000 with ₹500 balance","Rejected: insufficient balance","Critical",""),
        ("C202","Negative withdrawal amount","Send amount: -500 in withdrawal request","Rejected with validation error","Critical",""),
        ("C203","Withdraw before check-in","Partner tries to withdraw on-hold amount","Only available balance withdrawable","High",""),
        ("C204","Admin wallet balance accuracy","Make 5 bookings → Check admin wallet total","Sum of all booking amounts matches","High",""),
        ("C205","Partner wallet hold accuracy","Make booking → Check partner hold amount","Hold = total_price - platform_fee - gst","High",""),
        ("C206","Wallet after cancellation","Book → Cancel → Check wallets","Admin wallet debited, partner hold reversed","High",""),
        ("C207","Wallet after check-in","Book → Check-in → Check wallets","Partner balance increased, admin debited","High",""),
    ]),
    ("SECTION D — Slot & Booking Concurrency", "065F46", [
        ("D101","Simultaneous slot booking","Two users book same slot at exact same time","Only one booking succeeds","Critical",""),
        ("D102","Slot lock expiry race","Lock slot → Wait for expiry → Two users book simultaneously","Only one booking succeeds","Critical",""),
        ("D103","Cancel and rebook race","User A cancels → User B books same slot simultaneously","Consistent state, no double booking","High",""),
        ("D104","Multiple slots partial failure","Book 3 slots → Slot 2 fails mid-transaction","All 3 slots rolled back or all succeed","High",""),
        ("D105","Booking during slot lock","Slot locked by User A → User B tries to book","Rejected: slot temporarily locked","High",""),
        ("D201","Slot count matches bookings","Create 5 bookings → Check slot records","5 slot records marked as booked","High",""),
        ("D202","Cancelled booking frees slot","Cancel booking → Check slot record","Slot marked as available","High",""),
        ("D203","Orphaned slot records","Delete a turf → Check slot records","Slots for deleted turf cleaned up","Medium",""),
        ("D204","Slot for non-existent turf","Book slot with invalid turf_id","404 Not Found","High",""),
        ("D205","Slot for non-existent date","Book slot with date 2020-01-01","Rejected: past date","High",""),
    ]),
    ("SECTION E — Input Validation & Injection", "5B21B6", [
        ("E101","Login NoSQL injection","Phone: {$gt:''}, Password: {$gt:''}","Login rejected, not bypassed","Critical",""),
        ("E102","Search NoSQL injection","Search: {$where: sleep(5000)}","No delay, injection blocked","Critical",""),
        ("E103","Booking ID injection","booking_id: {$ne: null}","Rejected or no data leak","Critical",""),
        ("E104","User ID injection","user_id: {$gt:''} in API body","Rejected with validation error","Critical",""),
        ("E105","Operator injection in query","GET /api/turfs?city[$gt]=a","Sanitized, no injection","High",""),
        ("E201","XSS in venue name","Create venue with name <script>alert('xss')</script>","Script not executed, sanitized","Critical",""),
        ("E202","XSS in user name","Register with name <img src=x onerror=alert(1)>","Script not executed","Critical",""),
        ("E203","XSS in booking notes","Add notes with <script>document.cookie</script>","Script not executed","Critical",""),
        ("E204","XSS in search query","Search <script>alert(1)</script>","Script not executed","High",""),
        ("E205","Stored XSS in review","Submit review with script tag","Script not executed when displayed","Critical",""),
        ("E301","Phone exactly 10 digits","Register with 10-digit phone","Accepted","Medium",""),
        ("E302","Phone 9 digits","Register with 9-digit phone","Rejected","Medium",""),
        ("E303","Phone 11 digits","Register with 11-digit phone","Rejected","Medium",""),
        ("E304","Price = 0","Create venue with price 0","Rejected","High",""),
        ("E305","Price = 1","Create venue with price ₹1","Accepted (minimum valid)","Medium",""),
        ("E306","Price = 99999","Create venue with price ₹99,999","Accepted","Medium",""),
        ("E307","Price = -1","Create venue with negative price","Rejected","High",""),
        ("E308","Book 0 slots","Submit booking with empty time_slots array","Rejected","High",""),
        ("E309","Book 20 slots","Submit booking with 20 time slots","Accepted or max limit enforced","Medium",""),
        ("E310","Name = 1 character","Register with single character name","Accepted or minimum enforced","Low",""),
        ("E311","Name = 255 characters","Register with 255-char name","Accepted or max enforced","Low",""),
        ("E312","Empty string fields","Send {name: ''} in registration","Rejected with validation","High",""),
    ]),
    ("SECTION F — API Contract Testing", "374151", [
        ("F101","Login response structure","POST /api/auth/password-login","Returns {user: {}, token: ''}","High",""),
        ("F102","User object no password","Login → Check user object","No password field in response","Critical",""),
        ("F103","Booking response structure","POST /api/bookings/direct","Returns booking with all required fields","High",""),
        ("F104","Turf list response","GET /api/turfs","Returns array of turf objects","Medium",""),
        ("F105","Error response structure","Trigger any error","Returns {msg: '...'} consistently","Medium",""),
        ("F106","404 for missing resource","GET /api/turfs/nonexistent-id","Returns 404 with message","Medium",""),
        ("F107","400 for bad request","POST with missing required fields","Returns 400 with validation message","Medium",""),
        ("F108","500 handling","Simulate DB disconnect → Call API","Returns 500, no stack trace exposed","High",""),
        ("F109","Content-Type header","All API responses","Content-Type: application/json","Low",""),
        ("F110","CORS headers","Call API from different origin","Correct CORS headers returned","High",""),
        ("F201","DELETE on booking","DELETE /api/bookings/:id","404 or 405 Method Not Allowed","Medium",""),
        ("F202","GET on POST-only endpoint","GET /api/bookings/direct","404 or 405","Medium",""),
        ("F203","PUT on create endpoint","PUT /api/auth/register-password","404 or 405","Medium",""),
        ("F204","PATCH on booking","PATCH /api/bookings/:id with status","Only authorized fields updated","High",""),
    ]),
    ("SECTION G — Performance & Load Testing", "1A56DB", [
        ("G101","Home page load time","Open site, measure load time","< 3 seconds on 4G","High",""),
        ("G102","Venue list API response","GET /api/turfs","< 500ms response time","High",""),
        ("G103","Booking creation time","POST /api/bookings/direct","< 2 seconds end-to-end","High",""),
        ("G104","Login response time","POST /api/auth/password-login","< 1 second","Medium",""),
        ("G105","Dashboard load time","Partner dashboard initial load","< 3 seconds","Medium",""),
        ("G201","10 concurrent logins","Send 10 simultaneous login requests","All succeed within 3 seconds","High",""),
        ("G202","20 concurrent venue views","20 simultaneous GET /api/turfs","All return 200 within 2 seconds","High",""),
        ("G203","5 concurrent bookings different slots","5 users book different slots simultaneously","All 5 bookings succeed","High",""),
        ("G204","5 concurrent bookings same slot","5 users book same slot simultaneously","Only 1 succeeds, 4 get conflict error","Critical",""),
        ("G205","Memory leak check","Run 100 API calls → Check PM2 memory","Memory stays stable, no leak","High",""),
    ]),
    ("SECTION H — Data Integrity & Database", "065F46", [
        ("H101","Booking references valid turf","Create booking → Check turf_id in DB","turf_id references existing turf","High",""),
        ("H102","Booking references valid user","Create booking → Check user_id in DB","user_id references existing user","High",""),
        ("H103","Wallet transaction references booking","Make payment → Check wallet DB","booking_id in wallet transaction is valid","High",""),
        ("H104","Orphaned bookings on user delete","Delete user → Check their bookings","Bookings handled gracefully","Medium",""),
        ("H105","Slot record matches booking","Create booking → Check slot collection","Slot marked as booked correctly","High",""),
        ("H201","Booking status transitions","Confirm → Complete → Try to cancel","Cannot cancel completed booking","High",""),
        ("H202","Payment status consistency","Confirmed booking","payment_status = paid always","High",""),
        ("H203","Refund amount <= total price","Cancel booking","refund_amount never exceeds total_price","Critical",""),
        ("H204","Partner amount + fees = total","Check booking split","platform_fee + gst + partner_amount = total_price","Critical",""),
        ("H205","Wallet balance never negative","Withdraw all balance → Check","Balance = 0, not negative","High",""),
    ]),
    ("SECTION I — File Upload Security", "B45309", [
        ("I101","Upload executable file","Try uploading .exe as venue photo","Rejected: invalid file type","Critical",""),
        ("I102","Upload PHP file","Try uploading .php file","Rejected: invalid file type","Critical",""),
        ("I103","Upload oversized image","Upload 50MB image","Rejected: file too large","High",""),
        ("I104","Upload valid image","Upload 2MB JPG","Accepted and displayed","Medium",""),
        ("I105","Upload SVG with script","Upload SVG containing <script>","Script not executed","Critical",""),
        ("I106","Upload 9 images","Try uploading 9 images (max is 8)","9th image rejected","Medium",""),
        ("I107","Image path traversal","Upload file named ../../etc/passwd","Filename sanitized","Critical",""),
    ]),
    ("SECTION J — Business Logic Edge Cases", "5B21B6", [
        ("J101","Book same slot twice","Book slot → Try booking same slot again","Rejected: already booked","Critical",""),
        ("J102","Book overlapping slots","Book 6-7 AM → Try booking 6-7 AM again","Rejected","Critical",""),
        ("J103","Booking for inactive venue","Deactivate venue → Try to book","Rejected: venue not available","High",""),
        ("J104","Booking with mismatched turf price","Send total_price different from turf price × slots","Server validates or rejects","High",""),
        ("J105","Cancel already cancelled booking","Cancel → Cancel again","Rejected: already cancelled","High",""),
        ("J106","Approve already approved booking","Approve → Approve again","Rejected: not pending","Medium",""),
        ("J107","Reject already rejected booking","Reject → Reject again","Rejected: not pending","Medium",""),
        ("J108","Check-in future booking","Try check-in on booking 3 days in future","Allowed or restricted by policy","Medium",""),
        ("J201","Partner adds venue for another owner","Partner A creates venue with owner_id of Partner B","Venue assigned to Partner A only","Critical",""),
        ("J202","Partner views another partner's earnings","Partner A calls earnings API with Partner B's ID","Only Partner A's earnings returned","Critical",""),
        ("J203","Partner with no venues","New partner with 0 venues views dashboard","Empty state shown, no errors","Medium",""),
        ("J204","Partner with 10+ venues","Partner with many venues views dashboard","All venues load correctly","Medium",""),
        ("J205","Deactivate venue with active bookings","Deactivate venue with upcoming bookings","Warning shown or bookings preserved","High",""),
    ]),
    ("SECTION K — Mobile & Cross-Browser", "374151", [
        ("K101","Chrome desktop","Full booking flow on Chrome","Works correctly","High",""),
        ("K102","Firefox desktop","Full booking flow on Firefox","Works correctly","High",""),
        ("K103","Safari desktop","Full booking flow on Safari","Works correctly","High",""),
        ("K104","Chrome mobile (Android)","Full booking flow on Android Chrome","Works correctly","High",""),
        ("K105","Safari mobile (iOS)","Full booking flow on iPhone Safari","Works correctly","High",""),
        ("K106","Razorpay on mobile","Complete payment on mobile","Razorpay popup works on mobile","Critical",""),
        ("K107","Slot selection on touch","Select slots on touchscreen","Touch events work correctly","High",""),
        ("K108","Keyboard navigation","Navigate site using only keyboard","All interactive elements reachable","Medium",""),
        ("K109","Zoom to 200%","Zoom browser to 200%","Layout doesn't break","Medium",""),
        ("K110","Print page","Print any page","Reasonable print layout","Low",""),
    ]),
    ("SECTION L — Regression Testing", "991B1B", [
        ("REG01","Core booking flow","Register → Browse → Book → Pay","End-to-end works","Critical",""),
        ("REG02","Partner receives booking","Book → Check partner dashboard","Booking appears in partner dashboard","Critical",""),
        ("REG03","Admin wallet updated","Book → Check admin wallet","Admin wallet credited","Critical",""),
        ("REG04","Cancel and refund","Book → Cancel → Check refund","Refund processed correctly","Critical",""),
        ("REG05","Login still works","Login with existing account","Login succeeds","Critical",""),
        ("REG06","Venue list loads","Open explore page","Venues listed","Critical",""),
        ("REG07","Partner login works","Login to partner dashboard","Dashboard loads","Critical",""),
        ("REG08","Admin login works","Login to admin dashboard","Dashboard loads","Critical",""),
    ]),
]

def build_advanced_excel():
    wb = openpyxl.Workbook()

    # ── Cover Sheet ──
    ws_cover = wb.active
    ws_cover.title = "Cover"
    ws_cover.sheet_view.showGridLines = False
    ws_cover.column_dimensions["A"].width = 70

    ws_cover["A1"] = "TurfX"
    ws_cover["A1"].font = Font(bold=True, size=28, color=GREEN_DARK)
    ws_cover["A2"] = "Advanced QA Testing Guide — Security & Performance"
    ws_cover["A2"].font = Font(bold=True, size=18, color="374151")
    ws_cover["A3"] = "Site: https://turfx.metaqode.co.in"
    ws_cover["A3"].font = Font(size=12, color="6B7280")
    ws_cover["A4"] = "Total Test Cases: 156"
    ws_cover["A4"].font = Font(size=12, color="6B7280")
    ws_cover["A5"] = "Level: Advanced / Senior QA"
    ws_cover["A5"].font = Font(size=12, color="6B7280")
    ws_cover["A6"] = "Date: May 2026"
    ws_cover["A6"].font = Font(size=12, color="6B7280")
    ws_cover["A7"] = "Confidential — For Internal QA Use Only"
    ws_cover["A7"].font = Font(size=12, color="991B1B", bold=True)

    ws_cover["A9"] = "Severity Definitions"
    ws_cover["A9"].font = Font(bold=True, size=14, color=GREEN_DARK)
    sev = [
        ("Severity", "Definition", "SLA to Fix"),
        ("Critical", "App crashes, payment fails, data loss", "Fix within 4 hours"),
        ("High", "Feature broken, major flow blocked", "Fix within 24 hours"),
        ("Medium", "Feature works but with issues", "Fix within 3 days"),
        ("Low", "UI/UX issues, minor cosmetic bugs", "Fix in next sprint"),
    ]
    sev_colors = [GREEN_DARK, "FEE2E2", "FEF3C7", BLUE_LIGHT, GREEN_MID]
    sev_fonts  = [GREEN_LIGHT, "991B1B", "B45309", "1D4ED8", "065F46"]
    for i, (row, bg, fg) in enumerate(zip(sev, sev_colors, sev_fonts), 10):
        for j, val in enumerate(row, 1):
            c = ws_cover.cell(row=i, column=j, value=val)
            c.fill = make_fill(bg)
            c.font = Font(bold=(i==10), color=fg, size=10)
            c.border = make_border()

    # ── All Test Cases Sheet ──
    ws = wb.create_sheet("All Test Cases")
    ws.sheet_view.showGridLines = False
    cols = ["Test ID", "Test Case", "Steps", "Expected Result", "Severity", "Status", "Notes"]
    set_col_widths(ws, [10, 35, 55, 45, 12, 12, 25])
    ws.row_dimensions[1].height = 30

    SEV_COLORS = {
        "Critical": "FEE2E2",
        "High":     "FEF3C7",
        "Medium":   BLUE_LIGHT,
        "Low":      GREEN_MID,
        "":         WHITE,
    }

    row_idx = 1
    for module_name, color, cases in ADVANCED_MODULES:
        section_header(ws, row_idx, f"  {module_name}", len(cols), bg=color, fg=WHITE)
        row_idx += 1
        header_row(ws, cols, row=row_idx, bg="F3F4F6", fg="374151", size=10)
        row_idx += 1
        for case in cases:
            sev = case[4] if len(case) > 4 else ""
            bg = SEV_COLORS.get(sev, WHITE)
            data_row(ws, row_idx, list(case) + [""], bg=bg)
            ws.row_dimensions[row_idx].height = 40
            row_idx += 1
        row_idx += 1

    # ── Summary Sheet ──
    ws_sum = wb.create_sheet("Summary")
    ws_sum.sheet_view.showGridLines = False
    set_col_widths(ws_sum, [45, 10, 10, 10, 12, 20])
    header_row(ws_sum, ["Section", "Total", "Pass", "Fail", "Blocked", "Notes"], row=1)
    total = 0
    for i, (name, color, cases) in enumerate(ADVANCED_MODULES, 2):
        bg = GREEN_MID if i % 2 == 0 else WHITE
        data_row(ws_sum, i, [name.split(" — ")[1], len(cases), "", "", "", ""], bg=bg)
        total += len(cases)
    last = len(ADVANCED_MODULES) + 2
    for col in range(1, 7):
        ws_sum.cell(row=last, column=col).fill = make_fill(GREEN_DARK)
        ws_sum.cell(row=last, column=col).font = Font(bold=True, color=GREEN_LIGHT)
        ws_sum.cell(row=last, column=col).border = make_border()
    ws_sum.cell(row=last, column=1, value="TOTAL")
    ws_sum.cell(row=last, column=2, value=total)

    wb.save("TurfX_Advanced_Testing_Guide.xlsx")
    print("✅ TurfX_Advanced_Testing_Guide.xlsx created")

build_advanced_excel()
print("\n🎉 Both Excel files generated successfully!")
print("📁 TurfX_Basic_Testing_Guide.xlsx")
print("📁 TurfX_Advanced_Testing_Guide.xlsx")
