/**
 * Telegram notification utility for cashout alerts and community channel
 */

export interface TelegramAlertData {
  userName: string;
  phone: string;
  method: string;
  accountNumber: string;
  accountType?: string;
  amountBDT: number;
  coins: number;
  trxId?: string;
}

export async function sendTelegramCashoutAlert(
  data: TelegramAlertData,
  botToken?: string,
  chatId?: string
): Promise<boolean> {
  const message = `🔔 *নতুন ক্যাশআউট রিকোয়েস্ট!*\n\n` +
    `👤 *ইউজার:* ${data.userName}\n` +
    `📱 *মেথড:* ${data.method.toUpperCase()} (${data.accountType || 'Personal'})\n` +
    `💳 *অ্যাকাউন্ট:* \`${data.accountNumber}\`\n` +
    `💰 *পরিমাণ:* ৳${data.amountBDT} (${data.coins} Coins)\n` +
    `⏰ *সময়:* ${new Date().toLocaleString('bn-BD')}\n` +
    `🆔 *TrxID:* \`${data.trxId || 'N/A'}\`\n\n` +
    `_SocialCash Admin Bot_`;

  if (!botToken || !chatId) {
    console.log('[Telegram Alert Simulated]:', message);
    return true;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    return res.ok;
  } catch (error) {
    console.warn('Failed to send Telegram notification:', error);
    return false;
  }
}

export function openTelegramChannel(channelUrl: string = 'https://t.me/socialcashbd') {
  if (typeof window !== 'undefined') {
    window.open(channelUrl, '_blank');
  }
}
