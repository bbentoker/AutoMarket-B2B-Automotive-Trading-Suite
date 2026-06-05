const counterTestEmailTemplate = () => {
  return `
 <!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/x-icon" href="https://cdn-icons-png.flaticon.com/512/117/117479.png" />

        <title>Weekly Dealer Report Email Template</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f4f6">
            <tr>
                <td align="center" style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 782px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                        <tr>
                            <td height="8" style="background: linear-gradient(to right, #ec4899, #ef4444, #db2777); border-top-left-radius: 12px; border-top-right-radius: 12px; line-height: 0;">&nbsp;</td>
                        </tr>

                        <tr>
                            <td style="padding: 21px 28px;">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                                    <tr>
                                        <td align="center">
                                            <table
                                                border="0"
                                                cellspacing="0"
                                                cellpadding="0"
                                                style="
                                                    display: inline-table;
                                                    background: linear-gradient(to right, #fdf2f8, #fef2f2);
                                                    border-radius: 9999px;
                                                    padding: 8px 14px;
                                                    border: 1px solid #f9a8d4;
                                                    box-shadow: inset 0 0 0 0 transparent, inset 0 0 0 0 transparent, 0 0 0 0 #fff, 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                                                    font-size: 14px;
                                                "
                                            >
                                                <tr>
                                                    <td style="padding: 0 8px 0 0; vertical-align: middle;">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="#be185d"
                                                            stroke-width="2"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            style="display: block;"
                                                        >
                                                            <path
                                                                d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
                                                            />
                                                            <path d="M20 3v4"></path>
                                                            <path d="M22 5h-4"></path>
                                                            <path d="M4 17v2"></path>
                                                            <path d="M5 18H3"></path>
                                                        </svg>
                                                    </td>
                                                    <td style="vertical-align: middle;">
                                                        <p style="font-size: 14px; font-weight: 500; color: #be185d; margin: 0; white-space: nowrap;">
                                                            [Company Name]
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td align="center">
                                            <h1 style="font-size: 2.25rem; font-weight: 700; color: #1f2937; margin: 0; font-family: system-ui; letter-spacing: -0.025em;">
                                                Performance Report
                                            </h1>

                                            <table
                                                border="0"
                                                cellspacing="0"
                                                cellpadding="0"
                                                style="width: 84px; height: 3.5px; background: linear-gradient(to right, #ec4899, #f87171); border-radius: 9999px; opacity: 0.3; margin: 8px auto 0 auto;"
                                            >
                                                <tr>
                                                    <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                </tr>
                                            </table>

                                            <p style="font-size: 14px; font-weight: 400; color: #4a5568; margin: 14px 0; max-width: 680px; width: 76%;">
                                                Hi
                                                <span style="color: #db2777;">(First Name),</span>
                                            </p>

                                            <p style="font-size: 14px; color: #4a5569; line-height: 1.6; margin: 14px auto; max-width: 672px; width: 76%; font-weight: 400;">
                                                Here's your weekly performance report &mdash; a clear summary of how your dealership performed last week. It highlights your key sales figures, shows which vehicles sold the fastest, and
                                                includes personalized vehicle offers from us, based on what's currently working best for you.
                                            </p>

                                            <p style="font-size: 14px; color: #4a5569; line-height: 1.6; margin: 14px auto; max-width: 672px; width: 76%; font-weight: 400;">
                                                These insights are built on publicly available data to support smarter inventory decisions and help you continue driving strong results.
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 35px 0;">
                                    <tr>
                                        <td align="center" style="padding: 20px 16px;">
                                            <table border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <!-- Left Gradient Line -->
                                                    <td style="vertical-align: middle;">
                                                        <table width="167" height="1" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to right, transparent, #d1d5db, #d1d5db);">
                                                            <tr>
                                                                <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                            </tr>
                                                        </table>
                                                    </td>

                                                    <!-- Dots -->
                                                    <td style="vertical-align: middle; padding: 0 16px;">
                                                        <table border="0" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td>
                                                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #ec4899, #f87171); opacity: 0.8;"></div>
                                                                </td>
                                                                <td width="4"></td>
                                                                <td>
                                                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #db2777, #ef4444);"></div>
                                                                </td>
                                                                <td width="4"></td>
                                                                <td>
                                                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #ec4899, #f87171); opacity: 0.8;"></div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>

                                                    <!-- Right Gradient Line -->
                                                    <td style="vertical-align: middle;">
                                                        <table width="167" height="1" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to left, transparent, #d1d5db, #d1d5db);">
                                                            <tr>
                                                                <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                                    <tr>
                                        <td align="center">
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px; border-radius: 10px;">
                                                <tr>
                                                    <td style="padding: 20px;">
                                                        <!-- Header Row -->
                                                        <table border="0" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td style="width: 42px; height: 42px; border-radius: 8px; background: linear-gradient(to bottom right, #475569, #1e293b); text-align: center;">
                                                                    <svg
                                                                        style="vertical-align: middle;"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width="21"
                                                                        height="21"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="#ffffff"
                                                                        stroke-width="2"
                                                                        stroke-linecap="round"
                                                                        stroke-linejoin="round"
                                                                    >
                                                                        <circle cx="12" cy="8" r="7"></circle>
                                                                        <path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.11"></path>
                                                                    </svg>
                                                                </td>
                                                                <td style="padding-left: 12px;">
                                                                    <h2 style="font-size: 0.875rem; /* 14px */ color: oklch(0.21 0.034 264.665); font-weight: inherit; margin: 0; line-height: 22px;">Your Weekly Sales Summary</h2>
                                                                    <p style="font-size: 12px; color: oklch(0.446 0.03 256.802); line-height: 18px; margin: 0;">An overview of your sales activity</p>
                                                                </td>
                                                            </tr>
                                                        </table>

                                                        <!-- Data Table -->
                                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 16px; font-size: 15px; color: #1f2937; border-collapse: collapse;">
                                                            <tr>
                                                                <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #364050;">Metric</td>
                                                                <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #364050;">Last week</td>
                                                                <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #364050;">Week before</td>
                                                                <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #364050;">Change</td>
                                                            </tr>

                                                            <!-- Row 1 -->
                                                            <tr>
                                                                <td style="padding: 14px 8px; font-size: 14px; color: #2d3748; border-bottom: 1px solid oklch(0.967 0.003 264.542);">Cars Sold</td>
                                                                <td style="padding: 14px 8px; font-size: 16px; color: oklch(0.446 0.03 256.802); border-bottom: 1px solid oklch(0.967 0.003 264.542);">18</td>
                                                                <td style="padding: 14px 8px; font-size: 16px; color: oklch(0.446 0.03 256.802); border-bottom: 1px solid oklch(0.967 0.003 264.542);">15</td>
                                                                <td style="padding: 14px 8px; font-size: 14px; color: #2d3748; border-bottom: 1px solid oklch(0.967 0.003 264.542);">
                                                                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #dcfce7; border-radius: 4px;">
                                                                        <tr>
                                                                            <td style="padding: 4px 8px;">
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="12"
                                                                                    height="12"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="#008338"
                                                                                    stroke-width="2"
                                                                                    stroke-linecap="round"
                                                                                    stroke-linejoin="round"
                                                                                >
                                                                                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                                                                    <polyline points="16 7 22 7 22 13"></polyline>
                                                                                </svg>
                                                                                <span style="color: #008338; font-size: 13px; padding: 0 0 0 4px;">+3</span>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>

                                                            <!-- Row 2 -->
                                                            <tr>
                                                                <td style="padding: 14px 8px; font-size: 14px; color: #2d3748; border-bottom: 1px solid oklch(0.967 0.003 264.542);">Avg. Selling Price</td>
                                                                <td style="padding: 14px 8px; font-size: 16px; color: oklch(0.446 0.03 256.802); border-bottom: 1px solid oklch(0.967 0.003 264.542);">€24,300</td>
                                                                <td style="padding: 14px 8px; font-size: 16px; color: oklch(0.446 0.03 256.802); border-bottom: 1px solid oklch(0.967 0.003 264.542);">€23,800</td>
                                                                <td style="padding: 14px 8px; font-size: 14px; color: #2d3748; border-bottom: 1px solid oklch(0.967 0.003 264.542);">
                                                                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #dcfce7; border-radius: 4px;">
                                                                        <tr>
                                                                            <td style="padding: 4px 8px;">
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="12"
                                                                                    height="12"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="#008338"
                                                                                    stroke-width="2"
                                                                                    stroke-linecap="round"
                                                                                    stroke-linejoin="round"
                                                                                >
                                                                                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                                                                    <polyline points="16 7 22 7 22 13"></polyline>
                                                                                </svg>
                                                                                <span style="color: #008338; font-size: 13px; padding: 0 0 0 4px;">+€500</span>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>

                                                            <!-- Row 3 -->
                                                            <tr>
                                                                <td style="padding: 14px 8px; font-size: 14px; color: #2d3748;">Avg. Days to Sell</td>
                                                                <td style="padding: 14px 8px; font-size: 16px; color: oklch(0.446 0.03 256.802);">11.2 days</td>
                                                                <td style="padding: 14px 8px; font-size: 16px; color: oklch(0.446 0.03 256.802);">12.5 days</td>
                                                                <td style="padding: 14px 8px; font-size: 14px; color: #2d3748;">
                                                                    <table cellpadding="0" cellspacing="0" border="0" style="background-color: #dcfce7; border-radius: 4px;">
                                                                        <tr>
                                                                            <td style="padding: 4px 8px;">
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="12"
                                                                                    height="12"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="#008338"
                                                                                    stroke-width="2"
                                                                                    stroke-linecap="round"
                                                                                    stroke-linejoin="round"
                                                                                >
                                                                                    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                                                                                    <polyline points="16 17 22 17 22 11"></polyline>
                                                                                </svg>
                                                                                <span style="color: #008338; font-size: 13px; padding: 0 0 0 4px;">-1.3 days</span>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                        <!-- End Table -->
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                                    <tr>
                                        <td align="center" style="padding: 20px 16px;">
                                            <table border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <!-- Left Gradient Line -->
                                                    <td style="vertical-align: middle;">
                                                        <table width="167" height="1" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to right, transparent, #d1d5db, #d1d5db);">
                                                            <tr>
                                                                <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                            </tr>
                                                        </table>
                                                    </td>

                                                    <!-- Dots -->
                                                    <td style="vertical-align: middle; padding: 0 16px;">
                                                        <table border="0" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td>
                                                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #ec4899, #f87171); opacity: 0.8;"></div>
                                                                </td>
                                                                <td width="4"></td>
                                                                <td>
                                                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #db2777, #ef4444);"></div>
                                                                </td>
                                                                <td width="4"></td>
                                                                <td>
                                                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #ec4899, #f87171); opacity: 0.8;"></div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>

                                                    <!-- Right Gradient Line -->
                                                    <td style="vertical-align: middle;">
                                                        <table width="167" height="1" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to left, transparent, #d1d5db, #d1d5db);">
                                                            <tr>
                                                                <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                                    <tr>
                                        <td style="padding-bottom: 24px;">
                                            <table border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td style="width: 42px; height: 42px; border-radius: 8px; background: linear-gradient(to bottom right, #475569, #1e293b); text-align: center;">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="21"
                                                            style="vertical-align: middle;"
                                                            height="21"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="#ffffff"
                                                            stroke-width="2"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                        >
                                                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                                            <polyline points="16 7 22 7 22 13"></polyline>
                                                        </svg>
                                                    </td>
                                                    <td style="padding-left: 12px;">
                                                        <h2 style="font-size: 0.875rem; /* 14px */ color: oklch(0.21 0.034 264.665); font-weight: inherit; margin: 0; line-height: 22px;">Your Fastest-Selling Cars Last Week</h2>
                                                        <p style="font-size: 12px; color: oklch(0.446 0.03 256.802); line-height: 18px; margin: 0;">Exclusive Offers Based on Your Successful Sales</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr
                                        style="border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); transition: box-shadow 0.2s ease-in-out;"
                                        onmouseout="this.style.boxShadow='rgba(0, 0, 0, 0.16) 0px 1px 4px'"
                                        onmouseover="this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.1)'"
                                    >
                                        <td>
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 21px; border-bottom: 1px solid #e2e8f0;">
                                                <tr>
                                                    <td colspan="2">
                                                        <table border="0" style="margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td align="center" valign="middle">
                                                                    <span
                                                                        style="
                                                                            display: inline-block;
                                                                            width: 28px;
                                                                            height: 28px;
                                                                            background: linear-gradient(to bottom right, #334155, #1e293b);
                                                                            border-radius: 6px;
                                                                            font-size: 12px;
                                                                            font-weight: 600;
                                                                            color: #ffffff;
                                                                            text-align: center;
                                                                            line-height: 28px;
                                                                            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                                                                        "
                                                                    >
                                                                        1
                                                                    </span>
                                                                </td>

                                                                <td style="padding-left: 12px; vertical-align: top;">
                                                                    <p style="font-size: 18px; font-weight: 500; color: #1f2937; margin: 0; line-height: 18px;">
                                                                        Sold in: 11 days
                                                                    </p>
                                                                    <p style="font-size: 12px; color: #e60076; margin: 4px 0 0 0; line-height: 16px;">
                                                                        High-demand car that sold quickly
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                    <td align="right" valign="center">
                                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-spacing: 0; display: inline-table;">
                                                            <tr>
                                                                <td style="padding: 5px 8px; background: #fce7f3; border: 1px solid #fbcfe8; border-radius: 8px; white-space: nowrap; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08);">
                                                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                                        <tr>
                                                                            <td style="vertical-align: middle;">
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="12"
                                                                                    height="12"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="#9d174d"
                                                                                    stroke-width="2"
                                                                                    stroke-linecap="round"
                                                                                    stroke-linejoin="round"
                                                                                >
                                                                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                                                                </svg>
                                                                            </td>
                                                                            <td style="padding-left: 6px; font-size: 14px; font-weight: 400; color: #9d174d; font-family: Arial, sans-serif;">
                                                                                Very High Demand
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td valign="top">
                                                        <img
                                                            src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop"
                                                            alt="Car Image"
                                                            style="width: 140px; margin-right: 22px; height: 105px; object-fit: contain; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px; display: block;"
                                                        />
                                                    </td>

                                                    <td style="vertical-align: top;">
                                                        <p style="font-size: 0.875rem; font-weight: 400; color: #1f2937; margin: 18px 0;">BMW 330e xDrive M Sport</p>
                                                        <table border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #364050;">
                                                            <tr>
                                                                <td
                                                                    style="
                                                                        white-space: nowrap;
                                                                        padding: 6px 10px;
                                                                        background-color: #ffffff;
                                                                        border: 1px solid #e2e8f0;
                                                                        border-radius: 8px;
                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.2);
                                                                        font-size: 12px;
                                                                        color: #364050;
                                                                    "
                                                                >
                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="#6b7280"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            style="vertical-align: middle;"
                                                                        >
                                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                        </svg>
                                                                    </span>
                                                                    2021
                                                                </td>
                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                <td
                                                                    style="
                                                                        white-space: nowrap;
                                                                        padding: 6px 10px;
                                                                        background-color: #ffffff;
                                                                        border: 1px solid #e2e8f0;
                                                                        border-radius: 8px;
                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.2);
                                                                        font-size: 12px;
                                                                        color: #364050;
                                                                    "
                                                                >
                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            class="lucide lucide-gauge w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <path d="m12 14 4-4"></path>
                                                                            <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
                                                                        </svg>
                                                                    </span>
                                                                    23,200 km
                                                                </td>
                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                <td
                                                                    style="
                                                                        white-space: nowrap;
                                                                        padding: 6px 10px;
                                                                        background-color: #ffffff;
                                                                        border: 1px solid #e2e8f0;
                                                                        border-radius: 8px;
                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.2);
                                                                        font-size: 12px;
                                                                        color: #364050;
                                                                    "
                                                                >
                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            class="lucide lucide-zap w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <path
                                                                                d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
                                                                            ></path>
                                                                        </svg>
                                                                    </span>
                                                                    292 hp
                                                                </td>
                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                <td
                                                                    style="
                                                                        white-space: nowrap;
                                                                        padding: 6px 10px;
                                                                        background-color: #ffffff;
                                                                        border: 1px solid #e2e8f0;
                                                                        border-radius: 8px;
                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.2);
                                                                        font-size: 12px;
                                                                        color: #364050;
                                                                    "
                                                                >
                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            class="lucide lucide-settings w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <path
                                                                                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                                                                            ></path>
                                                                            <circle cx="12" cy="12" r="3"></circle>
                                                                        </svg>
                                                                    </span>
                                                                    Automatic
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td
                                                        valign="top"
                                                        colspan="3"
                                                        style="padding: 14px 10px; width: 172px; background-color: #f9fafb; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.08); text-align: center;"
                                                    >
                                                        <p style="font-size: 11px; text-align: end; color: #6b7280; margin: 0 0 4px 0;">Advertised Price excl. VAT</p>
                                                        <p style="font-size: 17px; font-weight: 400; line-height: 1.5; text-align: right; color: #1a202c; margin: 0;">&euro;34,500</p>
                                                    </td>
                                                </tr>
                                            </table>
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 0 21px; background-color: #f7fafc; height: 42px;">
                                                <tbody>
                                                    <tr>
                                                        <td align="left" style="width: 33.33%; vertical-align: middle;">
                                                            <p
                                                                style="
                                                                    font-size: 10.5px;
                                                                    font-weight: 500;
                                                                    color: #db2777;
                                                                    margin: 0;
                                                                    background-color: #ffffff;
                                                                    padding: 8px 16px;
                                                                    border-radius: 9999px;
                                                                    border: 1px solid #fbcfe8;
                                                                    display: inline-block;
                                                                    box-shadow: inset 0 0 0 0 transparent, inset 0 0 0 0 transparent, 0 0 0 0 #fff, 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                                                                "
                                                            >
                                                                Based on your successful sale.
                                                            </p>
                                                        </td>

                                                        <td align="center" style="width: 33.33%; padding: 0 16px; vertical-align: middle;">
                                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td style="height: 1px; background-color: #e5e7eb; line-height: 0; font-size: 0;">&nbsp;</td>
                                                                        <td align="center" style="padding: 0 8px;">
                                                                            <table
                                                                                border="0"
                                                                                cellspacing="0"
                                                                                cellpadding="0"
                                                                                style="
                                                                                    background-color: #ffffff;
                                                                                    border-radius: 9999px;
                                                                                    border: 1px solid #fbcfe8;
                                                                                    width: 32px;
                                                                                    height: 30px;
                                                                                    text-align: center;
                                                                                    box-shadow: inset 0 0 0 0 transparent, inset 0 0 0 0 transparent, 0 0 0 0 #fff, 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                                                                                "
                                                                            >
                                                                                <tr>
                                                                                    <td align="center" valign="middle" style="height: 30px; line-height: 30px;">
                                                                                        <span style="display: inline-block; vertical-align: middle; line-height: normal;">
                                                                                            <svg
                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                width="18"
                                                                                                height="18"
                                                                                                viewBox="0 0 24 24"
                                                                                                fill="none"
                                                                                                stroke="#db2777"
                                                                                                stroke-width="2"
                                                                                                stroke-linecap="round"
                                                                                                stroke-linejoin="round"
                                                                                            >
                                                                                                <path d="M12 5v14"></path>
                                                                                                <path d="m19 12-7 7-7-7"></path>
                                                                                            </svg>
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>

                                                                        <td style="background-color: #e5e7eb; line-height: 0; font-size: 0;">&nbsp;</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                        <td align="right" style="width: 33.33%; vertical-align: middle;"></td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fef3f6; padding: 21px; margin-bottom: 24px;">
                                                <!-- Top Section: "Here's a similar car sourced just for you." -->
                                                <tr>
                                                    <td colspan="2">
                                                        <table border="0" style="margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td align="left">
                                                                    <table
                                                                        border="0"
                                                                        cellspacing="0"
                                                                        cellpadding="0"
                                                                        style="width: 28px; height: 28px; background: linear-gradient(to bottom right, #db2777, #ef4444); border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);"
                                                                    >
                                                                        <tr>
                                                                            <td align="center" valign="middle" style="height: 28px; line-height: 28px;">
                                                                                <span style="display: inline-block; vertical-align: middle; line-height: normal;">
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        width="18"
                                                                                        height="18"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="#ffffff"
                                                                                        stroke-width="2"
                                                                                        stroke-linecap="round"
                                                                                        stroke-linejoin="round"
                                                                                    >
                                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                                        <circle cx="12" cy="12" r="6"></circle>
                                                                                        <circle cx="12" cy="12" r="2"></circle>
                                                                                    </svg>
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                                <td style="padding-left: 16px; vertical-align: middle;">
                                                                    <p style="font-size: 14px; font-weight: 400; color: #1f2937; margin: 0; line-height: 18px;">
                                                                        Here's a similar car sourced just for you.
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>

                                                <!-- Main Content Row: Car Details and Price Box -->
                                                <tr>
                                                    <!-- Left Column: Car Image, Title, Specs, Button -->
                                                    <td style="vertical-align: top; width: 70%;">
                                                        <table border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #364050;">
                                                            <tr>
                                                                <!-- Car Image -->
                                                                <td valign="top">
                                                                    <img
                                                                        src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&amp;h=300&amp;fit=crop"
                                                                        alt="BMW 330e xDrive M Sport"
                                                                        style="width: 140px; height: 105px; object-fit: contain; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px; display: block;"
                                                                    />
                                                                </td>

                                                                <!-- Car Title, Specs, Button -->
                                                                <td style="vertical-align: top; padding-left: 22px;">
                                                                    <p style="font-size: 0.875rem; font-weight: 400; color: #1f2937; margin: 18px 0;">BMW 330e xDrive M Sport</p>

                                                                    <!-- Specification Tags -->
                                                                    <table border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #364050; margin-bottom: 30px;">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td
                                                                                    style="
                                                                                        white-space: nowrap;
                                                                                        padding: 6px 10px;
                                                                                        background-color: #ffffff;
                                                                                        border: 1px solid #e2e8f0;
                                                                                        border-radius: 8px;
                                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.05);
                                                                                        font-size: 12px;
                                                                                        color: #364050;
                                                                                    "
                                                                                >
                                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="16"
                                                                                            height="16"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="none"
                                                                                            stroke="#6b7280"
                                                                                            stroke-width="2"
                                                                                            stroke-linecap="round"
                                                                                            stroke-linejoin="round"
                                                                                            style="vertical-align: middle;"
                                                                                        >
                                                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                                        </svg>
                                                                                    </span>
                                                                                    2021
                                                                                </td>
                                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                                <td
                                                                                    style="
                                                                                        white-space: nowrap;
                                                                                        padding: 6px 10px;
                                                                                        background-color: #ffffff;
                                                                                        border: 1px solid #e2e8f0;
                                                                                        border-radius: 8px;
                                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.05);
                                                                                        font-size: 12px;
                                                                                        color: #364050;
                                                                                    "
                                                                                >
                                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="16"
                                                                                            height="16"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="none"
                                                                                            stroke="currentColor"
                                                                                            stroke-width="2"
                                                                                            stroke-linecap="round"
                                                                                            stroke-linejoin="round"
                                                                                            class="lucide lucide-gauge w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                                            aria-hidden="true"
                                                                                        >
                                                                                            <path d="m12 14 4-4"></path>
                                                                                            <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
                                                                                        </svg>
                                                                                    </span>
                                                                                    23,200 km
                                                                                </td>
                                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                                <td
                                                                                    style="
                                                                                        white-space: nowrap;
                                                                                        padding: 6px 10px;
                                                                                        background-color: #ffffff;
                                                                                        border: 1px solid #e2e8f0;
                                                                                        border-radius: 8px;
                                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.05);
                                                                                        font-size: 12px;
                                                                                        color: #364050;
                                                                                    "
                                                                                >
                                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="16"
                                                                                            height="16"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="none"
                                                                                            stroke="currentColor"
                                                                                            stroke-width="2"
                                                                                            stroke-linecap="round"
                                                                                            stroke-linejoin="round"
                                                                                            class="lucide lucide-zap w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                                            aria-hidden="true"
                                                                                        >
                                                                                            <path
                                                                                                d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
                                                                                            ></path>
                                                                                        </svg>
                                                                                    </span>
                                                                                    292 hp
                                                                                </td>
                                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                                <td
                                                                                    style="
                                                                                        white-space: nowrap;
                                                                                        padding: 7px 10px;
                                                                                        background-color: #ffffff;
                                                                                        border: 1px solid #e2e8f0;
                                                                                        border-radius: 8px;
                                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.05);
                                                                                        font-size: 12px;
                                                                                        color: #364050;
                                                                                    "
                                                                                >
                                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="16"
                                                                                            height="16"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="none"
                                                                                            stroke="currentColor"
                                                                                            stroke-width="2"
                                                                                            stroke-linecap="round"
                                                                                            stroke-linejoin="round"
                                                                                            class="lucide lucide-settings w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                                            aria-hidden="true"
                                                                                        >
                                                                                            <path
                                                                                                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                                                                                            ></path>
                                                                                            <circle cx="12" cy="12" r="3"></circle>
                                                                                        </svg>
                                                                                    </span>
                                                                                    Automatic
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>

                                                                    <!-- View Our Offer Button -->
                                                                    <table border="0" cellspacing="0" cellpadding="0" role="presentation">
                                                                        <tr>
                                                                            <td align="left" style="padding: 0;">
                                                                                <!--[if mso]>
                                                                                    <v:roundrect
                                                                                        xmlns:v="urn:schemas-microsoft-com:vml"
                                                                                        xmlns:w="urn:schemas-microsoft-com:office:word"
                                                                                        href="#"
                                                                                        style="height: 40px; v-text-anchor: middle; width: 220px;"
                                                                                        arcsize="10%"
                                                                                        strokecolor="none"
                                                                                        fill="true"
                                                                                    >
                                                                                        <v:fill type="gradient" color="#ec4899" color2="#ef4444" angle="0" />
                                                                                        <w:anchorlock />
                                                                                        <center style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px; font-weight: 500;">
                                                                                            View Our Offer →
                                                                                        </center>
                                                                                    </v:roundrect>
                                                                                <![endif]-->

                                                                                <!--[if !mso]><!-- -->
                                                                                <a href="#" style="text-decoration: none;">
                                                                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(to right, #ec4899, #ef4444); border-radius: 8px;">
                                                                                        <tr>
                                                                                            <td align="center" style="padding: 8px 12px; font-size: 12px; font-weight: 400; color: #ffffff; line-height: 1; white-space: nowrap;">
                                                                                                <span style="display: inline-block; vertical-align: middle; line-height: 1;">
                                                                                                    <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="16"
                                                                                                        height="16"
                                                                                                        style="display: block;"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        fill="none"
                                                                                                        stroke="#ffffff"
                                                                                                        stroke-width="2"
                                                                                                        stroke-linecap="round"
                                                                                                        stroke-linejoin="round"
                                                                                                    >
                                                                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                                                                                        <circle cx="12" cy="12" r="3"></circle>
                                                                                                    </svg>
                                                                                                </span>

                                                                                                <span style="display: inline-block; vertical-align: middle; padding: 0 6px;">View Our Offer</span>

                                                                                                <span style="display: inline-block; vertical-align: middle; line-height: 1;">
                                                                                                    <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="16"
                                                                                                        height="16"
                                                                                                        style="display: block;"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        fill="none"
                                                                                                        stroke="#ffffff"
                                                                                                        stroke-width="2"
                                                                                                        stroke-linecap="round"
                                                                                                        stroke-linejoin="round"
                                                                                                    >
                                                                                                        <path d="M7 7h10v10"></path>
                                                                                                        <path d="M7 17L17 7"></path>
                                                                                                    </svg>
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                                </a>
                                                                                <!--<![endif]-->
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>

                                                    <!-- Right Column: Price Box -->
                                                    <td style="vertical-align: top; text-align: right; width: 30%; padding-top: 100px;">
                                                        <table border="0" cellspacing="0" cellpadding="0" style="margin-left: auto;">
                                                            <tr>
                                                                <td style="padding: 14px; background-color: #f9fafb; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.08); text-align: center;">
                                                                    <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">Price excl. VAT</p>
                                                                    <p style="font-size: 17px; font-weight: 400; line-height: 1.5; text-align: right; color: #1a202c; margin: 0;">€21,900</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                                    <tr
                                        style="border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); transition: box-shadow 0.2s ease-in-out;"
                                        onmouseout="this.style.boxShadow='rgba(0, 0, 0, 0.16) 0px 1px 4px'"
                                        onmouseover="this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.1)'"
                                    >
                                        <td>
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 21px; border-bottom: 1px solid #e2e8f0;">
                                                <tr>
                                                    <td colspan="2">
                                                        <table border="0" style="margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td align="center" valign="middle">
                                                                    <span
                                                                        style="
                                                                            display: inline-block;
                                                                            width: 28px;
                                                                            height: 28px;
                                                                            background: linear-gradient(to bottom right, #334155, #1e293b);
                                                                            border-radius: 6px;
                                                                            font-size: 12px;
                                                                            font-weight: 600;
                                                                            color: #ffffff;
                                                                            text-align: center;
                                                                            line-height: 28px;
                                                                            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                                                                        "
                                                                    >
                                                                        2
                                                                    </span>
                                                                </td>

                                                                <td style="padding-left: 12px; vertical-align: top;">
                                                                    <p style="font-size: 18px; font-weight: 500; color: #1f2937; margin: 0; line-height: 18px;">
                                                                        Sold in: 9 days
                                                                    </p>
                                                                    <p style="font-size: 12px; color: #e60076; margin: 4px 0 0 0; line-height: 16px;">
                                                                        High-demand car that sold quickly
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                    <td align="right" valign="center">
                                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-spacing: 0; display: inline-table;">
                                                            <tr>
                                                                <td style="padding: 5px 8px; background: #ddeaff; border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 8px; white-space: nowrap; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08);">
                                                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                                        <tr>
                                                                            <td style="vertical-align: middle;">
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="12"
                                                                                    height="12"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="#183ab8"
                                                                                    stroke-width="2"
                                                                                    stroke-linecap="round"
                                                                                    stroke-linejoin="round"
                                                                                >
                                                                                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                                                                                    <path d="M18 17V9"></path>
                                                                                    <path d="M13 17V5"></path>
                                                                                    <path d="M8 17v-3"></path>
                                                                                </svg>
                                                                            </td>
                                                                            <td style="padding-left: 6px; font-size: 14px; font-weight: 400; color: #183ab8; font-family: Arial, sans-serif;">
                                                                                High Demand
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td valign="top">
                                                        <img
                                                            src="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop"
                                                            alt="Car Image"
                                                            style="width: 140px; margin-right: 22px; height: 105px; object-fit: contain; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px; display: block;"
                                                        />
                                                    </td>

                                                    <td style="vertical-align: top;">
                                                        <p style="font-size: 0.875rem; font-weight: 400; color: #1f2937; margin: 18px 0;">Audi A4 S Line</p>
                                                        <table border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #364050;">
                                                            <tr>
                                                                <td
                                                                    style="
                                                                        white-space: nowrap;
                                                                        padding: 6px 10px;
                                                                        background-color: #ffffff;
                                                                        border: 1px solid #e2e8f0;
                                                                        border-radius: 8px;
                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.2);
                                                                        font-size: 12px;
                                                                        color: #364050;
                                                                    "
                                                                >
                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="#6b7280"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            style="vertical-align: middle;"
                                                                        >
                                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                        </svg>
                                                                    </span>
                                                                    2020
                                                                </td>
                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                <td
                                                                    style="
                                                                        white-space: nowrap;
                                                                        padding: 6px 10px;
                                                                        background-color: #ffffff;
                                                                        border: 1px solid #e2e8f0;
                                                                        border-radius: 8px;
                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.2);
                                                                        font-size: 12px;
                                                                        color: #364050;
                                                                    "
                                                                >
                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            class="lucide lucide-gauge w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <path d="m12 14 4-4"></path>
                                                                            <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
                                                                        </svg>
                                                                    </span>
                                                                    32,000 km
                                                                </td>
                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                <td
                                                                    style="
                                                                        white-space: nowrap;
                                                                        padding: 6px 10px;
                                                                        background-color: #ffffff;
                                                                        border: 1px solid #e2e8f0;
                                                                        border-radius: 8px;
                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.2);
                                                                        font-size: 12px;
                                                                        color: #364050;
                                                                    "
                                                                >
                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            class="lucide lucide-zap w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <path
                                                                                d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
                                                                            ></path>
                                                                        </svg>
                                                                    </span>
                                                                    245 hp
                                                                </td>
                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                <td
                                                                    style="
                                                                        white-space: nowrap;
                                                                        padding: 6px 10px;
                                                                        background-color: #ffffff;
                                                                        border: 1px solid #e2e8f0;
                                                                        border-radius: 8px;
                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.2);
                                                                        font-size: 12px;
                                                                        color: #364050;
                                                                    "
                                                                >
                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            class="lucide lucide-settings w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <path
                                                                                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                                                                            ></path>
                                                                            <circle cx="12" cy="12" r="3"></circle>
                                                                        </svg>
                                                                    </span>
                                                                    Automatic
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td
                                                        valign="top"
                                                        colspan="3"
                                                        style="padding: 14px 10px; width: 172px; background-color: #f9fafb; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.08); text-align: center;"
                                                    >
                                                        <p style="font-size: 11px; text-align: end; color: #6b7280; margin: 0 0 4px 0;">Advertised Price excl. VAT</p>
                                                        <p style="font-size: 17px; font-weight: 400; line-height: 1.5; text-align: right; color: #1a202c; margin: 0;">&euro;€28,900</p>
                                                    </td>
                                                </tr>
                                            </table>
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 0 21px; background-color: #f7fafc; height: 42px;">
                                                <tbody>
                                                    <tr>
                                                        <td align="left" style="width: 33.33%; vertical-align: middle;">
                                                            <p
                                                                style="
                                                                    font-size: 10.5px;
                                                                    font-weight: 500;
                                                                    color: #db2777;
                                                                    margin: 0;
                                                                    background-color: #ffffff;
                                                                    padding: 8px 16px;
                                                                    border-radius: 9999px;
                                                                    border: 1px solid #fbcfe8;
                                                                    display: inline-block;
                                                                    box-shadow: inset 0 0 0 0 transparent, inset 0 0 0 0 transparent, 0 0 0 0 #fff, 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                                                                "
                                                            >
                                                                Based on your successful sale.
                                                            </p>
                                                        </td>

                                                        <td align="center" style="width: 33.33%; padding: 0 16px; vertical-align: middle;">
                                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td style="height: 1px; background-color: #e5e7eb; line-height: 0; font-size: 0;">&nbsp;</td>
                                                                        <td align="center" style="padding: 0 8px;">
                                                                            <table
                                                                                border="0"
                                                                                cellspacing="0"
                                                                                cellpadding="0"
                                                                                style="
                                                                                    background-color: #ffffff;
                                                                                    border-radius: 9999px;
                                                                                    border: 1px solid #fbcfe8;
                                                                                    width: 32px;
                                                                                    height: 30px;
                                                                                    text-align: center;
                                                                                    box-shadow: inset 0 0 0 0 transparent, inset 0 0 0 0 transparent, 0 0 0 0 #fff, 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                                                                                "
                                                                            >
                                                                                <tr>
                                                                                    <td align="center" valign="middle" style="height: 30px; line-height: 30px;">
                                                                                        <span style="display: inline-block; vertical-align: middle; line-height: normal;">
                                                                                            <svg
                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                width="18"
                                                                                                height="18"
                                                                                                viewBox="0 0 24 24"
                                                                                                fill="none"
                                                                                                stroke="#db2777"
                                                                                                stroke-width="2"
                                                                                                stroke-linecap="round"
                                                                                                stroke-linejoin="round"
                                                                                            >
                                                                                                <path d="M12 5v14"></path>
                                                                                                <path d="m19 12-7 7-7-7"></path>
                                                                                            </svg>
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>

                                                                        <td style="background-color: #e5e7eb; line-height: 0; font-size: 0;">&nbsp;</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                        <td align="right" style="width: 33.33%; vertical-align: middle;"></td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fef3f6; padding: 21px; margin-bottom: 24px;">
                                                <!-- Top Section: "Here's a similar car sourced just for you." -->
                                                <tr>
                                                    <td colspan="2">
                                                        <table border="0" style="margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td align="left">
                                                                    <table
                                                                        border="0"
                                                                        cellspacing="0"
                                                                        cellpadding="0"
                                                                        style="width: 28px; height: 28px; background: linear-gradient(to bottom right, #db2777, #ef4444); border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);"
                                                                    >
                                                                        <tr>
                                                                            <td align="center" valign="middle" style="height: 28px; line-height: 28px;">
                                                                                <span style="display: inline-block; vertical-align: middle; line-height: normal;">
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        width="18"
                                                                                        height="18"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="#ffffff"
                                                                                        stroke-width="2"
                                                                                        stroke-linecap="round"
                                                                                        stroke-linejoin="round"
                                                                                    >
                                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                                        <circle cx="12" cy="12" r="6"></circle>
                                                                                        <circle cx="12" cy="12" r="2"></circle>
                                                                                    </svg>
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                                <td style="padding-left: 16px; vertical-align: middle;">
                                                                    <p style="font-size: 14px; font-weight: 400; color: #1f2937; margin: 0; line-height: 18px;">
                                                                        Here's a similar car sourced just for you.
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>

                                                <!-- Main Content Row: Car Details and Price Box -->
                                                <tr>
                                                    <!-- Left Column: Car Image, Title, Specs, Button -->
                                                    <td style="vertical-align: top; width: 70%;">
                                                        <table border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #364050;">
                                                            <tr>
                                                                <!-- Car Image -->
                                                                <td valign="top">
                                                                    <img
                                                                        src="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop"
                                                                        alt="BMW 330e xDrive M Sport"
                                                                        style="width: 140px; height: 105px; object-fit: contain; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px; display: block;"
                                                                    />
                                                                </td>

                                                                <!-- Car Title, Specs, Button -->
                                                                <td style="vertical-align: top; padding-left: 22px;">
                                                                    <p style="font-size: 0.875rem; font-weight: 400; color: #1f2937; margin: 18px 0;">Audi A4 S Line</p>

                                                                    <!-- Specification Tags -->
                                                                    <table border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #364050; margin-bottom: 30px;">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td
                                                                                    style="
                                                                                        white-space: nowrap;
                                                                                        padding: 6px 10px;
                                                                                        background-color: #ffffff;
                                                                                        border: 1px solid #e2e8f0;
                                                                                        border-radius: 8px;
                                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.05);
                                                                                        font-size: 12px;
                                                                                        color: #364050;
                                                                                    "
                                                                                >
                                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="16"
                                                                                            height="16"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="none"
                                                                                            stroke="#6b7280"
                                                                                            stroke-width="2"
                                                                                            stroke-linecap="round"
                                                                                            stroke-linejoin="round"
                                                                                            style="vertical-align: middle;"
                                                                                        >
                                                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                                        </svg>
                                                                                    </span>
                                                                                    2020
                                                                                </td>
                                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                                <td
                                                                                    style="
                                                                                        white-space: nowrap;
                                                                                        padding: 6px 10px;
                                                                                        background-color: #ffffff;
                                                                                        border: 1px solid #e2e8f0;
                                                                                        border-radius: 8px;
                                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.05);
                                                                                        font-size: 12px;
                                                                                        color: #364050;
                                                                                    "
                                                                                >
                                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="16"
                                                                                            height="16"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="none"
                                                                                            stroke="currentColor"
                                                                                            stroke-width="2"
                                                                                            stroke-linecap="round"
                                                                                            stroke-linejoin="round"
                                                                                            class="lucide lucide-gauge w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                                            aria-hidden="true"
                                                                                        >
                                                                                            <path d="m12 14 4-4"></path>
                                                                                            <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
                                                                                        </svg>
                                                                                    </span>
                                                                                    32,000 km
                                                                                </td>
                                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                                <td
                                                                                    style="
                                                                                        white-space: nowrap;
                                                                                        padding: 6px 10px;
                                                                                        background-color: #ffffff;
                                                                                        border: 1px solid #e2e8f0;
                                                                                        border-radius: 8px;
                                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.05);
                                                                                        font-size: 12px;
                                                                                        color: #364050;
                                                                                    "
                                                                                >
                                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="16"
                                                                                            height="16"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="none"
                                                                                            stroke="currentColor"
                                                                                            stroke-width="2"
                                                                                            stroke-linecap="round"
                                                                                            stroke-linejoin="round"
                                                                                            class="lucide lucide-zap w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                                            aria-hidden="true"
                                                                                        >
                                                                                            <path
                                                                                                d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
                                                                                            ></path>
                                                                                        </svg>
                                                                                    </span>
                                                                                    245 hp
                                                                                </td>
                                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                                <td
                                                                                    style="
                                                                                        white-space: nowrap;
                                                                                        padding: 6px 10px;
                                                                                        background-color: #ffffff;
                                                                                        border: 1px solid #e2e8f0;
                                                                                        border-radius: 8px;
                                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.05);
                                                                                        font-size: 12px;
                                                                                        color: #364050;
                                                                                    "
                                                                                >
                                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="16"
                                                                                            height="16"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="none"
                                                                                            stroke="currentColor"
                                                                                            stroke-width="2"
                                                                                            stroke-linecap="round"
                                                                                            stroke-linejoin="round"
                                                                                            class="lucide lucide-settings w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                                            aria-hidden="true"
                                                                                        >
                                                                                            <path
                                                                                                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                                                                                            ></path>
                                                                                            <circle cx="12" cy="12" r="3"></circle>
                                                                                        </svg>
                                                                                    </span>
                                                                                    Automatic
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>

                                                                    <!-- View Our Offer Button -->
                                                                    <table border="0" cellspacing="0" cellpadding="0" role="presentation">
                                                                        <tr>
                                                                            <td align="left" style="padding: 0;">
                                                                                <!--[if mso]>
                                                                                    <v:roundrect
                                                                                        xmlns:v="urn:schemas-microsoft-com:vml"
                                                                                        xmlns:w="urn:schemas-microsoft-com:office:word"
                                                                                        href="#"
                                                                                        style="height: 40px; v-text-anchor: middle; width: 220px;"
                                                                                        arcsize="10%"
                                                                                        strokecolor="none"
                                                                                        fill="true"
                                                                                    >
                                                                                        <v:fill type="gradient" color="#ec4899" color2="#ef4444" angle="0" />
                                                                                        <w:anchorlock />
                                                                                        <center style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px; font-weight: 500;">
                                                                                            View Our Offer →
                                                                                        </center>
                                                                                    </v:roundrect>
                                                                                <![endif]-->

                                                                                <!--[if !mso]><!-- -->
                                                                                <a href="#" style="text-decoration: none;">
                                                                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(to right, #ec4899, #ef4444); border-radius: 8px;">
                                                                                        <tr>
                                                                                            <td align="center" style="padding: 8px 12px; font-size: 12px; font-weight: 400; color: #ffffff; line-height: 1; white-space: nowrap;">
                                                                                                <span style="display: inline-block; vertical-align: middle; line-height: 1;">
                                                                                                    <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="16"
                                                                                                        height="16"
                                                                                                        style="display: block;"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        fill="none"
                                                                                                        stroke="#ffffff"
                                                                                                        stroke-width="2"
                                                                                                        stroke-linecap="round"
                                                                                                        stroke-linejoin="round"
                                                                                                    >
                                                                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                                                                                        <circle cx="12" cy="12" r="3"></circle>
                                                                                                    </svg>
                                                                                                </span>

                                                                                                <span style="display: inline-block; vertical-align: middle; padding: 0 6px;">View Our Offer</span>

                                                                                                <span style="display: inline-block; vertical-align: middle; line-height: 1;">
                                                                                                    <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="16"
                                                                                                        height="16"
                                                                                                        style="display: block;"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        fill="none"
                                                                                                        stroke="#ffffff"
                                                                                                        stroke-width="2"
                                                                                                        stroke-linecap="round"
                                                                                                        stroke-linejoin="round"
                                                                                                    >
                                                                                                        <path d="M7 7h10v10"></path>
                                                                                                        <path d="M7 17L17 7"></path>
                                                                                                    </svg>
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                                </a>
                                                                                <!--<![endif]-->
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>

                                                    <!-- Right Column: Price Box -->
                                                    <td style="vertical-align: top; text-align: right; width: 30%; padding-top: 100px;">
                                                        <table border="0" cellspacing="0" cellpadding="0" style="margin-left: auto;">
                                                            <tr>
                                                                <td style="padding: 14px; background-color: #f9fafb; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.08); text-align: center;">
                                                                    <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">Price excl. VAT</p>
                                                                    <p style="font-size: 17px; font-weight: 400; line-height: 1.5; text-align: right; color: #1a202c; margin: 0;">€22,400</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                                    <tr
                                        style="border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); transition: box-shadow 0.2s ease-in-out;"
                                        onmouseout="this.style.boxShadow='rgba(0, 0, 0, 0.16) 0px 1px 4px'"
                                        onmouseover="this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.1)'"
                                    >
                                        <td>
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 21px; border-bottom: 1px solid #e2e8f0;">
                                                <tr>
                                                    <td colspan="2">
                                                        <table border="0" style="margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td align="center" valign="middle">
                                                                    <span
                                                                        style="
                                                                            display: inline-block;
                                                                            width: 28px;
                                                                            height: 28px;
                                                                            background: linear-gradient(to bottom right, #334155, #1e293b);
                                                                            border-radius: 6px;
                                                                            font-size: 12px;
                                                                            font-weight: 600;
                                                                            color: #ffffff;
                                                                            text-align: center;
                                                                            line-height: 28px;
                                                                            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                                                                        "
                                                                    >
                                                                        3
                                                                    </span>
                                                                </td>

                                                                <td style="padding-left: 12px; vertical-align: top;">
                                                                    <p style="font-size: 18px; font-weight: 500; color: #1f2937; margin: 0; line-height: 18px;">
                                                                        Sold in: 8 days
                                                                    </p>
                                                                    <p style="font-size: 12px; color: #e60076; margin: 4px 0 0 0; line-height: 16px;">
                                                                        High-demand car that sold quickly
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                    <td align="right" valign="center">
                                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-spacing: 0; display: inline-table;">
                                                            <tr>
                                                                <td style="padding: 5px 8px; background: #fce7f3; border: 1px solid #fbcfe8; border-radius: 8px; white-space: nowrap; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08);">
                                                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                                        <tr>
                                                                            <td style="vertical-align: middle;">
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="12"
                                                                                    height="12"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="#9d174d"
                                                                                    stroke-width="2"
                                                                                    stroke-linecap="round"
                                                                                    stroke-linejoin="round"
                                                                                >
                                                                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                                                                </svg>
                                                                            </td>
                                                                            <td style="padding-left: 6px; font-size: 14px; font-weight: 400; color: #9d174d; font-family: Arial, sans-serif;">
                                                                                Very High Demand
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td valign="top">
                                                        <img
                                                            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=="
                                                            alt="Car Image"
                                                            style="
                                                                width: 140px;
                                                                margin-right: 22px;
                                                                background-color: #f3f4f6;
                                                                height: 105px;
                                                                object-fit: contain;
                                                                border-radius: 8px;
                                                                box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;
                                                                display: block;
                                                            "
                                                        />
                                                    </td>

                                                    <td style="vertical-align: top;">
                                                        <p style="font-size: 0.875rem; font-weight: 400; color: #1f2937; margin: 18px 0;">Mercedes-Benz C-Class AMG Line</p>
                                                        <table border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #364050;">
                                                            <tr>
                                                                <td
                                                                    style="
                                                                        white-space: nowrap;
                                                                        padding: 6px 10px;
                                                                        background-color: #ffffff;
                                                                        border: 1px solid #e2e8f0;
                                                                        border-radius: 8px;
                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.2);
                                                                        font-size: 12px;
                                                                        color: #364050;
                                                                    "
                                                                >
                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="#6b7280"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            style="vertical-align: middle;"
                                                                        >
                                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                        </svg>
                                                                    </span>
                                                                    2019
                                                                </td>
                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                <td
                                                                    style="
                                                                        white-space: nowrap;
                                                                        padding: 6px 10px;
                                                                        background-color: #ffffff;
                                                                        border: 1px solid #e2e8f0;
                                                                        border-radius: 8px;
                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.2);
                                                                        font-size: 12px;
                                                                        color: #364050;
                                                                    "
                                                                >
                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            class="lucide lucide-gauge w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <path d="m12 14 4-4"></path>
                                                                            <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
                                                                        </svg>
                                                                    </span>
                                                                    40,100 km
                                                                </td>
                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                <td
                                                                    style="
                                                                        white-space: nowrap;
                                                                        padding: 6px 10px;
                                                                        background-color: #ffffff;
                                                                        border: 1px solid #e2e8f0;
                                                                        border-radius: 8px;
                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.2);
                                                                        font-size: 12px;
                                                                        color: #364050;
                                                                    "
                                                                >
                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            class="lucide lucide-zap w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <path
                                                                                d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
                                                                            ></path>
                                                                        </svg>
                                                                    </span>
                                                                    255 hp
                                                                </td>
                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                <td
                                                                    style="
                                                                        white-space: nowrap;
                                                                        padding: 6px 10px;
                                                                        background-color: #ffffff;
                                                                        border: 1px solid #e2e8f0;
                                                                        border-radius: 8px;
                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.2);
                                                                        font-size: 12px;
                                                                        color: #364050;
                                                                    "
                                                                >
                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            class="lucide lucide-settings w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <path
                                                                                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                                                                            ></path>
                                                                            <circle cx="12" cy="12" r="3"></circle>
                                                                        </svg>
                                                                    </span>
                                                                    Automatic
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td
                                                        valign="top"
                                                        colspan="3"
                                                        style="padding: 14px 10px; width: 172px; background-color: #f9fafb; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.08); text-align: center;"
                                                    >
                                                        <p style="font-size: 11px; color: #6b7280; text-align: end; margin: 0 0 4px 0;">Advertised Price excl. VAT</p>
                                                        <p style="font-size: 17px; font-weight: 400; line-height: 1.5; text-align: right; color: #1a202c; margin: 0;">€31,200</p>
                                                    </td>
                                                </tr>
                                            </table>
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 0 21px; background-color: #f7fafc; height: 42px;">
                                                <tbody>
                                                    <tr>
                                                        <td align="left" style="width: 33.33%; vertical-align: middle;">
                                                            <p
                                                                style="
                                                                    font-size: 10.5px;
                                                                    font-weight: 500;
                                                                    color: #db2777;
                                                                    margin: 0;
                                                                    background-color: #ffffff;
                                                                    padding: 8px 16px;
                                                                    border-radius: 9999px;
                                                                    border: 1px solid #fbcfe8;
                                                                    display: inline-block;
                                                                    box-shadow: inset 0 0 0 0 transparent, inset 0 0 0 0 transparent, 0 0 0 0 #fff, 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                                                                "
                                                            >
                                                                Based on your successful sale.
                                                            </p>
                                                        </td>

                                                        <td align="center" style="width: 33.33%; padding: 0 16px; vertical-align: middle;">
                                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td style="height: 1px; background-color: #e5e7eb; line-height: 0; font-size: 0;">&nbsp;</td>
                                                                        <td align="center" style="padding: 0 8px;">
                                                                            <table
                                                                                border="0"
                                                                                cellspacing="0"
                                                                                cellpadding="0"
                                                                                style="
                                                                                    background-color: #ffffff;
                                                                                    border-radius: 9999px;
                                                                                    border: 1px solid #fbcfe8;
                                                                                    width: 32px;
                                                                                    height: 30px;
                                                                                    text-align: center;
                                                                                    box-shadow: inset 0 0 0 0 transparent, inset 0 0 0 0 transparent, 0 0 0 0 #fff, 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                                                                                "
                                                                            >
                                                                                <tr>
                                                                                    <td align="center" valign="middle" style="height: 30px; line-height: 30px;">
                                                                                        <span style="display: inline-block; vertical-align: middle; line-height: normal;">
                                                                                            <svg
                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                                width="18"
                                                                                                height="18"
                                                                                                viewBox="0 0 24 24"
                                                                                                fill="none"
                                                                                                stroke="#db2777"
                                                                                                stroke-width="2"
                                                                                                stroke-linecap="round"
                                                                                                stroke-linejoin="round"
                                                                                            >
                                                                                                <path d="M12 5v14"></path>
                                                                                                <path d="m19 12-7 7-7-7"></path>
                                                                                            </svg>
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                            </table>
                                                                        </td>

                                                                        <td style="background-color: #e5e7eb; line-height: 0; font-size: 0;">&nbsp;</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                        <td align="right" style="width: 33.33%; vertical-align: middle;"></td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fef3f6; padding: 21px; margin-bottom: 24px;">
                                                <!-- Top Section: "Here's a similar car sourced just for you." -->
                                                <tr>
                                                    <td colspan="2">
                                                        <table border="0" style="margin-bottom: 24px;" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td align="left">
                                                                    <table
                                                                        border="0"
                                                                        cellspacing="0"
                                                                        cellpadding="0"
                                                                        style="width: 28px; height: 28px; background: linear-gradient(to bottom right, #db2777, #ef4444); border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);"
                                                                    >
                                                                        <tr>
                                                                            <td align="center" valign="middle" style="height: 28px; line-height: 28px;">
                                                                                <span style="display: inline-block; vertical-align: middle; line-height: normal;">
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        width="18"
                                                                                        height="18"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="#ffffff"
                                                                                        stroke-width="2"
                                                                                        stroke-linecap="round"
                                                                                        stroke-linejoin="round"
                                                                                    >
                                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                                        <circle cx="12" cy="12" r="6"></circle>
                                                                                        <circle cx="12" cy="12" r="2"></circle>
                                                                                    </svg>
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                                <td style="padding-left: 16px; vertical-align: middle;">
                                                                    <p style="font-size: 14px; font-weight: 400; color: #1f2937; margin: 0; line-height: 18px;">
                                                                        Here's a similar car sourced just for you.
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>

                                                <!-- Main Content Row: Car Details and Price Box -->
                                                <tr>
                                                    <!-- Left Column: Car Image, Title, Specs, Button -->
                                                    <td style="vertical-align: top; width: 70%;">
                                                        <table border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #364050;">
                                                            <tr>
                                                                <!-- Car Image -->
                                                                <td valign="top">
                                                                    <img
                                                                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=="
                                                                        alt="Car Image"
                                                                        style="width: 140px; background-color: #f3f4f6; height: 105px; object-fit: contain; border-radius: 8px; box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px; display: block;"
                                                                    />
                                                                </td>

                                                                <!-- Car Title, Specs, Button -->
                                                                <td style="vertical-align: top; padding-left: 22px;">
                                                                    <p style="font-size: 0.875rem; font-weight: 400; color: #1f2937; margin: 18px 0;">Mercedes-Benz C-Class AMG Line</p>

                                                                    <!-- Specification Tags -->
                                                                    <table border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #364050; margin-bottom: 30px;">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td
                                                                                    style="
                                                                                        white-space: nowrap;
                                                                                        padding: 6px 10px;
                                                                                        background-color: #ffffff;
                                                                                        border: 1px solid #e2e8f0;
                                                                                        border-radius: 8px;
                                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.05);
                                                                                        font-size: 12px;
                                                                                        color: #364050;
                                                                                    "
                                                                                >
                                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="16"
                                                                                            height="16"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="none"
                                                                                            stroke="#6b7280"
                                                                                            stroke-width="2"
                                                                                            stroke-linecap="round"
                                                                                            stroke-linejoin="round"
                                                                                            style="vertical-align: middle;"
                                                                                        >
                                                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                                        </svg>
                                                                                    </span>
                                                                                    2019
                                                                                </td>
                                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                                <td
                                                                                    style="
                                                                                        white-space: nowrap;
                                                                                        padding: 6px 10px;
                                                                                        background-color: #ffffff;
                                                                                        border: 1px solid #e2e8f0;
                                                                                        border-radius: 8px;
                                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.05);
                                                                                        font-size: 12px;
                                                                                        color: #364050;
                                                                                    "
                                                                                >
                                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="16"
                                                                                            height="16"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="none"
                                                                                            stroke="currentColor"
                                                                                            stroke-width="2"
                                                                                            stroke-linecap="round"
                                                                                            stroke-linejoin="round"
                                                                                            class="lucide lucide-gauge w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                                            aria-hidden="true"
                                                                                        >
                                                                                            <path d="m12 14 4-4"></path>
                                                                                            <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
                                                                                        </svg>
                                                                                    </span>
                                                                                    40,100 km
                                                                                </td>
                                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                                <td
                                                                                    style="
                                                                                        white-space: nowrap;
                                                                                        padding: 6px 10px;
                                                                                        background-color: #ffffff;
                                                                                        border: 1px solid #e2e8f0;
                                                                                        border-radius: 8px;
                                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.05);
                                                                                        font-size: 12px;
                                                                                        color: #364050;
                                                                                    "
                                                                                >
                                                                                    <span style="vertical-align: middle; margin-right: 4px;">
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            width="16"
                                                                                            height="16"
                                                                                            viewBox="0 0 24 24"
                                                                                            fill="none"
                                                                                            stroke="currentColor"
                                                                                            stroke-width="2"
                                                                                            stroke-linecap="round"
                                                                                            stroke-linejoin="round"
                                                                                            class="lucide lucide-zap w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                                                                                            aria-hidden="true"
                                                                                        >
                                                                                            <path
                                                                                                d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
                                                                                            ></path>
                                                                                        </svg>
                                                                                    </span>
                                                                                    292 hp
                                                                                </td>
                                                                                <td style="width: 10px; max-width: 10px; min-width: 10px;"></td>
                                                                                <td
                                                                                    style="
                                                                                        white-space: nowrap;
                                                                                        padding: 6px 10px;
                                                                                        background-color: #ffffff;
                                                                                        border: 1px solid #e2e8f0;
                                                                                        border-radius: 8px;
                                                                                        box-shadow: 0px 2px 8px rgba(99, 99, 99, 0.05);
                                                                                        font-size: 12px;
                                                                                        color: #364050;
                                                                                    "
                                                                                >
                                                                                    Automatic
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>

                                                                    <!-- View Our Offer Button -->
                                                                    <table border="0" cellspacing="0" cellpadding="0" role="presentation">
                                                                        <tr>
                                                                            <td align="left" style="padding: 0;">
                                                                                <!--[if mso]>
                                                                                    <v:roundrect
                                                                                        xmlns:v="urn:schemas-microsoft-com:vml"
                                                                                        xmlns:w="urn:schemas-microsoft-com:office:word"
                                                                                        href="#"
                                                                                        style="height: 40px; v-text-anchor: middle; width: 220px;"
                                                                                        arcsize="10%"
                                                                                        strokecolor="none"
                                                                                        fill="true"
                                                                                    >
                                                                                        <v:fill type="gradient" color="#ec4899" color2="#ef4444" angle="0" />
                                                                                        <w:anchorlock />
                                                                                        <center style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px; font-weight: 500;">
                                                                                            View Our Offer →
                                                                                        </center>
                                                                                    </v:roundrect>
                                                                                <![endif]-->

                                                                                <!--[if !mso]><!-- -->
                                                                                <a href="#" style="text-decoration: none;">
                                                                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(to right, #ec4899, #ef4444); border-radius: 8px;">
                                                                                        <tr>
                                                                                            <td align="center" style="padding: 8px 12px; font-size: 12px; font-weight: 400; color: #ffffff; line-height: 1; white-space: nowrap;">
                                                                                                <span style="display: inline-block; vertical-align: middle; line-height: 1;">
                                                                                                    <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="16"
                                                                                                        height="16"
                                                                                                        style="display: block;"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        fill="none"
                                                                                                        stroke="#ffffff"
                                                                                                        stroke-width="2"
                                                                                                        stroke-linecap="round"
                                                                                                        stroke-linejoin="round"
                                                                                                    >
                                                                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                                                                                        <circle cx="12" cy="12" r="3"></circle>
                                                                                                    </svg>
                                                                                                </span>

                                                                                                <span style="display: inline-block; vertical-align: middle; padding: 0 6px;">View Our Offer</span>

                                                                                                <span style="display: inline-block; vertical-align: middle; line-height: 1;">
                                                                                                    <svg
                                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                                        width="16"
                                                                                                        height="16"
                                                                                                        style="display: block;"
                                                                                                        viewBox="0 0 24 24"
                                                                                                        fill="none"
                                                                                                        stroke="#ffffff"
                                                                                                        stroke-width="2"
                                                                                                        stroke-linecap="round"
                                                                                                        stroke-linejoin="round"
                                                                                                    >
                                                                                                        <path d="M7 7h10v10"></path>
                                                                                                        <path d="M7 17L17 7"></path>
                                                                                                    </svg>
                                                                                                </span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                                </a>
                                                                                <!--<![endif]-->
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>

                                                    <!-- Right Column: Price Box -->
                                                    <td style="vertical-align: top; text-align: right; width: 30%; padding-top: 100px;">
                                                        <table border="0" cellspacing="0" cellpadding="0" style="margin-left: auto;">
                                                            <tr>
                                                                <td style="padding: 14px; background-color: #f9fafb; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.08); text-align: center;">
                                                                    <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">Price excl. VAT</p>
                                                                    <p style="font-size: 17px; font-weight: 400; line-height: 1.5; text-align: right; color: #1a202c; margin: 0;">€25,900</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                                    <tbody>
                                        <tr>
                                            <td align="center" style="padding: 20px 16px;">
                                                <table border="0" cellspacing="0" cellpadding="0">
                                                    <tbody>
                                                        <tr>
                                                            <!-- Left Gradient Line -->
                                                            <td style="vertical-align: middle;">
                                                                <table width="167" height="1" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to right, transparent, #d1d5db, #d1d5db);">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>

                                                            <!-- Dots -->
                                                            <td style="vertical-align: middle; padding: 0 16px;">
                                                                <table border="0" cellspacing="0" cellpadding="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>
                                                                                <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #ec4899, #f87171); opacity: 0.8;"></div>
                                                                            </td>
                                                                            <td width="4"></td>
                                                                            <td>
                                                                                <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #db2777, #ef4444);"></div>
                                                                            </td>
                                                                            <td width="4"></td>
                                                                            <td>
                                                                                <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #ec4899, #f87171); opacity: 0.8;"></div>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>

                                                            <!-- Right Gradient Line -->
                                                            <td style="vertical-align: middle;">
                                                                <table width="167" height="1" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to left, transparent, #d1d5db, #d1d5db);">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <table
                                    width="100%"
                                    border="0"
                                    cellspacing="0"
                                    cellpadding="0"
                                    style="border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px; overflow: hidden; padding: 24px; margin-bottom: 24px;"
                                >
                                    <tr>
                                        <td style="padding-bottom: 16px;">
                                            <table border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td style="width: 42px; height: 42px; border-radius: 8px; background: linear-gradient(to bottom right, #475569, #1e293b); text-align: center;">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="21"
                                                            style="vertical-align: middle;"
                                                            height="21"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="#ffffff"
                                                            stroke-width="2"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            class="lucide lucide-star w-5 h-5 sm:w-6 sm:h-6 text-white"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
                                                            ></path>
                                                        </svg>
                                                    </td>

                                                    <td style="padding-left: 12px;">
                                                        <h2 style="font-size: 14px; font-weight: inherit; color: #1f2937; margin: 0;">Inventory Sourced to Meet Your Dealership's Needs</h2>
                                                        <p style="font-size: 12px; color: oklch(0.446 0.03 256.802); margin: 4px 0 0 0;">Data-Driven, Personalized Car Recommendation</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p style="font-size: 14px; color: #4a5569; line-height: 1.6; margin: 0 0 14px 0;">
                                                At Car Click, we take a data-driven approach to offering vehicles tailored for your dealership.
                                            </p>
                                            <p style="font-size: 14px; color: #4a5569; line-height: 1.6; margin: 0 0 14px 0;">
                                                Our recommendations are based on your fastest-selling cars from the previous week.
                                            </p>
                                            <p style="font-size: 14px; color: #4a5569; line-height: 1.6; margin: 0 0 14px 0;">
                                                By analyzing data from publicly available sources, we identify the vehicles with the highest demand — ensuring we present you with offers that align perfectly with what's proven to sell best
                                                at your dealership right now.
                                            </p>
                                            <p style="font-size: 14px; font-weight: 400; color: #be185d; line-height: 1.6; margin: 0;">
                                                Buying the right cars at the right prices has never been easier.
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                                    <tbody>
                                        <tr>
                                            <td align="center" style="padding: 20px 16px;">
                                                <table border="0" cellspacing="0" cellpadding="0">
                                                    <tbody>
                                                        <tr>
                                                            <!-- Left Gradient Line -->
                                                            <td style="vertical-align: middle;">
                                                                <table width="167" height="1" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to right, transparent, #d1d5db, #d1d5db);">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>

                                                            <!-- Dots -->
                                                            <td style="vertical-align: middle; padding: 0 16px;">
                                                                <table border="0" cellspacing="0" cellpadding="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>
                                                                                <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #ec4899, #f87171); opacity: 0.8;"></div>
                                                                            </td>
                                                                            <td width="4"></td>
                                                                            <td>
                                                                                <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #db2777, #ef4444);"></div>
                                                                            </td>
                                                                            <td width="4"></td>
                                                                            <td>
                                                                                <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #ec4899, #f87171); opacity: 0.8;"></div>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>

                                                            <!-- Right Gradient Line -->
                                                            <td style="vertical-align: middle;">
                                                                <table width="167" height="1" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to left, transparent, #d1d5db, #d1d5db);">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <table
                                    width="100%"
                                    border="0"
                                    cellspacing="0"
                                    cellpadding="0"
                                    style="border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px; overflow: hidden; padding: 24px; margin-bottom: 24px;"
                                >
                                    <tr>
                                        <td style="padding-bottom: 16px;">
                                            <table border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td style="width: 42px; height: 42px; border-radius: 8px; background: linear-gradient(to bottom right, #475569, #1e293b); text-align: center;">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="21"
                                                            style="vertical-align: middle;"
                                                            height="21"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="#ffffff"
                                                            stroke-width="2"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            class="lucide lucide-star w-5 h-5 sm:w-6 sm:h-6 text-white"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                                            <path d="m9 12 2 2 4-4"></path>
                                                        </svg>
                                                    </td>

                                                    <td style="padding-left: 12px;">
                                                        <h2 style="font-size: 14px; font-weight: inherit; color: #1f2937; margin: 0;">We Respect Your Privacy</h2>
                                                        <p style="font-size: 12px; color: oklch(0.446 0.03 256.802); margin: 4px 0 0 0;">Data protection and confidentiality commitment</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p style="font-size: 14px; color: #4a5569; line-height: 1.6; margin: 0 0 14px 0;">
                                                At Car Click, we strictly use data that is publicly available, gathered from multiple trusted sources to aggregate meaningful insights for your dealership. This allows us to provide accurate,
                                                data-driven recommendations without ever relying on proprietary or private information.
                                            </p>
                                            <p style="font-size: 14px; color: #4a5569; line-height: 1.6; margin: 0 0 14px 0;">
                                                We are fully committed to protecting your privacy. Your dealership's data is never shared, sold, or disclosed to any third party. We maintain the highest standards of confidentiality and data
                                                security, ensuring that your information remains safe and solely used to enhance the services we provide to you.
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0 40px 0;">
                                    <tbody>
                                        <tr>
                                            <td align="center" style="padding: 20px 16px;">
                                                <table border="0" cellspacing="0" cellpadding="0">
                                                    <tbody>
                                                        <tr>
                                                            <!-- Left Gradient Line -->
                                                            <td style="vertical-align: middle;">
                                                                <table width="167" height="1" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to right, transparent, #d1d5db, #d1d5db);">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>

                                                            <!-- Dots -->
                                                            <td style="vertical-align: middle; padding: 0 16px;">
                                                                <table border="0" cellspacing="0" cellpadding="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>
                                                                                <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #ec4899, #f87171); opacity: 0.8;"></div>
                                                                            </td>
                                                                            <td width="4"></td>
                                                                            <td>
                                                                                <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #db2777, #ef4444);"></div>
                                                                            </td>
                                                                            <td width="4"></td>
                                                                            <td>
                                                                                <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #ec4899, #f87171); opacity: 0.8;"></div>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>

                                                            <!-- Right Gradient Line -->
                                                            <td style="vertical-align: middle;">
                                                                <table width="167" height="1" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to left, transparent, #d1d5db, #d1d5db);">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0;">
                                    <tbody>
                                        <tr>
                                            <td align="center" style="padding: 15px 16px;">
                                                <table border="0" cellspacing="0" cellpadding="0">
                                                    <tbody>
                                                        <tr>
                                                            <!-- Left Gradient Line -->
                                                            <td style="vertical-align: middle;">
                                                                <table width="96" height="1" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to right, transparent, #d1d5db, #d1d5db);">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>

                                                            <!-- Dots -->
                                                            <td style="vertical-align: middle; padding: 0 16px;">
                                                                <table border="0" cellspacing="0" cellpadding="0">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td width="4"></td>
                                                                            <td>
                                                                                <div style="width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(to right, #db2777, #ef4444);"></div>
                                                                            </td>
                                                                            <td width="4"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>

                                                            <!-- Right Gradient Line -->
                                                            <td style="vertical-align: middle;">
                                                                <table width="96" height="1" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to left, transparent, #d1d5db, #d1d5db);">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="font-size: 0; line-height: 0;">&nbsp;</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td align="center">
                                            <table
                                                width="314"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                                style="background: #f7fafc; transition: 0.5s; border: 1px solid #e5e7eb; border-radius: 12px;"
                                                onmouseover="this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'"
                                            >
                                                <tr>
                                                    <td align="center" style="padding: 14px 21px; background: linear-gradient(to bottom right, #f7fafc, #f1f5f9); border-radius: 12px;">
                                                        <a href="https://yourwebsite.com" target="_blank" style="display: inline-block; text-decoration: none;">
                                                            <img
                                                                src="https://create-pleat-72490143.figma.site/_assets/v10/65a153719487cf74c7980c450c1b32c089788d58.png"
                                                                alt="Car Click Logo"
                                                                width="100%"
                                                                style="display: block; margin: 0 auto; border: 0;"
                                                            />
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td align="center" style="padding-top: 14px; padding-bottom: 12px;">
                                            <p style="font-size: 14px; font-weight: 400; font-style: italic; color: #4a5569; margin: 0 0 16px 0;">Building the future of automotive trade</p>

                                            <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 8px auto;">
                                                <tr>
                                                    <td
                                                        align="center"
                                                        style="border: 1px solid #d0d5dc; border-radius: 0.625em; background-color: #ffffff; padding: 0;"
                                                        onmouseout="this.style.backgroundColor='#ffffff'"
                                                        onmouseover="this.style.backgroundColor='#f7fafc'"
                                                    >
                                                        <a href="#" style="font-size: 14px; font-weight: 500; color: #1a202c; text-decoration: none; padding: 7px 21px; display: inline-block; border-radius: 10px;">
                                                            Unsubscribe
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>

                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td height="1" style="background-color: #f7fafc; line-height: 0; font-size: 0; margin: 24px 0;">&nbsp;</td>
                                                </tr>
                                            </table>
                                            <p style="font-size: 10.5px; color: #64748b; font-weight: 400; margin: 8px 4px;">&copy; 2025 Car Click. All rights reserved.</p>
                                            <p style="font-size: 10.5px; color: #64748b; font-weight: 400; margin: 0;">This email was sent to you as part of our dealer partnership program.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>

  `;
};

module.exports = counterTestEmailTemplate;
