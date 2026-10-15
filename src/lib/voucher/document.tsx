import { Circle, Document, Image, Link, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import { createTranslator } from "next-intl";
import type { ReactNode } from "react";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";
import { houseRulesList } from "@/lib/data/settings";
import { fullAddress } from "./address";
import type { PaymentKind, VoucherData } from "./data";

// Voucher en PDF (una página A4), con el diseño aprobado por el cliente
// (maqueta en referencias/maqueta-voucher/). Las fuentes se registran en render.ts.

const color = {
  sand50: "#faf7f2",
  sand100: "#f3ede4",
  sand200: "#e8dfd2",
  sand300: "#d8cab6",
  terra50: "#fbf1ec",
  terra100: "#f5dccf",
  terra500: "#c8653a",
  terra600: "#b4532a",
  terra700: "#96431f",
  olive50: "#f1f3ee",
  olive600: "#5b6b4e",
  olive700: "#4a5740",
  oliveBorder: "#d5dccd",
  amber50: "#fdf3e1",
  amber800: "#8a5a12",
  amberBorder: "#f0dcb4",
  ink: "#1c1917",
  muted: "#6b635b",
  body: "#3d3833",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Geist",
    fontSize: 9.5,
    lineHeight: 1.4,
    color: color.ink,
    paddingTop: 30,
    paddingHorizontal: 40,
    paddingBottom: 24,
  },
  label: {
    fontSize: 6.8,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: color.muted,
  },
  serif: { fontFamily: "Fraunces", fontWeight: 600 },

  watermark: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "space-around",
    alignItems: "center",
  },
  watermarkText: {
    fontSize: 25,
    fontWeight: 600,
    letterSpacing: 2,
    color: color.terra600,
    opacity: 0.1,
    transform: "rotate(-28deg)",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: color.sand300,
  },
  logo: { fontFamily: "Fraunces", fontWeight: 600, fontSize: 22, lineHeight: 1 },
  logoSub: { marginTop: 5, fontSize: 6.8, fontWeight: 600, letterSpacing: 1.7, color: color.terra600 },
  docTitle: { fontSize: 7.6, fontWeight: 600, letterSpacing: 1.3, textTransform: "uppercase", color: color.muted },
  docCode: { fontFamily: "GeistMono", fontWeight: 500, fontSize: 17, lineHeight: 1.3, letterSpacing: 0.6, marginTop: 3 },
  docIssued: { fontSize: 8, color: color.muted, marginTop: 2 },

  status: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.oliveBorder,
    backgroundColor: color.olive50,
  },
  statusTitle: { fontSize: 11, fontWeight: 600, color: color.olive700 },
  statusNote: { fontSize: 8, color: color.olive600 },

  card: { marginTop: 10, borderWidth: 1, borderColor: color.sand300, borderRadius: 8 },
  apt: {
    padding: 14,
    backgroundColor: color.sand50,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: color.sand300,
  },
  aptName: { fontFamily: "Fraunces", fontWeight: 600, fontSize: 16, lineHeight: 1.2, marginTop: 4, marginBottom: 6 },
  address: { flexDirection: "row", alignItems: "center" },
  mapLink: { marginTop: 3, marginLeft: 17, fontSize: 8.4, fontWeight: 500, color: color.terra700, textDecoration: "none" },
  dates: { flexDirection: "row" },
  dateCell: { flex: 1, paddingVertical: 10, paddingHorizontal: 11 },
  dateCellBorder: { borderLeftWidth: 1, borderLeftColor: color.sand200 },
  nightsCell: { flexGrow: 0, flexShrink: 0, flexBasis: 80, alignItems: "center", backgroundColor: color.terra50 },
  big: { fontFamily: "Fraunces", fontWeight: 600, fontSize: 12, lineHeight: 1.25, marginTop: 3 },
  small: { fontSize: 7.8, color: color.muted },

  middle: { marginTop: 10, flexDirection: "row" },
  facts: { flex: 1 },
  fact: { borderWidth: 1, borderColor: color.sand300, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  factGap: { marginTop: 8 },
  factValue: { fontSize: 11, fontWeight: 600, marginTop: 3 },
  note: { fontSize: 7.8, color: color.muted, marginTop: 2 },
  payRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pill: {
    fontSize: 7.6,
    fontWeight: 600,
    paddingVertical: 2.5,
    paddingHorizontal: 8,
    borderRadius: 99,
    borderWidth: 1,
  },
  layoutRow: { flexDirection: "row", marginTop: 4 },
  layoutItem: { fontSize: 9, marginRight: 14 },
  layoutNumber: { fontSize: 10.5, fontWeight: 600 },
  beds: { marginTop: 3, fontSize: 9, fontWeight: 500, color: color.terra700 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  chip: {
    fontSize: 7.4,
    lineHeight: 1.3,
    color: color.body,
    paddingVertical: 2,
    paddingHorizontal: 7,
    marginRight: 4,
    marginBottom: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: color.sand200,
    backgroundColor: color.sand100,
  },

  qrBox: {
    width: 158,
    marginLeft: 14,
    padding: 14,
    borderRadius: 8,
    backgroundColor: color.ink,
    alignItems: "center",
  },
  qrFrame: { backgroundColor: "#ffffff", padding: 7, borderRadius: 6 },
  qr: { width: 100, height: 100 },
  qrTitle: { marginTop: 8, fontSize: 10, fontWeight: 600, color: color.sand50 },
  qrNote: { marginTop: 4, fontSize: 7.4, color: color.sand300, textAlign: "center" },
  qrUrl: { marginTop: 6, fontFamily: "GeistMono", fontWeight: 500, fontSize: 6.6, color: color.terra100, textAlign: "center" },

  conditions: { marginTop: 10, paddingTop: 9, borderTopWidth: 1, borderTopColor: color.sand300 },
  conditionsTitle: { fontFamily: "Fraunces", fontWeight: 600, fontSize: 12, marginBottom: 8 },
  cols: { flexDirection: "row" },
  col: { flex: 1 },
  colNarrow: { width: "38%" },
  colGap: { marginLeft: 16 },
  colTitle: {
    fontSize: 7.6,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: color.terra700,
    marginBottom: 4,
  },
  bullet: { flexDirection: "row", marginBottom: 2.5 },
  dot: { width: 3.2, height: 3.2, borderRadius: 2, backgroundColor: color.terra500, marginTop: 3.9, marginRight: 5 },
  colText: { flex: 1, fontSize: 7.8, lineHeight: 1.35, color: color.body },

  footer: {
    marginTop: "auto",
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: color.sand300,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.8,
    color: color.muted,
  },
  footerStrong: { color: color.ink, fontWeight: 600 },
});

const pillStyles: Record<PaymentKind, { color: string; backgroundColor: string; borderColor: string }> = {
  paid: { color: color.olive700, backgroundColor: color.olive50, borderColor: color.oliveBorder },
  partial: { color: color.amber800, backgroundColor: color.amber50, borderColor: color.amberBorder },
  pending: { color: color.amber800, backgroundColor: color.amber50, borderColor: color.amberBorder },
  on_arrival: { color: color.terra700, backgroundColor: color.terra50, borderColor: color.terra100 },
};

const pillLabels = { paid: "paid", partial: "partial", pending: "pending", on_arrival: "onArrival" } as const;

function CheckIcon() {
  return (
    <Svg viewBox="0 0 24 24" width={17} height={17} style={{ marginRight: 10 }}>
      <Circle cx="12" cy="12" r="10" stroke={color.olive700} strokeWidth={2} fill="none" />
      <Path d="M9 12l2 2l4-4" stroke={color.olive700} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PinIcon() {
  return (
    <Svg viewBox="0 0 24 24" width={11} height={11} style={{ marginRight: 6 }}>
      <Path
        d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
        stroke={color.terra600}
        strokeWidth={2}
        fill="none"
      />
      <Circle cx="12" cy="10" r="3" stroke={color.terra600} strokeWidth={2} fill="none" />
    </Svg>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item, index) => (
        <View key={index} style={s.bullet}>
          <View style={s.dot} />
          <Text style={s.colText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function DateCell({ label, value, note, border }: { label: string; value: string; note?: string; border?: boolean }) {
  return (
    <View style={border ? [s.dateCell, s.dateCellBorder] : s.dateCell}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.big}>{value}</Text>
      {note && <Text style={s.small}>{note}</Text>}
    </View>
  );
}

function Fact({ children, first }: { children: ReactNode; first?: boolean }) {
  return <View style={first ? s.fact : [s.fact, s.factGap]}>{children}</View>;
}

export function VoucherDocument({ data, qrDataUrl, siteHost }: { data: VoucherData; qrDataUrl: string; siteHost: string }) {
  const { locale, apartment, payment, settings } = data;
  const messages = (locale === "en" ? en : es) as typeof es;
  const t = createTranslator({ locale, messages, namespace: "Voucher" });
  const tApartment = createTranslator({ locale, messages, namespace: "Apartment" });
  const tAmenities = createTranslator({ locale, messages, namespace: "Amenities" });

  const intlLocale = locale === "en" ? "en-GB" : "es-ES";
  const stayDate = new Intl.DateTimeFormat(intlLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const day = (value: string) => stayDate.format(new Date(`${value}T00:00:00Z`));
  const issued = new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(data.issuedAt);
  const euros = new Intl.NumberFormat(intlLocale, { style: "currency", currency: "EUR" });

  const beds = [
    apartment.bedsDouble > 0 && tApartment("bedsDouble", { count: apartment.bedsDouble }),
    apartment.bedsSingle > 0 && tApartment("bedsSingle", { count: apartment.bedsSingle }),
    apartment.sofaBeds > 0 && tApartment("sofaBeds", { count: apartment.sofaBeds }),
  ].filter(Boolean);

  const total = payment.total;
  let payLine: string;
  let payNote: string | null;
  switch (payment.kind) {
    case "paid":
      payLine = t("totalPaid", { amount: euros.format(payment.paid) });
      payNote = t("paidNote");
      break;
    case "partial":
      payLine = t("totalStay", { amount: euros.format(total ?? 0) });
      payNote = t("partialNote", {
        paid: euros.format(payment.paid),
        total: euros.format(total ?? 0),
        pending: euros.format(Math.max(0, (total ?? 0) - payment.paid)),
      });
      break;
    default:
      payLine = total == null ? t(pillLabels[payment.kind]) : t("totalStay", { amount: euros.format(total) });
      payNote = payment.kind === "on_arrival" ? t("onArrivalNote") : t("pendingNote");
  }

  const token = data.verificationUrl.split("/").pop() ?? "";
  const shortPath = `/verificar/${token.slice(0, 4)}…${token.slice(-4)}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress(apartment),
  )}`;

  return (
    <Document title={`${t("title")} ${data.code}`} author="Euronest Apartamentos" language={locale}>
      <Page size="A4" style={s.page}>
        {data.test && (
          <View style={s.watermark} fixed>
            {[0, 1, 2].map((index) => (
              <Text key={index} style={s.watermarkText}>
                {t("watermark")}
              </Text>
            ))}
          </View>
        )}

        <View style={s.header}>
          <View>
            <Text style={s.logo}>Euronest</Text>
            <Text style={s.logoSub}>APARTAMENTOS</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.docTitle}>{t("title")}</Text>
            <Text style={s.docCode}>{data.code}</Text>
            <Text style={s.docIssued}>{t("issued", { date: issued })}</Text>
          </View>
        </View>

        <View style={s.status}>
          <CheckIcon />
          <View>
            <Text style={s.statusTitle}>{t("statusConfirmed")}</Text>
            <Text style={s.statusNote}>{t("statusNote")}</Text>
          </View>
        </View>

        <View style={s.card}>
          <View style={s.apt}>
            <Text style={s.label}>{t("accommodation")}</Text>
            <Text style={s.aptName}>{apartment.name}</Text>
            {apartment.address ? (
              <>
                <View style={s.address}>
                  <PinIcon />
                  <Text>{fullAddress(apartment)}</Text>
                </View>
                <Link src={mapsUrl} style={s.mapLink}>
                  {t("openMap")}
                </Link>
              </>
            ) : (
              <View style={s.address}>
                <PinIcon />
                <Text>{apartment.city}</Text>
              </View>
            )}
          </View>
          <View style={s.dates}>
            <DateCell
              label={t("checkIn")}
              value={day(data.checkIn)}
              note={t("checkInFrom", { time: settings.check_in_time })}
            />
            <View style={[s.dateCell, s.dateCellBorder, s.nightsCell]}>
              <Text style={s.label}>{t("stay")}</Text>
              <Text style={[s.big, { color: color.terra700 }]}>{t("nights", { count: data.nights })}</Text>
            </View>
            <DateCell
              label={t("checkOut")}
              value={day(data.checkOut)}
              note={t("checkOutBefore", { time: settings.check_out_time })}
              border
            />
            <DateCell label={t("guests")} value={t("guestsCount", { count: data.guest.count })} border />
          </View>
        </View>

        <View style={s.middle}>
          <View style={s.facts}>
            <Fact first>
              <Text style={s.label}>{t("holder")}</Text>
              <Text style={s.factValue}>{data.guest.fullName}</Text>
              <Text style={s.note}>{t("holderNote")}</Text>
            </Fact>

            <Fact>
              <View style={s.payRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={s.label}>{t("payment")}</Text>
                  <Text style={s.factValue}>{payLine}</Text>
                </View>
                <Text style={[s.pill, pillStyles[payment.kind]]}>{t(pillLabels[payment.kind])}</Text>
              </View>
              {payNote && <Text style={s.note}>{payNote}</Text>}
            </Fact>

            {apartment.rooms != null && (
              <Fact>
                <Text style={s.label}>{t("yourApartment")}</Text>
                <View style={s.layoutRow}>
                  <Text style={s.layoutItem}>{tApartment("rooms", { count: apartment.rooms })}</Text>
                  {apartment.baths != null && (
                    <Text style={s.layoutItem}>{tApartment("baths", { count: apartment.baths })}</Text>
                  )}
                  {apartment.size != null && (
                    <Text style={s.layoutItem}>{tApartment("size", { size: apartment.size })}</Text>
                  )}
                </View>
                {beds.length > 0 && <Text style={s.beds}>{beds.join(" · ")}</Text>}
                {apartment.amenities.length > 0 && (
                  <View style={s.chips}>
                    {apartment.amenities.map((amenity) => (
                      <Text key={amenity} style={s.chip}>
                        {tAmenities(amenity)}
                      </Text>
                    ))}
                  </View>
                )}
              </Fact>
            )}
          </View>

          <View style={s.qrBox}>
            <Link src={data.verificationUrl} style={s.qrFrame}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf, no de HTML */}
              <Image src={qrDataUrl} style={s.qr} />
            </Link>
            <Text style={s.qrTitle}>{t("scan")}</Text>
            <Text style={s.qrNote}>{t("scanNote")}</Text>
            {/* En dos líneas: la dirección de la web puede ser larga. */}
            <Text style={s.qrUrl}>{siteHost}</Text>
            <Text style={[s.qrUrl, { marginTop: 1 }]}>{shortPath}</Text>
          </View>
        </View>

        {/* Dos columnas: horarios y cancelación a la izquierda; las normas, que pueden
            ser muchas, en la columna ancha. Si aun así no cabe, se parte entre páginas. */}
        <View style={s.conditions}>
          <Text style={s.conditionsTitle}>{t("stayInfo")}</Text>
          <View style={s.cols}>
            <View style={s.colNarrow}>
              <Text style={s.colTitle}>{t("schedule")}</Text>
              <Bullets
                items={[
                  t("scheduleIn", { time: settings.check_in_time }),
                  t("scheduleOut", { time: settings.check_out_time }),
                ]}
              />
              <Text style={[s.colTitle, { marginTop: 8 }]}>{t("cancellation")}</Text>
              <Text style={s.colText}>{settings.cancellation_policy}</Text>
            </View>
            <View style={[s.col, s.colGap]}>
              <Text style={s.colTitle}>{t("rules")}</Text>
              <Bullets items={houseRulesList(settings.house_rules)} />
            </View>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>
            {t("help")}
            {"   "}
            <Text style={s.footerStrong}>{settings.phone}</Text>
            {"   "}
            <Text style={s.footerStrong}>{settings.email}</Text>
          </Text>
          <Text>{siteHost}</Text>
        </View>
      </Page>
    </Document>
  );
}
