import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'PhotoCash12_bot';

app.use(express.json());

/**
 * Validates Telegram WebApp initData string using HMAC-SHA256 according to Telegram's official specs.
 * Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
function verifyTelegramWebAppData(
  initData: string,
  botToken: string
): { valid: boolean; user?: any; reason?: string } {
  try {
    if (!initData) {
      return { valid: false, reason: 'initData is empty' };
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) {
      return { valid: false, reason: 'hash parameter missing' };
    }

    urlParams.delete('hash');

    // Sort parameters alphabetically by key
    const paramsList: string[] = [];
    urlParams.sort();
    for (const [key, value] of urlParams.entries()) {
      paramsList.push(`${key}=${value}`);
    }
    const dataCheckString = paramsList.join('\n');

    // If bot token is set, perform official HMAC-SHA256 validation
    if (botToken && botToken.trim().length > 0) {
      // Secret key = HMAC_SHA256("WebAppData", botToken)
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

      // Calculated hash = HMAC_SHA256(secretKey, dataCheckString)
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      if (calculatedHash !== hash) {
        return { valid: false, reason: 'Signature mismatch' };
      }
    } else {
      console.warn(
        '[Telegram Auth] TELEGRAM_BOT_TOKEN environment variable not set. Running in development verification mode.'
      );
    }

    const userStr = urlParams.get('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || !user.id) {
      return { valid: false, reason: 'Invalid user payload in initData' };
    }

    return { valid: true, user };
  } catch (err: any) {
    console.error('Telegram initData verification error:', err);
    return { valid: false, reason: err.message || 'Verification exception' };
  }
}

/**
 * Validates Telegram Login Widget data according to Telegram's specs.
 * Reference: https://core.telegram.org/widgets/login#checking-authorization
 */
function verifyTelegramWidgetData(
  data: Record<string, any>,
  botToken: string
): boolean {
  try {
    const { hash, ...rest } = data;
    if (!hash) return false;

    if (!botToken || botToken.trim().length === 0) {
      // Dev mode fallback
      return true;
    }

    const keys = Object.keys(rest).sort();
    const dataCheckString = keys.map((key) => `${key}=${rest[key]}`).join('\n');

    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (err) {
    console.error('Telegram widget verification error:', err);
    return false;
  }
}

/**
 * Try to fetch user's profile photo from Telegram Bot API
 */
async function fetchTelegramUserProfilePhoto(
  userId: string | number,
  botToken: string
): Promise<string | null> {
  if (!botToken || botToken.trim().length === 0) return null;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${userId}&limit=1`
    );
    const data: any = await res.json();
    if (data.ok && data.result?.photos?.length > 0) {
      const photos = data.result.photos[0];
      const bestPhoto = photos[photos.length - 1]; // largest photo
      if (bestPhoto?.file_id) {
        const fileRes = await fetch(
          `https://api.telegram.org/bot${botToken}/getFile?file_id=${bestPhoto.file_id}`
        );
        const fileData: any = await fileRes.json();
        if (fileData.ok && fileData.result?.file_path) {
          return `/api/telegram/avatar/${userId}?path=${encodeURIComponent(
            fileData.result.file_path
          )}`;
        }
      }
    }
  } catch (err) {
    console.warn('[Telegram Auth] Photo fetch error:', err);
  }
  return null;
}

// 1. Verify Telegram WebApp (Mini App inside Telegram)
app.post('/api/auth/telegram-webapp', async (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({
      success: false,
      error: 'Missing initData string from Telegram WebApp',
    });
  }

  const result = verifyTelegramWebAppData(initData, BOT_TOKEN);

  if (!result.valid || !result.user) {
    return res.status(401).json({
      success: false,
      error: result.reason || 'Telegram authentication signature is invalid',
    });
  }

  const tgUser = result.user;
  const sessionToken = crypto.randomBytes(32).toString('hex');

  let photoUrl = tgUser.photo_url;
  if (!photoUrl && BOT_TOKEN) {
    photoUrl = await fetchTelegramUserProfilePhoto(tgUser.id, BOT_TOKEN);
  }
  if (!photoUrl) {
    photoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${tgUser.id}`;
  }

  const fullName =
    [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') ||
    tgUser.first_name ||
    tgUser.username ||
    'Telegram User';

  return res.json({
    success: true,
    user: {
      telegramId: String(tgUser.id),
      chatId: String(tgUser.id),
      username: tgUser.username || `user_${tgUser.id}`,
      firstName: tgUser.first_name || '',
      lastName: tgUser.last_name || '',
      name: fullName,
      photoUrl: photoUrl,
    },
    token: sessionToken,
  });
});

// 2. Verify Telegram Login Widget (Standalone Browser)
app.post('/api/auth/telegram-widget', async (req, res) => {
  const authData = req.body;

  if (!authData || !authData.id) {
    return res.status(400).json({
      success: false,
      error: 'Missing Telegram authentication data',
    });
  }

  const isValid = verifyTelegramWidgetData(authData, BOT_TOKEN);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid Telegram widget authentication signature',
    });
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');

  let photoUrl = authData.photo_url;
  if (!photoUrl && BOT_TOKEN) {
    photoUrl = await fetchTelegramUserProfilePhoto(authData.id, BOT_TOKEN);
  }
  if (!photoUrl) {
    photoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${authData.id}`;
  }

  const fullName =
    [authData.first_name, authData.last_name].filter(Boolean).join(' ') ||
    authData.first_name ||
    authData.username ||
    'Telegram User';

  return res.json({
    success: true,
    user: {
      telegramId: String(authData.id),
      chatId: String(authData.id),
      username: authData.username || `user_${authData.id}`,
      firstName: authData.first_name || '',
      lastName: authData.last_name || '',
      name: fullName,
      photoUrl: photoUrl,
    },
    token: sessionToken,
  });
});

// 3. Quick Connect / Dev login for desktop preview testing outside Telegram
app.post('/api/auth/telegram-dev-connect', async (req, res) => {
  const { telegramId, name, username, photoUrl } = req.body;

  if (!telegramId || String(telegramId).trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Telegram ID is required',
    });
  }

  const cleanId = String(telegramId).trim();
  const sessionToken = crypto.randomBytes(32).toString('hex');

  let resolvedPhoto = photoUrl;
  if (!resolvedPhoto && BOT_TOKEN) {
    resolvedPhoto = await fetchTelegramUserProfilePhoto(cleanId, BOT_TOKEN);
  }
  if (!resolvedPhoto) {
    resolvedPhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanId}`;
  }

  const cleanName = name?.trim() || `User #${cleanId.slice(-4)}`;

  return res.json({
    success: true,
    user: {
      telegramId: cleanId,
      chatId: cleanId,
      username: username || `user_${cleanId}`,
      firstName: cleanName,
      lastName: '',
      name: cleanName,
      photoUrl: resolvedPhoto,
    },
    token: sessionToken,
  });
});

// Proxy route for streaming Telegram avatar
app.get('/api/telegram/avatar/:userId', async (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath || !BOT_TOKEN) {
    return res.redirect(
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.params.userId}`
    );
  }
  try {
    const tgImgRes = await fetch(
      `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`
    );
    if (!tgImgRes.ok) {
      return res.redirect(
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.params.userId}`
      );
    }
    const contentType = tgImgRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const arrayBuf = await tgImgRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuf));
  } catch (err) {
    return res.redirect(
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.params.userId}`
    );
  }
});

// 4. Bot info endpoint
app.get('/api/auth/bot-info', (req, res) => {
  res.json({
    botUsername: BOT_USERNAME,
    hasTokenConfigured: Boolean(BOT_TOKEN && BOT_TOKEN.length > 0),
  });
});

// Main Server Setup (Dev with Vite middlewares vs Production)
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
