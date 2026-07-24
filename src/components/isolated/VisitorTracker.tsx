import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

function parseUserAgent(ua: string): string {
  let os = "Unknown OS";
  let browser = "Unknown Browser";

  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  if (/Edg/.test(ua)) browser = "Edge";
  else if (/OPR|Opera/.test(ua)) browser = "Opera";
  else if (/Chrome/.test(ua)) browser = "Chrome";
  else if (/Firefox/.test(ua)) browser = "Firefox";
  else if (/Safari/.test(ua)) browser = "Safari";

  return `${os} / ${browser}`;
}

export function VisitorTracker() {
  useEffect(() => {
    const ua = navigator.userAgent;
    const osBrowser = parseUserAgent(ua);

    (async () => {
      try {
        await supabase.from("page_views").insert({
          ip_address: "",
          os_browser: osBrowser,
        });
      } catch {
        // Silent — never crash the page over analytics
      }
    })();
  }, []);

  return null;
}
