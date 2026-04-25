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
            background: linear-gradient(135deg, #F8F7F4 0%, #F5F1EB 100%);
            color: #2C2C2C;
            line-height: 1.6;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #8C6B2A 0%, #A07D38 100%);
            color: #FFFFFF;
            padding: 32px 40px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="p" patternUnits="userSpaceOnUse" width="4" height="4"><path d="M0,4 L4,0" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23p)"/></svg>');
            opacity: 0.3;
        }
        
        .brand {
            font-size: 11px;
            letter-spacing: 3px;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        
        .title {
            font-size: 24px;
            font-weight: 300;
            letter-spacing: 0.5px;
            margin: 0;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px;
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 24px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 24px;
            transition: all 0.3s ease;
        }
        
        .status-pending {
            background: linear-gradient(135deg, #FFF4E0 0%, #FFE0AA 100%);
            color: #8B4513;
            border: 1px solid #FFB900;
        }
        
        .status-approved {
            background: linear-gradient(135deg, #E8F5E8 0%, #D4EDDA 100%);
            color: #0F5132;
            border: 1px solid #0FBA81;
        }
        
        .status-rejected {
            background: linear-gradient(135deg, #F8D7DA 0%, #F5C2C7 100%);
            color: #721C24;
            border: 1px solid #E05252;
        }
        
        .status-icon {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
        }
        
        .reference-section {
            text-align: center;
            margin: 24px 0;
            padding: 20px;
            background: #F8F9FA;
            border-radius: 12px;
            border: 1px solid #E9ECEF;
        }
        
        .reference-label {
            font-size: 11px;
            color: #6C757D;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        
        .reference-code {
            font-size: 20px;
            font-weight: 700;
            color: #2C2C2C;
            letter-spacing: 1px;
        }
        
        .message-box {
            background: #FFFFFF;
            border: 1px solid #E9ECEF;
            border-left: 4px solid #8C6B2A;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        
        .message-text {
            font-size: 15px;
            line-height: 1.7;
            color: #495057;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 32px 0;
        }
        
        .detail-item {
            background: #F8F9FA;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #E9ECEF;
        }
        
        .detail-label {
            font-size: 12px;
            color: #6C757D;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        
        .detail-value {
            font-size: 16px;
            font-weight: 600;
            color: #2C2C2C;
        }
        
        .footer {
            background: #F8F7F4;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #E9ECEF;
        }
        
        .footer-brand {
            font-size: 18px;
            font-weight: 700;
            color: #8C6B2A;
            margin-bottom: 8px;
        }
        
        .footer-address {
            font-size: 14px;
            color: #6C757D;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        
        .footer-copyright {
            font-size: 12px;
            color: #ADB5BD;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-container {
                border-radius: 12px;
            }
            
            .header, .content, .footer {
                padding: 24px;
            }
            
            .details-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="brand">The Bellevue Manila</div>
            <h1 class="title">Reservation Update</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Status Badge -->
            <div class="status-badge status-{{ $status }}">
                <div class="status-icon"></div>
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
            
            <p>
                @if($status === 'pending')
                    Your reservation has been received and is currently pending review. Our team will process your request shortly and you will receive another email once a decision has been made. Thank you for your patience. Here is your reference code: {{ $reservation->reference_code ?? 'N/A' }}
                @elseif($status === 'approved' || $status === 'reserved')
                    Great news! Your reservation has been approved and confirmed. Please arrive at least 15 minutes before your scheduled time. Thank you for choosing The Bellevue Manila.
                @elseif($status === 'rejected')
                    We regret to inform you that we are unable to accommodate your reservation at this time.
                    @if(!empty($rejectionReason))
                        Reason: {{ $rejectionReason }}
                    @endif
                    Thank you for your understanding.
                @endif
            </p>
            
            <p>
                <strong>Other details:</strong><br>
                Venue: {{ $reservation->room ?? ($reservation->venue->name ?? ($reservation->venue ?? 'N/A')) }}<br>
                Event Time: @if(!empty($reservation->event_time)) {{ \Carbon\Carbon::parse($reservation->event_time)->format('g:i A') }} @else N/A @endif<br>
                @if(!empty($reservation->table_number) || !empty($reservation->table))
                    Table {{ $reservation->table_number ?? $reservation->table ?? 'N/A' }} 
                @endif
                @if(!empty($reservation->seat_number) || !empty($reservation->seat))
                    Seat {{ $reservation->seat_number ?? $reservation->seat ?? 'N/A' }}
                @endif
                Guests: {{ $reservation->guests_count ?? $reservation->guests ?? 'N/A' }} pax<br>
                Event Date: @if(!empty($reservation->event_date)) {{ \Carbon\Carbon::parse($reservation->event_date)->format('F j, Y') }} @else N/A @endif
                @if(!empty($reservation->special_requests))
                    Special Requests: {{ $reservation->special_requests }}
                @endif
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-address">
                North Bridgeway, Filinvest City, Alabang, Muntinlupa<br>
                For inquiries, please contact our reservations desk.
            </div>
            <div class="footer-copyright">
                © {{ date('Y') }} The Bellevue Manila. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
