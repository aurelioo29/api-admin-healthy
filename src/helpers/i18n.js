
const parseI18nFromBody = (
  body,
  { locales = ["id", "en"], ensureLocales = true, includeSubtitle = true } = {}
) => {
  const allowed = new Set(locales.map((l) => String(l).toLowerCase()));

  // 1) Bentuk bracket
  const tmp = {}; // idx -> { locale, title, subtitle, body_html }
  const re = /^i18n\[(\w+)\]\[(locale|title|subtitle|body_html)\]$/;

  for (const [k, v] of Object.entries(body || {})) {
    const m = k.match(re);
    if (!m) continue;
    const idx = m[1];
    const field = m[2];
    tmp[idx] = tmp[idx] || {
      locale: "",
      title: "",
      subtitle: "",
      body_html: "",
    };
    tmp[idx][field] = v ?? "";
  }

  const result = [];
  const pushIfValid = (entry) => {
    const loc = String(entry.locale || "").toLowerCase();
    if (!allowed.has(loc)) return;
    // hindari duplikat per-locale: prioritaskan bentuk bracket
    if (!result.find((x) => x.locale === loc)) {
      const out = {
        locale: loc,
        title: entry.title || "",
        body_html: entry.body_html || "",
      };
      if (includeSubtitle && entry.subtitle != null)
        out.subtitle = entry.subtitle || "";
      result.push(out);
    }
  };

  Object.values(tmp).forEach(pushIfValid);

  // 2) Fallback: flat keys
  locales.forEach((loc) => {
    const t = body?.[`title_${loc}`];
    const s = body?.[`subtitle_${loc}`];
    const b = body?.[`body_html_${loc}`] ?? body?.[`body_${loc}`];
    const hasAny = t != null || s != null || b != null;

    if (hasAny && !result.find((x) => x.locale === loc)) {
      const out = {
        locale: loc,
        title: t || "",
        body_html: b || "",
      };
      if (includeSubtitle && s != null) out.subtitle = s || "";
      result.push(out);
    }
  });

  // 3) Lengkapi yang belum ada (opsional)
  if (ensureLocales) {
    locales.forEach((loc) => {
      if (!result.find((x) => x.locale === loc)) {
        const out = { locale: loc, title: "", body_html: "" };
        if (includeSubtitle) out.subtitle = "";
        result.push(out);
      }
    });
  }

  // 4) Urutkan sesuai urutan locales
  result.sort((a, b) => locales.indexOf(a.locale) - locales.indexOf(b.locale));
  return result;
};

module.exports = parseI18nFromBody;
