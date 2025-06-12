import { default as makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import P from 'pino'

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    version
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut)
      if (shouldReconnect) {
        startBot()
      }
    } else if (connection === 'open') {
      console.log('🤖 Bot conectado com sucesso!')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text

    if (text === '.menu') {
      await sock.sendMessage(msg.key.remoteJid, {
        text: '👑 Comandos do ReiDoGrupo:\\n.cantada\\n.safado on/off\\n.xp\\n.avisos\\n\\nMais em breve...'
      })
    }
  })
}

startBot()
