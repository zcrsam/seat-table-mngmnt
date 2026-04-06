<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservation Status – The Bellevue Manila</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: #F0EDE8;
            padding: 40px 20px;
        }

        .email-wrapper {
            max-width: 520px;
            margin: 0 auto;
        }

        /* ── Card ── */
        .email-container {
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.10);
        }

        /* ── Header ── */
        .header {
            background: #1B2A4A;
            padding: 36px 24px 28px;
            text-align: center;
        }

        .header-logo {
            font-size: 11px;
            letter-spacing: 4px;
            color: #C9A84C;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 6px;
        }

        .header h1 {
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }

        .header p {
            color: rgba(255,255,255,0.55);
            font-size: 13px;
        }

        /* ── Gold divider ── */
        .gold-bar {
            height: 3px;
            background: linear-gradient(90deg, #B8902A, #C9A84C, #E8C96C, #C9A84C, #B8902A);
        }

        /* ── Body ── */
        .content {
            padding: 36px 32px 28px;
            text-align: center;
        }

        /* Status badge */
        .status-badge {
            display: inline-block;
            padding: 6px 18px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 24px;
        }

        .status-pending  { background: rgba(244,158,12,0.10); color: #F49E0C; border: 1px solid rgba(244,158,12,0.35); }
        .status-approved { background: rgba(15,186,129,0.10); color: #0FBA81; border: 1px solid rgba(15,186,129,0.35); }
        .status-rejected { background: rgba(224,82,82,0.10);  color: #E05252; border: 1px solid rgba(224,82,82,0.35); }

        /* Greeting */
        .greeting {
            font-size: 15px;
            color: #1B2A4A;
            font-weight: 600;
            margin-bottom: 8px;
        }

        /* Reference box */
        .ref-box {
            background: #F7F3EA;
            border: 1.5px solid #E0D8C8;
            border-radius: 10px;
            padding: 16px 20px;
            margin: 20px 0;
            text-align: center;
        }

        .ref-label {
            font-size: 9px;
            letter-spacing: 2px;
            color: #9CA3AF;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 4px;
        }

        .ref-code {
            font-size: 22px;
            font-weight: 800;
            color: #1B2A4A;
            letter-spacing: 3px;
        }

        /* Detail table */
        .details-table {
            background: #F9F7F4;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 8px 0;
            border-bottom: 1px solid #EEEBE5;
            font-size: 13px;
            gap: 12px;
        }

        .detail-row:last-child { border-bottom: none; }

        .detail-label {
            color: #9CA3AF;
            font-weight: 500;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .detail-value {
            color: #1B2A4A;
            font-weight: 600;
            text-align: right;
        }

        /* Status message block */
        .status-message {
            border-radius: 8px;
            padding: 14px 18px;
            font-size: 13px;
            line-height: 1.7;
            margin: 20px 0 0;
            text-align: left;
        }

        .message-pending  { background: rgba(244,158,12,0.07); border: 1px solid rgba(244,158,12,0.20); color: #92670A; }
        .message-approved { background: rgba(15,186,129,0.07); border: 1px solid rgba(15,186,129,0.20); color: #0A7A55; }
        .message-rejected { background: rgba(224,82,82,0.07);  border: 1px solid rgba(224,82,82,0.20);  color: #B03030; }

        /* ── Footer ── */
        .footer {
            background: #F7F3EA;
            border-top: 1px solid #E8E3DC;
            padding: 20px 24px;
            text-align: center;
        }

        .footer p {
            color: #A09880;
            font-size: 11px;
            line-height: 1.7;
        }

        .footer strong { color: #C9A84C; }
    </style>
</head>
<body>
<div class="email-wrapper">
    <div class="email-container">

        {{-- ── Header ── --}}
        <div class="header">
            <div class="header-logo">The Bellevue Manila</div>
            <h1>Reservation Update</h1>
            <p>We have an update regarding your booking.</p>
        </div>

        <div class="gold-bar"></div>

        {{-- ── Content ── --}}
        <div class="content">

            <span class="status-badge status-{{ $status }}">{{ $statusText }}</span>

            <p class="greeting">Hello, {{ $reservation->name ?? 'Valued Guest' }}</p>

            {{-- Reference code --}}
            <div class="ref-box">
                <div class="ref-label">Reference Code</div>
                <div class="ref-code">{{ $reservation->reference_code ?? $reservation->id ?? 'N/A' }}</div>
            </div>

            {{-- Reservation details --}}
            <div class="details-table">

                <div class="detail-row">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">{{ $reservation->name ?? '—' }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">{{ $reservation->email ?? '—' }}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Venue</span>
                    <span class="detail-value">
                        {{ $reservation->room ?? ($reservation->venue->name ?? ($reservation->venue ?? '—')) }}
                    </span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Event Date</span>
                    <span class="detail-value">
                        @if(!empty($reservation->event_date))
                            {{ \Carbon\Carbon::parse($reservation->event_date)->format('F j, Y') }}
                        @else
                            —
                        @endif
                    </span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Event Time</span>
                    <span class="detail-value">
                        @if(!empty($reservation->event_time))
                            {{ \Carbon\Carbon::parse($reservation->event_time)->format('g:i A') }}
                        @else
                            —
                        @endif
                    </span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Guests</span>
                    <span class="detail-value">
                        {{ $reservation->guests_count ?? $reservation->guests ?? '—' }} pax
                    </span>
                </div>

                @if(!empty($reservation->table_number) || !empty($reservation->table))
                <div class="detail-row">
                    <span class="detail-label">Table</span>
                    <span class="detail-value">
                        {{ $reservation->table_number ?? $reservation->table ?? '—' }}
                    </span>
                </div>
                @endif

                @if(!empty($reservation->seat_number) || !empty($reservation->seat))
                <div class="detail-row">
                    <span class="detail-label">Seat</span>
                    <span class="detail-value">
                        {{ $reservation->seat_number ?? $reservation->seat ?? '—' }}
                    </span>
                </div>
                @endif

                @if(!empty($reservation->special_requests))
                <div class="detail-row">
                    <span class="detail-label">Special Requests</span>
                    <span class="detail-value">{{ $reservation->special_requests }}</span>
                </div>
                @endif

            </div>

            {{-- Status-specific message --}}
            <div class="status-message message-{{ $status }}">
                @if($status === 'pending')
                    Your reservation has been received and is currently <strong>pending review</strong>.
                    Our team will process your request shortly and you will receive another email
                    once a decision has been made. Thank you for your patience.
                @elseif($status === 'approved')
                    🎉 Great news! Your reservation has been <strong>approved and confirmed</strong>.
                    Please arrive at least 15 minutes before your scheduled time. We look forward
                    to welcoming you to The Bellevue Manila.
                @elseif($status === 'rejected')
                    We regret to inform you that we are unable to accommodate your reservation at
                    this time due to availability constraints. Please contact our reservations desk
                    directly so we can assist you in finding a suitable alternative.
                @endif
            </div>

        </div>

        {{-- ── Footer ── --}}
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