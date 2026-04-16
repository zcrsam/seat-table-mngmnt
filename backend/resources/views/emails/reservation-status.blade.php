<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservation Status - The Bellevue Manila</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 40px 20px;
            background: #F5F1EB;
            font-family: Helvetica, Arial, sans-serif;
            color: #111111;
        }
        .wrap {
            width: 100%;
            max-width: 660px;
            margin: 0 auto;
        }
        .card {
            background: #ffffff;
            border: 1px solid #D8D4CC;
            border-radius: 12px;
            overflow: hidden;
        }
        .header {
            background: #F7F3EA;
            border-bottom: 1px solid #D8D4CC;
            padding: 28px 32px 22px;
            text-align: center;
        }
        .brand {
            margin: 0 0 10px;
            font-size: 8px;
            letter-spacing: 3px;
            color: #B8902A;
            font-weight: 700;
            text-transform: uppercase;
        }
        h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #000000;
        }
        .content {
            padding: 36px 48px 32px;
            text-align: center;
        }
        .badge {
            display: inline-block;
            padding: 10px 40px;
            border-radius: 20px;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0.1em;
            margin-bottom: 28px;
        }
        .badge-pending {
            background: #FFE0AA;
            border: 2px solid #FFB900;
            color: #000000;
        }
        .badge-approved,
        .badge-reserved {
            background: rgba(15,186,129,0.15);
            border: 2px solid #0FBA81;
            color: #084D38;
        }
        .badge-rejected {
            background: rgba(224,82,82,0.13);
            border: 2px solid #E05252;
            color: #7A1E1E;
        }
        .badge-cancelled {
            background: rgba(142, 107, 42, 0.12);
            border: 2px solid #8C6B2A;
            color: #5A431A;
        }
        .reference-label {
            margin: 0 0 4px;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #888888;
            text-transform: uppercase;
        }
        .reference-code {
            margin: 0 0 16px;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: #000000;
        }
        .divider {
            height: 1px;
            background: #D8D4CC;
            margin: 0 0 24px;
        }
        .message {
            margin: 0 0 32px;
            font-size: 12px;
            font-weight: 600;
            line-height: 26px;
            letter-spacing: 0.05em;
            color: #000000;
            text-align: center;
        }
        .details {
            width: 100%;
            max-width: 560px;
            margin: 0 auto;
            border-collapse: collapse;
            text-align: left;
        }
        .details td {
            padding: 6px 0;
            font-size: 12px;
            vertical-align: top;
        }
        .label {
            font-weight: 700;
            color: #000000;
            width: 50%;
        }
        .value {
            font-weight: 400;
            color: #333333;
        }
        .footer {
            background: #F7F3EA;
            border-top: 1px solid #D8D4CC;
            padding: 18px 24px;
            text-align: center;
        }
        .footer p {
            margin: 0;
            font-size: 12px;
            color: #A09880;
            line-height: 1.7;
        }
        .footer strong { color: #B8902A; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="card">
            <div class="header">
                <p class="brand">The Bellevue Manila</p>
                <h1>Reservation Update</h1>
            </div>

            <div class="content">
                <div class="badge badge-{{ $displayStatus ?? $status }}">{{ $statusText }}</div>

                <div class="divider"></div>

                <p class="message">
                    @if($status === 'pending')
                        Your reservation has been received and is currently pending review. Our team will process your request shortly and you will receive another email once a decision has been made.
                    @elseif($status === 'approved' || $status === 'reserved')
                        Great news! Your reservation has been approved and confirmed. Please arrive at least 15 minutes before your scheduled time.
                    @elseif($status === 'rejected')
                        We regret to inform you that we are unable to accommodate your reservation at this time.
                        @if(!empty($rejectionReason))
                            <br><br>
                            Reason: <strong>{{ $rejectionReason }}</strong>
                        @endif
                    @elseif($status === 'cancelled')
                        This email confirms that your reservation has been cancelled based on your request.
                        @if(!empty($rejectionReason))
                            <br><br>
                            Cancellation note: <strong>{{ $rejectionReason }}</strong>
                        @endif
                    @endif
                </p>

                <table class="details" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td class="label">Name</td>
                        <td class="value">{{ $reservation->name ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="label">Email</td>
                        <td class="value">{{ $reservation->email ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td class="label">Venue</td>
                        <td class="value">{{ $reservation->room ?? ($reservation->venue->name ?? ($reservation->venue ?? 'N/A')) }}</td>
                    </tr>
                    <tr>
                        <td class="label">Event Date</td>
                        <td class="value">
                            @if(!empty($reservation->event_date))
                                {{ \Carbon\Carbon::parse($reservation->event_date)->format('F j, Y') }}
                            @else
                                N/A
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td class="label">Event Time</td>
                        <td class="value">
                            @if(!empty($reservation->event_time))
                                {{ \Carbon\Carbon::parse($reservation->event_time)->format('g:i A') }}
                            @else
                                N/A
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td class="label">Guests</td>
                        <td class="value">{{ $reservation->guests_count ?? $reservation->guests ?? 'N/A' }} pax</td>
                    </tr>
                    @if(!empty($reservation->table_number) || !empty($reservation->table))
                    <tr>
                        <td class="label">Table</td>
                        <td class="value">{{ $reservation->table_number ?? $reservation->table ?? 'N/A' }}</td>
                    </tr>
                    @endif
                    @if(!empty($reservation->seat_number) || !empty($reservation->seat))
                    <tr>
                        <td class="label">Seat</td>
                        <td class="value">{{ $reservation->seat_number ?? $reservation->seat ?? 'N/A' }}</td>
                    </tr>
                    @endif
                    @if(!empty($reservation->special_requests))
                    <tr>
                        <td class="label">Special Requests</td>
                        <td class="value">{{ $reservation->special_requests }}</td>
                    </tr>
                    @endif
                </table>
            </div>

            <div class="footer">
                <p>
                    <strong>The Bellevue Manila</strong><br>
                    North Bridgeway, Filinvest City, Alabang, Muntinlupa<br>
                    For inquiries, please contact our reservations desk.<br><br>
                    © {{ date('Y') }} The Bellevue Manila. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
