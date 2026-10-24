import { formatDate, lineAmount, totalsOf } from "@/lib/invoices/model";
import { formatMoney, formatQty } from "@/lib/invoices/money";
import type { CompanySettings, Invoice } from "@/lib/invoices/types";

type Props = {
  invoice: Invoice;
  settings: CompanySettings;
};

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 7a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1l-2.22 2.2z"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"
      />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.9 9h-3.2a15.6 15.6 0 0 0-1.2-5 8.1 8.1 0 0 1 4.4 5zM12 4c.8 1.1 1.8 3.2 2.2 7H9.8c.4-3.8 1.4-5.9 2.2-7zM4.1 11a8.1 8.1 0 0 1 4.4-5 15.6 15.6 0 0 0-1.2 5H4.1zM4.1 13h3.2a15.6 15.6 0 0 0 1.2 5 8.1 8.1 0 0 1-4.4-5zM12 20c-.8-1.1-1.8-3.2-2.2-7h4.4c-.4 3.8-1.4 5.9-2.2 7zm3.5-2a15.6 15.6 0 0 0 1.2-5h3.2a8.1 8.1 0 0 1-4.4 5z"
      />
    </svg>
  );
}

export function InvoiceSheet({ invoice, settings }: Props) {
  const totals = totalsOf(invoice);
  const tall = invoice.lines.length === 1;
  return (
    <article className="sheet" dir="rtl">
      <div className="topbar" />
      <header className="brand">
        <div className="brand-en">
          <div className="co">Al-Mawj Company</div>
          <div className="sub">
            for Organizing International
            <br />
            Exhibitions and Conferences
          </div>
        </div>
        <img className="logo" src="/invoice/logo.png" alt="شعار شركة الموج" />
        <div className="brand-ar">
          <div className="co">شركة الموج</div>
          <div className="sub">
            لإقامة المعارض
            <br />
            والمؤتمرات الدولية
          </div>
        </div>
      </header>
      <hr className="rule" />
      <div className="meta">
        <div className="meta-en">
          <div className="row">
            <span>Number :</span>
            <span className="val">{invoice.number}</span>
          </div>
          <div className="row">
            <span>Date :</span>
            <span className="val">{formatDate(invoice.date)}</span>
          </div>
        </div>
        <div className="meta-ar">
          <div className="row">
            <span>العدد :</span>
            <span className="val">{invoice.number}</span>
          </div>
          <div className="row">
            <span>التاريخ :</span>
            <span className="val">{formatDate(invoice.date)}</span>
          </div>
        </div>
      </div>

      <section className="party">
        <div className="party-top">
          <div className="box title-box">
            <span className="k">فاتورة:</span>
            <span className="v">{invoice.title}</span>
          </div>
          <div className="box currency-box">
            <span>{invoice.currency || "دينار"}</span>
            <span>العملة</span>
          </div>
        </div>
        <div className="row3">
          <div className="cell">
            <span className="k">الاسم الثلاثي :</span>
            <span className="v">{invoice.clientName}</span>
          </div>
          <div className="cell">
            <span className="k">المحافظة :</span>
            <span className="v">{invoice.province}</span>
          </div>
          <div className="cell">
            <span className="k">الهاتف</span>
            <span className="v" dir="ltr">
              {invoice.phone}
            </span>
          </div>
        </div>
        <div className="row2">
          <div className="cell">
            <span className="k">اسم الشركة :</span>
            <span className="v">{invoice.companyName}</span>
          </div>
          <div className="cell">
            <span className="k">الملاحظات:</span>
            <span className="v">{invoice.notes}</span>
          </div>
        </div>
      </section>

      <div className="dbl" />

      <div className="items-wrap">
        <table className="items">
          <colgroup>
            <col className="c-t" />
            <col />
            <col className="c-price" />
          </colgroup>
          <thead>
            <tr>
              <th>ت</th>
              <th>التفاصيل</th>
              <th>السعر الإفرادي</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line, index) => (
              <tr key={line.id} className={tall ? "tall" : "compact"}>
                <td className="idx">{index + 1}</td>
                <td>
                  {line.description}
                  {line.qty > 1 ? <span className="qty"> × {formatQty(line.qty)}</span> : null}
                </td>
                <td className="price">
                  {line.description || line.unitPrice ? formatMoney(line.unitPrice) : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="money">
          <div className="money-grid">
            <div className="mcell prev">
              <span className="k">رصيد سابق:</span>
              <span className="amt">{formatMoney(invoice.previousBalance)}</span>
            </div>
            <div className="mcell net">
              <span className="k">صافي الفاتورة:</span>
              <span className="amt">{formatMoney(totals.net)}</span>
            </div>
            <div className="mcell cash">
              <span className="k">دفعة نقدية:</span>
              <span className="amt">{formatMoney(invoice.cashPayment)}</span>
            </div>
            <div className="mcell current">
              <span className="k">رصيد حالي:</span>
              <span className="amt">{formatMoney(totals.current)}</span>
            </div>
            <div className="mcell due">
              <span className="k">باقي للدفع:</span>
              <span className="amt">{formatMoney(totals.due)}</span>
            </div>
          </div>
          <div className="words">
            <span className="k">المبلغ كتابة:</span>
            <span className="v">{totals.words}</span>
          </div>
        </div>
      </div>

      <div className="after">
        <div className="mark" aria-hidden="true">
          <img src="/invoice/logo.png" alt="" />
          <p>
            شركة الموج لإقامة
            <br />
            المعارض والمؤتمرات الدولية
          </p>
        </div>
        <div className="sign">
          <div>{settings.signatureTitle}</div>
          <div>{settings.signatureName}</div>
        </div>
      </div>

      <footer className="foot">
        <div className="contact">
          <div className="iconline">
            <span>{settings.address}</span>
            <span className="sq green">
              <IconPin />
            </span>
          </div>
          <div className="iconline">
            <span dir="ltr">{settings.phone}</span>
            <span className="sq green">
              <IconPhone />
            </span>
          </div>
        </div>
        <div className="web">
          <div className="iconline">
            <a href={settings.website}>{settings.website}</a>
            <span className="sq blue">
              <IconGlobe />
            </span>
          </div>
          <div className="iconline">
            <span>{settings.email}</span>
            <span className="sq blue">
              <IconMail />
            </span>
          </div>
        </div>
        <div className="qrs">
          <img src="/invoice/qr-1.png" alt="" />
          <img src="/invoice/qr-2.png" alt="" />
          <img src="/invoice/qr-3.png" alt="" />
        </div>
      </footer>
    </article>
  );
}

export function lineTotalLabel(invoice: Invoice, index: number) {
  const line = invoice.lines[index];
  if (!line) return "";
  return formatMoney(lineAmount(line));
}
