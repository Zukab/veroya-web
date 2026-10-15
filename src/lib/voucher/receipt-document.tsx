import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { createTranslator } from "next-intl";
import { AGENCY_TIME_ZONE } from "@/lib/bookings/dates";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";
import type { VoucherData } from "./data";

// Comprobante de pago en PDF (una página A4): valor pagado, datos de la reserva y
// pagos registrados. Informativo, no es una factura. Las fuentes se registran en
// render.ts.

const color = {
  sand50: "#faf7f2",
  sand200: "#e8dfd2",
  sand300: "#d8cab6",
  terra600: "#b4532a",
  olive50: "#f1f3ee",
  olive700: "#4a5740",
  oliveBorder: "#d5dccd",
  amber50: "#fdf3e1",
  amber800: "#8a5a12",
  amberBorder: "#f0dcb4",
  ink: "#1c1917",
  muted: "#6b635b",
};

const s = StyleSheet.create({
  page: { fontFamily: "Geist", fontSize: 10, lineHeight: 1.4, color: color.ink, padding: 48 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: color.terra600,
  },
  logo: { fontFamily: "Fraunces", fontWeight: 600, fontSize: 22, lineHeight: 1 },
  logoSub: { marginTop: 5, fontSize: 6.8, fontWeight: 600, letterSpacing: 1.7, color: color.terra600 },
  title: { fontSize: 10, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", textAlign: "right" },
  issued: { fontSize: 8.5, color: color.muted, marginTop: 3, textAlign: "right" },
  amountBox: {
    marginTop: 22,
    padding: 18,
    borderRadius: 10,
    backgroundColor: color.sand50,
    borderWidth: 1,
    borderColor: color.sand200,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 7.4, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: color.muted },
  amount: { fontFamily: "Fraunces", fontWeight: 600, fontSize: 28, marginTop: 4 },
  pill: { fontSize: 8.5, fontWeight: 600, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99, borderWidth: 1 },
  grid: { marginTop: 18, flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "50%", paddingVertical: 8, paddingRight: 12, borderBottomWidth: 1, borderBottomColor: color.sand200 },
  value: { fontSize: 10.5, fontWeight: 500, marginTop: 2 },
  sectionTitle: { marginTop: 22, fontFamily: "Fraunces", fontWeight: 600, fontSize: 13 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: color.sand200,
  },
  rowStrong: { fontWeight: 600 },
  note: { marginTop: 26, fontSize: 8.5, color: color.muted },
  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 32,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: color.sand300,
    fontSize: 8,
    color: color.muted,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export function ReceiptDocument({ data, siteHost }: { data: VoucherData; siteHost: string }) {
  const { locale, payment, payments, apartment } = data;
  const messages = (locale === "en" ? en : es) as typeof es;
  const t = createTranslator({ locale, messages, namespace: "Receipt" });

  const intlLocale = locale === "en" ? "en-GB" : "es-ES";
  const longDate = new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const day = (value: string) => longDate.format(new Date(`${value}T00:00:00Z`));
  const issued = new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: AGENCY_TIME_ZONE,
  }).format(data.issuedAt);
  const euros = new Intl.NumberFormat(intlLocale, { style: "currency", currency: "EUR" });

  const isPaid = payment.kind === "paid";
  const methods = [...new Set(payments.map((item) => t(`methods.${item.method}`)))].join(", ");
  const destination = [apartment.city, apartment.country].filter(Boolean).join(", ");

  const cells: [string, string][] = [
    [t("code"), data.code],
    [t("holder"), data.guest.fullName],
    [t("accommodation"), apartment.name],
    [t("destination"), destination],
    [t("checkIn"), day(data.checkIn)],
    [t("checkOut"), day(data.checkOut)],
    [t("method"), methods],
    [t("currency"), "EUR"],
  ];

  return (
    <Document title={`${t("title")} ${data.code}`} author="Euronest Apartamentos" language={locale}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.logo}>Euronest</Text>
            <Text style={s.logoSub}>APARTAMENTOS</Text>
          </View>
          <View>
            <Text style={s.title}>{t("title")}</Text>
            <Text style={s.issued}>{t("issued", { date: issued })}</Text>
          </View>
        </View>

        <View style={s.amountBox}>
          <View>
            <Text style={s.label}>{t("paidValue")}</Text>
            <Text style={s.amount}>{euros.format(payment.paid)}</Text>
          </View>
          <Text
            style={[
              s.pill,
              isPaid
                ? { color: color.olive700, backgroundColor: color.olive50, borderColor: color.oliveBorder }
                : { color: color.amber800, backgroundColor: color.amber50, borderColor: color.amberBorder },
            ]}
          >
            {isPaid ? t("paid") : t("partial")}
          </Text>
        </View>

        <View style={s.grid}>
          {cells.map(([label, value]) => (
            <View key={label} style={s.cell}>
              <Text style={s.label}>{label}</Text>
              <Text style={s.value}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>{t("payments")}</Text>
        {payments.map((item, index) => (
          <View key={index} style={s.row}>
            <Text>{t("paymentRow", { date: day(item.paidOn), method: t(`methods.${item.method}`) })}</Text>
            <Text>{euros.format(item.amount)}</Text>
          </View>
        ))}
        {payment.total != null && (
          <View style={s.row}>
            <Text>{t("total")}</Text>
            <Text>{euros.format(payment.total)}</Text>
          </View>
        )}
        {payment.total != null && payment.total > payment.paid && (
          <View style={s.row}>
            <Text style={s.rowStrong}>{t("pending")}</Text>
            <Text style={s.rowStrong}>{euros.format(payment.total - payment.paid)}</Text>
          </View>
        )}

        <Text style={s.note}>{t("certify", { site: siteHost })}</Text>

        <View style={s.footer} fixed>
          <Text>Euronest Apartamentos</Text>
          <Text>{siteHost}</Text>
        </View>
      </Page>
    </Document>
  );
}
