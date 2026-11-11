"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessWebhookReplyUseCase = void 0;
const crypto_1 = require("crypto");
const CONFIRM_OPTION_TEXTS = [
    '✅ Sim, confirmo presença',
    'Sim, confirmo presença',
    'Sim',
    'Confirmar',
];
const CANCEL_OPTION_TEXTS = [
    '❌ Não, preciso reagendar',
    'Não, preciso reagendar',
    'Não',
    'Cancelar',
    'Reagendar',
];
function computeOptionHashes(texts) {
    const hashes = new Set();
    for (const t of texts) {
        const shaHex = (0, crypto_1.createHash)('sha256').update(t, 'utf8').digest('hex').toLowerCase();
        const shaBase64 = (0, crypto_1.createHash)('sha256').update(t, 'utf8').digest('base64').toLowerCase();
        hashes.add(shaHex);
        hashes.add(shaBase64);
        hashes.add(t.toLowerCase());
    }
    return hashes;
}
const CONFIRM_HASHES = computeOptionHashes(CONFIRM_OPTION_TEXTS);
const CANCEL_HASHES = computeOptionHashes(CANCEL_OPTION_TEXTS);
function normalizeOptionValue(opt) {
    if (!opt)
        return '';
    if (typeof opt === 'string')
        return opt.trim().toLowerCase();
    if (Buffer.isBuffer(opt))
        return opt.toString('hex').toLowerCase();
    if (opt.type === 'Buffer' && Array.isArray(opt.data)) {
        return Buffer.from(opt.data).toString('hex').toLowerCase();
    }
    if (typeof opt === 'object' && opt.name) {
        return String(opt.name).trim().toLowerCase();
    }
    return String(opt).trim().toLowerCase();
}
class ProcessWebhookReplyUseCase {
    appointmentRepo;
    prisma;
    constructor(appointmentRepo, prisma) {
        this.appointmentRepo = appointmentRepo;
        this.prisma = prisma;
    }
    extractDataFromPayload(payload) {
        let rawPhone = '';
        let rawText = '';
        // Caso 1: Evento messages.update da Evolution API v2
        const dataItems = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];
        for (const item of dataItems) {
            const pollUpdates = item?.update?.pollUpdates || item?.pollUpdates;
            if (Array.isArray(pollUpdates) && pollUpdates.length > 0) {
                const latestPoll = pollUpdates[pollUpdates.length - 1];
                rawPhone =
                    latestPoll?.pollUpdateMessageKey?.remoteJidAlt ||
                        latestPoll?.pollUpdateMessageKey?.remoteJid ||
                        latestPoll?.pollUpdateMessageKey?.participant ||
                        item?.key?.remoteJidAlt ||
                        item?.key?.remoteJid ||
                        payload.sender ||
                        '';
                const selected = latestPoll?.vote?.selectedOptions || latestPoll?.vote || [];
                if (Array.isArray(selected) && selected.length > 0) {
                    rawText = normalizeOptionValue(selected[0]);
                }
                break;
            }
        }
        // Caso 2: Payload oficial Evolution API (messages.upsert)
        if (!rawText && payload.data?.key) {
            const key = payload.data.key;
            // Prioriza remoteJidAlt ou senderPn quando remoteJid vem como @lid no WhatsApp v2
            rawPhone =
                key.remoteJidAlt ||
                    key.senderPn ||
                    (typeof key.remoteJid === 'string' && !key.remoteJid.endsWith('@lid')
                        ? key.remoteJid
                        : '') ||
                    key.participant ||
                    key.remoteJid ||
                    payload.sender ||
                    '';
            const msg = payload.data.message;
            if (msg) {
                // Extrai resposta de botão interativo (nativeFlowResponseMessage) se existir
                let interactiveText = '';
                const paramsJson = msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
                if (typeof paramsJson === 'string') {
                    try {
                        const parsed = JSON.parse(paramsJson);
                        interactiveText = parsed.id || parsed.display_text || '';
                    }
                    catch {
                        interactiveText = paramsJson;
                    }
                }
                rawText =
                    interactiveText ||
                        msg.buttonsResponseMessage?.selectedDisplayText ||
                        msg.buttonsResponseMessage?.selectedButtonId ||
                        msg.templateButtonReplyMessage?.selectedDisplayText ||
                        msg.templateButtonReplyMessage?.selectedId ||
                        msg.listResponseMessage?.title ||
                        msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
                        msg.conversation ||
                        msg.extendedTextMessage?.text ||
                        '';
            }
            // Ignora apenas a própria mensagem de lembrete enviada pelo bot
            const lowerCheck = String(rawText).toLowerCase();
            if (key.fromMe &&
                (lowerCheck.includes('petcare agendamentos') ||
                    lowerCheck.includes('toque em uma das opções abaixo') ||
                    lowerCheck.includes('passando para confirmar'))) {
                return { phone: '', text: '', intent: 'UNKNOWN' };
            }
        }
        // Caso 3: Payload direto simplificado { phone, text/reply/message } (Simulador ou n8n)
        else if (!rawText && (payload.phone || payload.sender || payload.from)) {
            rawPhone = payload.phone || payload.sender || payload.from;
            rawText = payload.reply || payload.text || payload.message || payload.body || '';
        }
        // Normaliza telefone (remove sufixos WhatsApp como @s.whatsapp.net ou @lid)
        const phone = rawPhone.replace(/@.*$/, '').replace(/\D/g, '');
        const cleanText = String(rawText).trim().toLowerCase();
        // Ignora caso o texto seja o próprio template do lembrete
        if (cleanText.includes('petcare agendamentos') ||
            cleanText.includes('toque em uma das opções abaixo')) {
            return { phone, text: cleanText, intent: 'UNKNOWN' };
        }
        // Identifica intenção (por resposta direta de texto, número ou botão)
        let intent = 'UNKNOWN';
        if (CANCEL_HASHES.has(cleanText) ||
            cleanText === '2' ||
            cleanText === 'reagendar_2' ||
            cleanText === 'não' ||
            cleanText === 'nao' ||
            cleanText.startsWith('não') ||
            cleanText.startsWith('nao') ||
            cleanText.includes('não vou') ||
            cleanText.includes('nao vou') ||
            cleanText.includes('não posso') ||
            cleanText.includes('nao posso') ||
            cleanText.includes('cancela') ||
            cleanText.includes('reagend') ||
            cleanText.includes('desmarca') ||
            cleanText.includes('outro dia')) {
            intent = 'CANCEL_OR_RESCHEDULE';
        }
        else if (CONFIRM_HASHES.has(cleanText) ||
            cleanText === '1' ||
            cleanText === 'confirmar_1' ||
            cleanText === 'sim' ||
            cleanText === 's' ||
            cleanText.startsWith('sim') ||
            cleanText.includes('confirmo') ||
            cleanText.includes('confirmado') ||
            cleanText.includes('confirmar') ||
            cleanText.includes('confirma') ||
            cleanText.includes('vou sim') ||
            cleanText === 'vou' ||
            cleanText === 'ok' ||
            cleanText === 'certo' ||
            cleanText === 'combinado' ||
            cleanText === 'positivo' ||
            cleanText === '👍' ||
            cleanText === '✅') {
            intent = 'CONFIRM';
        }
        return {
            phone,
            text: cleanText,
            intent,
        };
    }
    async execute(input) {
        const extracted = this.extractDataFromPayload(input.rawPayload);
        if (extracted.intent === 'UNKNOWN' && !extracted.text) {
            return {
                processed: false,
                reason: 'Evento ignorado (mensagem enviada pelo bot ou sem conteúdo de resposta).',
            };
        }
        // Busca o agendamento pendente/aguardando para este telefone (ou o mais recente aguardando)
        const appointment = await this.appointmentRepo.findLatestAwaitingByCustomerPhone(extracted.phone || '00000000');
        if (!appointment) {
            console.warn(`[Webhook] Mensagem recebida de ${extracted.phone}, mas nenhum agendamento pendente foi localizado.`);
            return {
                processed: false,
                reason: 'Nenhum agendamento pendente/aguardando resposta localizado.',
                extracted,
            };
        }
        const previousStatus = appointment.status;
        let newStatus = previousStatus;
        if (extracted.intent === 'CONFIRM') {
            appointment.confirm();
            newStatus = 'CONFIRMADO';
        }
        else if (extracted.intent === 'CANCEL_OR_RESCHEDULE') {
            appointment.cancelOrReschedule();
            newStatus = 'CANCELADO_REAGENDAR';
        }
        else {
            console.log(`[Webhook] Resposta não reconhecida recebida de ${extracted.phone}: "${extracted.text}"`);
            return {
                processed: false,
                reason: `Texto "${extracted.text}" não corresponde a uma confirmação ou reagendamento.`,
                extracted,
            };
        }
        // Persiste a mudança de status no banco de dados
        await this.appointmentRepo.update(appointment);
        // Registra auditoria
        await this.prisma.notificationLog.create({
            data: {
                appointmentId: appointment.id,
                channel: 'WHATSAPP',
                direction: 'INBOUND',
                status: 'RECEIVED',
                payload: JSON.stringify({
                    receivedText: extracted.text,
                    intent: extracted.intent,
                    previousStatus,
                    updatedStatus: newStatus,
                    timestamp: new Date().toISOString(),
                }),
            },
        });
        return {
            processed: true,
            appointmentId: appointment.id,
            customerName: appointment.customer?.name,
            petName: appointment.pet?.name,
            previousStatus,
            currentStatus: newStatus,
            intent: extracted.intent,
            textReceived: extracted.text,
        };
    }
}
exports.ProcessWebhookReplyUseCase = ProcessWebhookReplyUseCase;
