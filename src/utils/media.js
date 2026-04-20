function upgradeParapharmaImageUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";

  const sizePattern = /-(?:home|small|cart|medium|large|thickbox)_default\//i;

  try {
    const parsed = new URL(value);
    if (!/parapharma\.ma$/i.test(parsed.hostname)) {
      return value;
    }

    if (!sizePattern.test(parsed.pathname)) {
      return value;
    }

    parsed.pathname = parsed.pathname.replace(sizePattern, "-large_default/");
    return parsed.toString();
  } catch {
    return value.replace(sizePattern, "-large_default/");
  }
}

function getApiOrigin() {
  const base = process.env.REACT_APP_API_BASE_URL || "http://ecommerce_parapharmacie.test/api";
  try {
    return new URL(base).origin;
  } catch {
    return "";
  }
}

export function resolveMediaUrl(rawUrl, options = {}) {
  const { preferHighRes = true } = options;
  const url = String(rawUrl || "").trim();
  if (!url) return "";

  if (url.startsWith("/static/") || url.startsWith("static/")) {
    return url.startsWith("/") ? url : `/${url}`;
  }

  const apiOrigin = getApiOrigin();
  if (!apiOrigin) {
    return preferHighRes ? upgradeParapharmaImageUrl(url) : url;
  }

  
  if (url.startsWith("/")) {
    return `${apiOrigin}${url}`;
  }

  try {
    const parsed = new URL(url);
    // If importer stored old/wrong backend host, rewrite only for imported-products files.
    if (parsed.pathname.startsWith("/imported-products/") && parsed.origin !== apiOrigin) {
      return `${apiOrigin}${parsed.pathname}`;
    }
    return preferHighRes ? upgradeParapharmaImageUrl(url) : url;
  } catch {
    return preferHighRes ? upgradeParapharmaImageUrl(url) : url;
  }
}
