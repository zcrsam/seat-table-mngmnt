<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservation Status – The Bellevue Manila</title>
</head>
<body style="margin:0;padding:40px 20px;background:#F5F1EB;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td align="center">
            <table width="660" cellpadding="0" cellspacing="0" border="0" style="max-width:660px;width:100%;background:#ffffff;border:1px solid #8C8C8C;border-radius:10px;overflow:hidden;">

                <!-- Header -->
                <tr>
                    <td align="center" style="background:#F7F3EA;border-bottom:1px solid #8C8C8C;padding:28px 32px 22px;">
                        <p style="margin:0 0 10px;font-size:8px;letter-spacing:3px;color:#B8902A;font-weight:700;text-transform:uppercase;">THE BELLEVUE MANILA</p>
                        <h1 style="margin:0;font-size:20px;font-weight:700;letter-spacing:0.1em;color:#000000;">Reservation Update</h1>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td align="center" style="padding:36px 48px 32px;">

                        <!-- Status Badge -->
                        @if($status === 'pending')
                        <div style="display:inline-block;padding:10px 40px;border-radius:20px;font-size:15px;font-weight:700;letter-spacing:0.1em;background:#FFE0AA;border:2px solid #FFB900;color:#000000;margin-bottom:28px;">
                            Status: {{ $statusText }}
                        </div>
                        @elseif($status === 'approved')
                        <div style="display:inline-block;padding:10px 40px;border-radius:20px;font-size:15px;font-weight:700;letter-spacing:0.1em;background:rgba(15,186,129,0.15);border:2px solid #0FBA81;color:#084D38;margin-bottom:28px;">
                            Status: {{ $statusText }}
                        </div>
                        @elseif($status === 'rejected')
                        <div style="display:inline-block;padding:10px 40px;border-radius:20px;font-size:15px;font-weight:700;letter-spacing:0.1em;background:rgba(224,82,82,0.13);border:2px solid #E05252;color:#7A1E1E;margin-bottom:28px;">
                            Status: {{ $statusText }}
                        </div>
                        @endif

                        <!-- Reference Code -->
                        <p style="margin:0 0 4px;font-size:8px;font-weight:700;letter-spacing:2px;color:#888888;text-transform:uppercase;">Reference Code:</p>
                        <p style="margin:0 0 16px;font-size:8px;font-weight:700;letter-spacing:0.1em;color:#000000;">{{ $reservation->reference_code ?? $reservation->id ?? 'N/A' }}</p>

                        <!-- Divider -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                            <tr><td style="height:1px;background:#D8D4CC;font-size:0;line-height:0;">&nbsp;</td></tr>
                        </table>

                        <!-- Status Message -->
                        <p style="margin:0 0 32px;font-size:12px;font-weight:600;line-height:26px;letter-spacing:0.05em;color:#000000;text-align:center;">
                            @if($status === 'pending')
                                Your reservation has been received and is currently pending review. Our team will process
                                your request shortly and you will receive another email once a decision has been made.
                                Thank you for your patience.
                            @elseif($status === 'approved')
                                Great news! Your reservation has been approved and confirmed.
                                Please arrive at least 15 minutes before your scheduled time. We look forward
                                to welcoming you to The Bellevue Manila.
                            @elseif($status === 'rejected')
                                We regret to inform you that we are unable to accommodate your reservation at
                                this time due to availability constraints. Please contact our reservations desk
                                directly so we can assist you in finding a suitable alternative.
                                @if(!empty($reservation->rejection_reason))
                                <br><br>
                                <strong>Reason:</strong> {{ $reservation->rejection_reason }}
                                @endif
                            @endif
                        </p>

                        <!-- Details Grid using table -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;">
                            <tr>
                                <td style="padding:6px 0;font-size:12px;font-weight:700;color:#000;width:50%;">
                                    Name: <span style="font-weight:400;color:#333;">{{ $reservation->name ?? '—' }}</span>
                                </td>
                                <td style="padding:6px 0;font-size:12px;font-weight:700;color:#000;width:50%;">
                                    Event Date: <span style="font-weight:400;color:#333;">
                                        @if(!empty($reservation->event_date))
                                            {{ \Carbon\Carbon::parse($reservation->event_date)->format('F j, Y') }}
                                        @else —
                                        @endif
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:6px 0;font-size:12px;font-weight:700;color:#000;">
                                    Venue: <span style="font-weight:400;color:#333;">{{ $reservation->room ?? ($reservation->venue->name ?? ($reservation->venue ?? '—')) }}</span>
                                </td>
                                <td style="padding:6px 0;font-size:12px;font-weight:700;color:#000;">
                                    Event Time: <span style="font-weight:400;color:#333;">
                                        @if(!empty($reservation->event_time))
                                            {{ \Carbon\Carbon::parse($reservation->event_time)->format('g:i A') }}
                                        @else —
                                        @endif
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:6px 0;font-size:12px;font-weight:700;color:#000;">
                                    Table <span style="font-weight:400;color:#333;">{{ $reservation->table_number ?? $reservation->table ?? '—' }}</span>
                                    &nbsp; Seat <span style="font-weight:400;color:#333;">{{ $reservation->seat_number ?? $reservation->seat ?? '—' }}</span>
                                </td>
                                <td style="padding:6px 0;font-size:12px;font-weight:700;color:#000;">
                                    Guests: <span style="font-weight:400;color:#333;">{{ $reservation->guests_count ?? $reservation->guests ?? '—' }} pax</span>
                                </td>
                            </tr>
                            @if(!empty($reservation->special_requests))
                            <tr>
                                <td colspan="2" style="padding:6px 0;font-size:16px;font-weight:700;color:#000;">
                                    Special Requests: <span style="font-weight:400;color:#333;">{{ $reservation->special_requests }}</span>
                                </td>
                            </tr>
                            @endif
                        </table>

                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td align="center" style="background:#F7F3EA;border-top:1px solid #D8D4CC;padding:18px 24px;">
                        <p style="margin:0;font-size:12px;color:#A09880;line-height:1.7;">
                            North Bridgeway, Filinvest City, Alabang, Muntinlupa &nbsp;·&nbsp; For inquiries, please contact our reservations desk.<br>
                            © {{ date('Y') }} The Bellevue Manila. All rights reserved.
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>

</body>
</html>