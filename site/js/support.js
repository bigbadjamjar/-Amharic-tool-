/* "Support this app": a link to Rob's Ko-fi page, where people can give a small donation.
   Put the page address in SUPPORT_URL (for example "https://ko-fi.com/amharicapp").
   While it is empty, nothing about donations shows anywhere in the app. */
const SUPPORT_URL = "https://ko-fi.com/amharicapp";

const supportOn = () => /^https:\/\/[^\s"<>]+$/.test(SUPPORT_URL);
const supportA = (cls, inner) => `<a class="${cls}" href="${SUPPORT_URL}" target="_blank" rel="noopener">${inner}</a>`;

// the box near the bottom of the Home page
function supportCard(){
  if (!supportOn()) return "";
  return `<div class="note supcard">
      <p><b>Free, with no ads.</b> If the app is helping you learn, you can support it with a small donation. It helps pay for the website and keeps new lessons coming.</p>
      ${supportA("btn suppbtn", `<span aria-hidden="true">☕</span> Support this app`)}
    </div>`;
}

// the link in the footer at the bottom of every other page (Progress, Learn, Test ...)
const supportFoot = () => supportOn() ? `<span aria-hidden="true">·</span>${supportA("link", "Support this app")}` : "";
