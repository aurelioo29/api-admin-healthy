const DEFAULT_WA_PHONE = process.env.WHATSAPP_PHONE || "628551500358";

const onlyDigits = (s) => String(s || "").replace(/[^\d]/g, "");

const buildWaLink = ({ phone, title, text }) => {
  const p = onlyDigits(phone || DEFAULT_WA_PHONE);
  const message = text || `Halo, saya ingin menanyakan Layanan ${title}`;
  return `https://api.whatsapp.com/send/?phone=${p}&text=${encodeURIComponent(
    message
  )}&type=phone_number&app_absent=0`;
};

module.exports = { buildWaLink };
