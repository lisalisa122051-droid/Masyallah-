// Utilitas normalisasi JID dan pengecekan nomor
const normalizeJid = (jid) => {
    if (!jid) return null;
    
    // Hapus @s.whatsapp.net jika ada
    return jid.replace('@s.whatsapp.net', '@s.whatsapp.net').normalize().trim();
};

const isGroup = (jid) => jid?.endsWith('@g.us');
const isOwner = (jid, owners) => owners.includes(normalizeJid(jid));
const isAdmin = async (sock, jid, groupJid) => {
    try {
        const groupMetadata = await sock.groupMetadata(groupJid);
        const participant = groupMetadata.participants.find(p => normalizeJid(p.id) === normalizeJid(jid));
        return participant?.admin;
    } catch {
        return false;
    }
};

module.exports = {
    normalizeJid,
    isGroup,
    isOwner,
    isAdmin
};
