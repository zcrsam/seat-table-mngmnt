<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservation Status - The Bellevue Manila</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            background: #F8F7F4;
            color: #2C2C2C;
            line-height: 1.6;
            padding: 20px;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 14px;
            border: 1px solid #E9ECEF;
            overflow: hidden;
        }

        /* ── Header ── */
        .header {
            background: #8C6B2A;
            color: #FFFFFF;
            padding: 30px 40px;
            text-align: center;
        }

        .brand {
            font-size: 11px;
            letter-spacing: 3px;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 6px;
        }

        .header-title {
            font-size: 22px;
            font-weight: 300;
            letter-spacing: 0.4px;
            margin: 0;
        }

        /* ── Body ── */
        .content {
            padding: 36px 40px;
        }

        .greeting {
            font-size: 15px;
            color: #2C2C2C;
            margin-bottom: 18px;
        }

        .greeting strong {
            font-weight: 700;
        }

        .message-text {
            font-size: 14px;
            line-height: 1.78;
            color: #3a3a3a;
            margin-bottom: 4px;
        }

        .ref-code {
            color: #2C2C2C;
            font-weight: 700;
            font-size: 14px;
        }

        .details-text {
            font-size: 14px;
            line-height: 1.78;
            color: #3a3a3a;
            margin-top: 20px;
        }

        .detail-link {
            color: #2C2C2C;
            font-weight: 700;
        }

        /* ── Status badge ── */
        .status-wrap {
            text-align: center;
            margin-top: 32px;
        }

        .status-badge {
            display: inline-block;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border-radius: 6px;
            padding: 12px 44px;
        }

        .status-pending {
            background: #E8C97A;
            color: #5C3B00;
        }

        .status-approved,
        .status-reserved {
            background: #D4EDDA;
            color: #0F5132;
        }

        .status-rejected {
            background: #F5C2C7;
            color: #721C24;
        }

        /* ── Footer ── */
        .footer {
            background: #F8F7F4;
            border-top: 1px solid #E9ECEF;
            padding: 24px 40px;
            text-align: center;
        }

        .footer-address {
            font-size: 13px;
            color: #6C757D;
            line-height: 1.6;
        }

        .footer-copyright {
            font-size: 12px;
            color: #ADB5BD;
            margin-top: 4px;
        }

        @media (max-width: 600px) {
            body { padding: 10px; }
            .email-container { border-radius: 10px; }
            .header, .content, .footer { padding: 24px; }
        }
    </style>
</head>
<body>
    <div class="email-container">

        {{-- Header --}}
        <div class="header">
            <div class="brand">The Bellevue Manila</div>
            <h1 class="header-title">Reservation Update</h1>
        </div>

        {{-- Content --}}
        <div class="content">

            <p class="greeting">Hi <strong>{{ $reservation->name ?? $name ?? 'Guest' }},</strong></p>

            {{-- Status message --}}
            <p class="message-text">
                @if($status === 'pending')
                    Your reservation has been received and is currently pending review. Our team will process your request shortly and you will receive another email once a decision has been made. Thank you for your patience. Here is your reference code:
                    <span class="ref-code">{{ $reservation->reference_code ?? 'N/A' }}</span>
                @elseif($status === 'approved' || $status === 'reserved')
                    Great news! Your reservation has been approved and confirmed. Please arrive at least 15 minutes before your scheduled time. Thank you for choosing The Bellevue Manila.
                    Here is your reference code: <span class="ref-code">{{ $reservation->reference_code ?? 'N/A' }}</span>
                @elseif($status === 'rejected')
                    We regret to inform you that we are unable to accommodate your reservation at this time.
                    @if(!empty($rejectionReason))
                        <br>Reason: {{ $rejectionReason }}
                    @endif
                    Thank you for your understanding.
                @endif
            </p>

            {{-- Reservation detail sentence --}}
            <p class="details-text">
                Reservation for
                <strong>{{ $reservation->guests_count ?? $reservation->guests ?? 'N/A' }} guest{{ ($reservation->guests_count ?? $reservation->guests ?? 1) != 1 ? 's' : '' }}</strong>
                @if(!empty($reservation->table_number) || !empty($reservation->table))
                    at <span class="detail-link">Table {{ $reservation->table_number ?? $reservation->table ?? 'N/A' }}
                    @if(!empty($reservation->seat_number) || !empty($reservation->seat))
                        Seat {{ $reservation->seat_number ?? $reservation->seat ?? 'N/A' }}
                    @endif
                    </span>
                @endif
                in the
                <span class="detail-link">{{ $reservation->room ?? ($reservation->venue->name ?? ($reservation->venue ?? 'N/A')) }}</span>
                on
                <span class="detail-link">
                    @if(!empty($reservation->event_date))
                        {{ \Carbon\Carbon::parse($reservation->event_date)->format('F j, Y') }}
                    @else
                        N/A
                    @endif
                    @if(!empty($reservation->event_time))
                        at {{ \Carbon\Carbon::parse($reservation->event_time)->format('g:i A') }}
                    @endif
                    .
                </span>
                @if(!empty($reservation->special_requests))
                    <br>Special Requests: {{ $reservation->special_requests }}
                @endif
            </p>

            {{-- Status badge --}}
            <div class="status-wrap">
                <div class="status-badge status-{{ $status }}">
                    STATUS:&nbsp;
                    @if($status === 'pending')
                        PENDING
                    @elseif($status === 'approved' || $status === 'reserved')
                        APPROVED
                    @elseif($status === 'rejected')
                        REJECTED
                    @else
                        {{ strtoupper($status) }}
                    @endif
                </div>
            </div>

        </div>

        {{-- Footer --}}
        <div class="footer">
            <div class="footer-address">
                North Bridgeway, Filinvest City, Alabang, Muntinlupa<br>
                For inquiries, please contact our reservations desk.
            </div>
            <div class="footer-copyright">
                &copy; {{ date('Y') }} The Bellevue Manila. All rights reserved.
            </div>
        </div>

    </div>
</body>
</html>